import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import nodemailer from 'nodemailer'
import crypto from 'crypto'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { ethers } from 'ethers'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DATA_DIR = path.join(__dirname, 'data')
const DB_FILE = path.join(DATA_DIR, 'geoweb3-db.json')

const app = express()
const PORT = Number(process.env.PORT || 8080)
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://127.0.0.1:3000'
const OTP_SECRET = process.env.OTP_SECRET || crypto.randomBytes(32).toString('hex')
const DEMO_MODE = String(process.env.DEMO_MODE || '').toLowerCase() === 'true'
const MOCK_EXTERNAL_SERVICES = DEMO_MODE || String(process.env.MOCK_EXTERNAL_SERVICES || '').toLowerCase() === 'true'

app.use(helmet())
app.use(cors({ origin: FRONTEND_ORIGIN === '*' ? true : FRONTEND_ORIGIN.split(',').map(s => s.trim()) }))
app.use(express.json({ limit: '2mb' }))
app.use(rateLimit({ windowMs: 60_000, max: 120 }))

async function loadDb() {
  await fs.mkdir(DATA_DIR, { recursive: true })
  try { return JSON.parse(await fs.readFile(DB_FILE, 'utf8')) }
  catch { return { otp: {}, linkedAccounts: [], proposals: [], votes: {}, usage: [], osmRewards: [] } }
}
async function saveDb(db) { await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2)) }
const hmac = (value) => crypto.createHmac('sha256', OTP_SECRET).update(String(value)).digest('hex')
const cleanEmail = (email) => String(email || '').trim().toLowerCase()
function randomOtp() { return String(Math.floor(100000 + Math.random() * 900000)) }

function requireEnv(name) {
  if (!process.env[name]) throw new Error(`${name} is not configured on the backend`)
  return process.env[name]
}

async function sendEmail(to, subject, text) {
  if (MOCK_EXTERNAL_SERVICES || !process.env.SMTP_HOST || String(process.env.SMTP_HOST).includes('demo.')) {
    console.log(`[DEMO OTP EMAIL] To=${to} Subject=${subject}\n${text}`)
    return { devMode: true, demoMode: DEMO_MODE }
  }
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || 'false') === 'true',
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  })
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
  })
  return { devMode: false }
}

app.get('/health', async (_req, res) => {
  res.json({
    ok: true,
    service: 'geoweb3-production-backend',
    timestamp: new Date().toISOString(),
    demoMode: DEMO_MODE,
    mockExternalServices: MOCK_EXTERNAL_SERVICES,
    configured: {
      esriOAuth: Boolean(process.env.ESRI_CLIENT_ID && process.env.ESRI_CLIENT_SECRET),
      smtp: Boolean(process.env.SMTP_HOST),
      pinata: Boolean(process.env.PINATA_JWT),
      polygonRpc: Boolean(process.env.POLYGON_RPC_URL),
      rewardsOracle: Boolean(process.env.REWARDS_ENGINE_ADDRESS && process.env.ORACLE_PRIVATE_KEY),
    },
    note: DEMO_MODE ? 'Demo credentials are loaded. External services are mocked so the app can be demonstrated safely.' : 'Production mode. Replace demo values with live credentials before launch.',
  })
})

