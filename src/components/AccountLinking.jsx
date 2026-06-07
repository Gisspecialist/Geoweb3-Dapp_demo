import React, { useState } from 'react'
import { fetchEsriUserProfile } from '../utils/esriApi'
import { productionApi } from '../utils/productionApi'
import { useAuthStore } from '../hooks/useAuthStore'

function makeOtp() { return String(Math.floor(100000 + Math.random() * 900000)) }

export default function AccountLinking() {
  const { address, esriUser, esriToken } = useAuthStore()
  const [profile, setProfile] = useState(esriUser || null)
  const [email, setEmail] = useState(esriUser?.email || 'user@org.com')
  const [wallet, setWallet] = useState(address || '0x742d35Cc6634C0532925a3b844Bc454e4438f44e')
  const [otp, setOtp] = useState('')
  const [typedOtp, setTypedOtp] = useState('')
  const [linked, setLinked] = useState(false)
  const [status, setStatus] = useState(productionApi.enabled ? 'Production API detected. OTP will be sent by the backend.' : 'Canvas demo mode. Configure VITE_API_BASE_URL to use real OTP/account linking.')
  const [loading, setLoading] = useState(false)

  async function loadArcGISProfile() {
    setLoading(true)
    try {
      if (productionApi.enabled && esriToken && !esriToken.startsWith('esri_mock')) {
        const data = await productionApi.esriUser({ token: esriToken })
        setProfile(data); setEmail(data.email || email)
        setStatus('ArcGIS profile loaded through the production backend.')
      } else if (esriToken && !esriToken.startsWith('esri_mock')) {
        const data = await fetchEsriUserProfile(esriToken)
        setProfile(data); setEmail(data.email || email)
        setStatus('ArcGIS profile loaded directly. Production should proxy this through the backend.')
      } else {
        const mock = { username: 'esri_user', fullName: 'Esri User', email: email || 'user@org.com', org: 'DemoOrg' }
        setProfile(mock)
        setStatus('Demo ArcGIS profile loaded. Production uses ArcGIS OAuth + community/self through the backend.')
      }
    } catch (err) { setStatus(`ArcGIS profile lookup failed: ${err.message}`) }
    finally { setLoading(false) }
  }

  async function sendOtp() {
    setLinked(false)
    if (productionApi.enabled) {
      setLoading(true)
      try {
        const out = await productionApi.sendOtp({ email, walletAddress: wallet, arcgisUsername: profile?.username })
        if (out.devOtp) setTypedOtp(out.devOtp)
        setStatus(out.devMode ? `Backend dev mode generated OTP for ${email}. In SMTP production, the code is emailed only.` : `OTP sent to ${email}.`)
      } catch (err) { setStatus(`OTP send failed: ${err.message}`) }
      finally { setLoading(false) }
      return
    }
    const code = makeOtp(); setOtp(code); setTypedOtp(code)
    setStatus(`Demo OTP generated for ${email}. Real deployment uses backend email delivery and hashed OTP storage.`)
  }

  async function verifyAndLink() {
    if (productionApi.enabled) {
      setLoading(true)
      try {
        const out = await productionApi.verifyOtp({ email, walletAddress: wallet, otp: typedOtp, profile })
        localStorage.setItem('geoweb3_account_link', JSON.stringify(out.linked))
        setLinked(true); setStatus('Verified by backend and linked. This account can now receive rewards and vote.')
      } catch (err) { setStatus(`OTP verification failed: ${err.message}`) }
      finally { setLoading(false) }
      return
    }
    if (!otp || typedOtp !== otp) { setStatus('OTP verification failed. Check the six-digit code and try again.'); return }
    const record = { email, wallet, profile, linkedAt: new Date().toISOString() }
    localStorage.setItem('geoweb3_account_link', JSON.stringify(record))
    setLinked(true); setStatus('Verified and linked in demo storage. Production uses the backend account-link registry.')
  }

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 16, fontWeight: 700 }}>Account Linking + OTP Verification</div>
        <div style={{ fontSize: 13, color: 'var(--geo-muted)', marginTop: 3 }}>Link an ArcGIS identity/email to a wallet before rewards, faucet claims, and voting.</div>
      </div>
      <div className="grid2">
        <div className="card">
          <div className="card-title" style={{ marginBottom: 12 }}>1. ArcGIS User Lookup</div>
          <button className="btn btn-secondary" onClick={loadArcGISProfile} disabled={loading}>{loading ? 'Loading…' : 'Load ArcGIS Profile'}</button>
          <div className="divider" style={{ margin: '12px 0' }} />
          <div style={{ display: 'grid', gap: 10 }}>
            <label className="form-label">Verified Email</label>
            <input className="form-input" value={email} onChange={e => setEmail(e.target.value)} />
            <label className="form-label">Wallet Address</label>
            <input className="form-input" value={wallet} onChange={e => setWallet(e.target.value)} />
          </div>
        </div>
        <div className="card">
          <div className="card-title" style={{ marginBottom: 12 }}>2. Send OTP + Link</div>
          <div style={{ display: 'grid', gap: 10 }}>
            <button className="btn btn-primary" onClick={sendOtp} disabled={!email || loading}>{productionApi.enabled ? 'Send Backend OTP' : 'Send Demo OTP'}</button>
            <label className="form-label">OTP Code</label>
            <input className="form-input" value={typedOtp} onChange={e => setTypedOtp(e.target.value)} placeholder="Six-digit code" />
            <button className="btn btn-primary" onClick={verifyAndLink} disabled={!typedOtp || !wallet || loading}>Verify & Link Account</button>
            <div className={`tag ${linked ? 'tag-teal' : 'tag-blue'}`} style={{ width: 'fit-content' }}>{linked ? 'Linked' : 'Pending verification'}</div>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-title" style={{ marginBottom: 8 }}>Status</div>
        <div style={{ fontSize: 13, color: 'var(--geo-muted)', lineHeight: 1.6 }}>{status}</div>
        {profile && <pre style={{ marginTop: 12, whiteSpace: 'pre-wrap', background: 'var(--geo-dark)', padding: 12, borderRadius: 8, fontSize: 11, color: 'var(--geo-muted)' }}>{JSON.stringify(profile, null, 2)}</pre>}
      </div>
    </div>
  )
}