app.post('/api/esri/oauth/token', async (req, res) => {
  try {
    const { code, redirectUri } = req.body
    if (!code || !redirectUri) return res.status(400).json({ error: 'code and redirectUri are required' })
    if (MOCK_EXTERNAL_SERVICES || String(process.env.ESRI_CLIENT_ID || '').includes('demo')) {
      return res.json({
        access_token: 'demo-esri-access-token-' + crypto.randomBytes(6).toString('hex'),
        expires_in: 7200,
        username: 'demo_arcgis_user',
        ssl: true,
        demo: true
      })
    }
    const params = new URLSearchParams({
      client_id: requireEnv('ESRI_CLIENT_ID'),
      client_secret: requireEnv('ESRI_CLIENT_SECRET'),
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    })
    const r = await fetch('https://www.arcgis.com/sharing/rest/oauth2/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    })
    const data = await r.json()
    if (!r.ok || data.error) return res.status(502).json({ error: data.error_description || data.error || 'ArcGIS token exchange failed' })
    res.json(data)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.post('/api/esri/user', async (req, res) => {
  try {
    const { token } = req.body
    if (!token) return res.status(400).json({ error: 'token is required' })
    if (MOCK_EXTERNAL_SERVICES || String(token).startsWith('demo-esri-access-token')) {
      return res.json({
        username: 'demo_arcgis_user',
        fullName: 'Demo ArcGIS Contributor',
        email: 'demo.user@geoweb3.example',
        orgId: 'DEMO_ORG_001',
        role: 'org_user',
        privileges: ['features:user:edit', 'portal:user:createItem'],
        demo: true
      })
    }
    const r = await fetch(`https://www.arcgis.com/sharing/rest/community/self?f=json&token=${encodeURIComponent(token)}`)
    const data = await r.json()
    if (!r.ok || data.error) return res.status(502).json({ error: data.error?.message || 'ArcGIS profile lookup failed' })
    res.json(data)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.post('/api/otp/send', async (req, res) => {
  try {
    const email = cleanEmail(req.body.email)
    const walletAddress = String(req.body.walletAddress || '').trim()
    if (!email || !walletAddress) return res.status(400).json({ error: 'email and walletAddress are required' })
    const otp = randomOtp()
    const db = await loadDb()
    db.otp[email] = {
      codeHash: hmac(`${email}:${walletAddress}:${otp}`),
      walletAddress,
      arcgisUsername: req.body.arcgisUsername || null,
      expiresAt: Date.now() + 10 * 60 * 1000,
      attempts: 0,
    }
    await saveDb(db)
    const result = await sendEmail(email, 'GeoWeb3 verification code', `Your GeoWeb3 verification code is ${otp}. It expires in 10 minutes.`)
    res.json({ ok: true, email, devMode: result.devMode, ...(result.devMode ? { devOtp: otp } : {}) })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.post('/api/otp/verify', async (req, res) => {
  try {
    const email = cleanEmail(req.body.email)
    const walletAddress = String(req.body.walletAddress || '').trim()
    const otp = String(req.body.otp || '').trim()
    const db = await loadDb()
    const row = db.otp[email]
    if (!row) return res.status(400).json({ error: 'No active OTP for this email' })
    if (Date.now() > row.expiresAt) return res.status(400).json({ error: 'OTP expired' })
    if (row.attempts >= 5) return res.status(429).json({ error: 'Too many OTP attempts' })
    row.attempts += 1
    const ok = row.walletAddress === walletAddress && row.codeHash === hmac(`${email}:${walletAddress}:${otp}`)
    if (!ok) { await saveDb(db); return res.status(400).json({ error: 'Invalid OTP' }) }
    const linked = { email, walletAddress, profile: req.body.profile || null, linkedAt: new Date().toISOString() }
    db.linkedAccounts = [linked, ...db.linkedAccounts.filter(x => x.email !== email && x.walletAddress !== walletAddress)].slice(0, 5000)
    delete db.otp[email]
    await saveDb(db)
    res.json({ ok: true, linked })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.post('/api/ipfs/pin-json', async (req, res) => {
  try {
    const { metadata, name = 'GeoWeb3 Service Metadata' } = req.body
    if (!metadata) return res.status(400).json({ error: 'metadata is required' })
    if (MOCK_EXTERNAL_SERVICES || !process.env.PINATA_JWT || String(process.env.PINATA_JWT).includes('demo')) {
      const mockCid = 'bafyDemo' + crypto.randomBytes(8).toString('hex')
      return res.json({ ok: true, cid: mockCid, mock: true, demo: DEMO_MODE })
    }
    const r = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.PINATA_JWT}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ pinataContent: metadata, pinataMetadata: { name }, pinataOptions: { cidVersion: 1 } }),
    })
    const data = await r.json()
    if (!r.ok) return res.status(502).json({ error: data.error?.details || data.error || 'Pinata pin failed' })
    res.json({ ok: true, cid: data.IpfsHash, pinata: data })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.get('/api/dao/proposals', async (_req, res) => {
  const db = await loadDb()
  res.json({ proposals: db.proposals || [] })
})

app.post('/api/dao/proposals', async (req, res) => {
  try {
    const { title, category, description, creator } = req.body
    if (!title) return res.status(400).json({ error: 'title is required' })
    const db = await loadDb()
    const proposal = { id: crypto.randomUUID(), title, category, description, creator, yes: 0, no: 0, status: 'Open', createdAt: new Date().toISOString() }
    db.proposals = [proposal, ...(db.proposals || [])].slice(0, 1000)
    await saveDb(db)
    res.json({ ok: true, proposal })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.post('/api/dao/proposals/:id/vote', async (req, res) => {
  try {
    const { id } = req.params
    const vote = req.body.vote === 'no' ? 'no' : 'yes'
    const voter = String(req.body.voter || 'anonymous').toLowerCase()
    const db = await loadDb()
    const proposal = (db.proposals || []).find(p => String(p.id) === String(id))
    if (!proposal) return res.status(404).json({ error: 'Proposal not found' })
    const key = `${id}:${voter}`
    db.votes = db.votes || {}
    if (db.votes[key]) return res.status(409).json({ error: 'This wallet/email already voted on this proposal' })
    db.votes[key] = vote
    proposal[vote] += 1
    const total = proposal.yes + proposal.no
    if (total >= Number(process.env.DAO_QUORUM || 5) && proposal.yes / total >= 0.6) proposal.status = 'Passed'
    await saveDb(db)
    res.json({ ok: true, proposal })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.post('/api/oracle/usage', async (req, res) => {
  try {
    const { serviceId, serviceOwner, callCount = 1 } = req.body
    if (!serviceOwner) return res.status(400).json({ error: 'serviceOwner is required' })
    const db = await loadDb()
    db.usage = [{ serviceId, serviceOwner, callCount, at: new Date().toISOString() }, ...(db.usage || [])].slice(0, 5000)
    await saveDb(db)

    if (!MOCK_EXTERNAL_SERVICES && process.env.POLYGON_RPC_URL && process.env.ORACLE_PRIVATE_KEY && process.env.REWARDS_ENGINE_ADDRESS) {
      const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL)
      const signer = new ethers.Wallet(process.env.ORACLE_PRIVATE_KEY, provider)
      const abi = ['function recordApiCalls(address serviceOwner,uint256 callCount) external']
      const contract = new ethers.Contract(process.env.REWARDS_ENGINE_ADDRESS, abi, signer)
      const tx = await contract.recordApiCalls(serviceOwner, callCount)
      return res.json({ ok: true, txHash: tx.hash })
    }
    res.json({ ok: true, mock: true, message: 'Usage recorded off-chain. Configure oracle env vars to submit to Polygon.' })
  } catch (err) { res.status(500).json({ error: err.message }) }
})



const OSM_TARGETS = new Set(['changeset', 'node', 'way', 'relation'])
function osmRewardScore(payload = {}, validation = {}) {
  const base = {
    new_feature: 80,
    edit_feature: 45,
    attribute_update: 35,
    validation: 25,
    conflict_resolution: 60,
  }[payload.contributionType] || 20
  const highValue = new Set(['Boundary', 'Water point', 'Disaster or climate feature', 'Accessibility feature'])
  const featureBonus = highValue.has(payload.featureType) ? 15 : 5
  const verifiedBonus = validation.valid ? 25 : 0
  return base + featureBonus + verifiedBonus
}
async function validateOsmTarget(targetType, targetId) {
  targetType = String(targetType || '').trim().toLowerCase()
  targetId = String(targetId || '').trim()
  if (!OSM_TARGETS.has(targetType)) throw new Error('targetType must be changeset, node, way, or relation')
  if (!/^\d+$/.test(targetId)) throw new Error('targetId must be numeric')
  if (MOCK_EXTERNAL_SERVICES && String(process.env.OSM_LIVE_VALIDATION || 'false').toLowerCase() !== 'true') {
    return {
      valid: true,
      demo: true,
      targetType,
      targetId,
      url: `https://www.openstreetmap.org/${targetType}/${targetId}`,
      httpStatus: 200,
      osmUser: process.env.DEMO_OSM_USERNAME || 'demo_mapper',
      timestamp: new Date().toISOString(),
      tagCount: 7,
      checkedAt: new Date().toISOString(),
      message: 'Demo validation accepted. Set OSM_LIVE_VALIDATION=true for live OpenStreetMap API checks.'
    }
  }
  const url = targetType === 'changeset'
    ? `https://api.openstreetmap.org/api/0.6/changeset/${targetId}`
    : `https://api.openstreetmap.org/api/0.6/${targetType}/${targetId}`
  const r = await fetch(url, { headers: { 'User-Agent': process.env.OSM_USER_AGENT || 'GeoWeb3-DApp/1.0' } })
  const xml = await r.text()
  if (!r.ok || /<error>|not found|gone/i.test(xml)) {
    return { valid: false, targetType, targetId, url, httpStatus: r.status, message: 'OSM object was not found or is unavailable.' }
  }
  const user = (xml.match(/user="([^"]+)"/) || [])[1] || null
  const timestamp = (xml.match(/created_at="([^"]+)"/) || xml.match(/timestamp="([^"]+)"/) || [])[1] || null
  const tagCount = (xml.match(/<tag\s/g) || []).length
  return { valid: true, targetType, targetId, url, httpStatus: r.status, osmUser: user, timestamp, tagCount, checkedAt: new Date().toISOString() }
}

app.get('/api/osm/validate', async (req, res) => {
  try {
    const result = await validateOsmTarget(req.query.targetType, req.query.targetId)
    res.json(result)
  } catch (err) { res.status(400).json({ valid: false, error: err.message }) }
})

app.post('/api/osm/rewards/submit', async (req, res) => {
  try {
    const payload = req.body || {}
    if (!payload.walletAddress) return res.status(400).json({ error: 'walletAddress is required' })
    if (!payload.osmUsername) return res.status(400).json({ error: 'osmUsername is required' })
    let validation = payload.validation
    if (!validation && payload.targetType && payload.targetId) validation = await validateOsmTarget(payload.targetType, payload.targetId)
    validation = validation || { valid: false, message: 'No OSM validation provided.' }
    const estimatedReward = osmRewardScore(payload, validation)
    const db = await loadDb()
    const duplicate = (db.osmRewards || []).find(x => x.targetType === payload.targetType && String(x.targetId) === String(payload.targetId) && x.walletAddress === payload.walletAddress)
    if (duplicate) return res.status(409).json({ error: 'This wallet already submitted a claim for that OSM target.', duplicate })
    const claim = {
      id: crypto.randomUUID(),
      status: validation.valid ? 'Verified - Pending Oracle/DAO Approval' : 'Pending DAO Review',
      osmUsername: payload.osmUsername,
      walletAddress: payload.walletAddress,
      targetType: payload.targetType,
      targetId: String(payload.targetId || ''),
      contributionType: payload.contributionType,
      featureType: payload.featureType,
      serviceArea: payload.serviceArea,
      description: payload.description,
      estimatedReward,
      validation,
      createdAt: new Date().toISOString(),
    }
    db.osmRewards = [claim, ...(db.osmRewards || [])].slice(0, 5000)
    if (claim.status.includes('DAO')) {
      db.proposals = db.proposals || []
      db.proposals.unshift({
        id: crypto.randomUUID(),
        title: `Review OSM reward claim ${claim.targetType}/${claim.targetId}`,
        category: 'OSM Reward Verification',
        description: `Community review requested for ${claim.osmUsername}: ${claim.description || 'No description provided.'}`,
        creator: claim.walletAddress,
        yes: 0,
        no: 0,
        status: 'Open',
        linkedClaimId: claim.id,
        createdAt: new Date().toISOString(),
      })
    }
    await saveDb(db)
    res.json({ ok: true, claim })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.get('/api/osm/rewards', async (_req, res) => {
  const db = await loadDb()
  res.json({ claims: db.osmRewards || [] })
})

app.listen(PORT, () => console.log(`GeoWeb3 backend listening on :${PORT}`))
