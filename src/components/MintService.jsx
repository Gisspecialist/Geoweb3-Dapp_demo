import React, { useState } from 'react'
import { inspectService } from '../utils/esriApi'
import { buildServiceMetadata, pinMetadataToIPFS } from '../utils/ipfs'
import { useMintService } from '../hooks/useContracts'
import { useAuthStore } from '../hooks/useAuthStore'

const STEPS = ['Service URL', 'Metadata', 'Licensing', 'Verify', 'Mint!']

const INITIAL = {
  url: '',
  serviceType: 'FeatureLayer',
  title: '',
  description: '',
  spatialRef: 'WGS 1984 (EPSG:4326)',
  updateFreq: 'Quarterly',
  tags: '',
  featureCount: '',
  license: 'CC BY 4.0',
  owner: '',
  royalty: '5',
  attribution: '',
}

export default function MintService() {
  const { displayName, address } = useAuthStore()
  const { mintService, isPending, isConfirming, isSuccess, txHash } = useMintService()

  const [step, setStep]         = useState(1)
  const [form, setForm]         = useState({ ...INITIAL, owner: address || '' })
  const [errors, setErrors]     = useState({})
  const [inspecting, setInspecting] = useState(false)
  const [serviceInfo, setServiceInfo] = useState(null)
  const [ipfsCid, setIpfsCid]   = useState(null)
  const [minting, setMinting]   = useState(false)
  const [mintedTokenId, setMintedTokenId] = useState(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function verifyService() {
    setInspecting(true)
    setErrors({})
    try {
      const info = await inspectService(form.url)
      setServiceInfo(info)
      // Auto-fill detected fields
      setForm(f => ({
        ...f,
        title:       f.title || info.name,
        description: f.description || info.description,
        serviceType: info.serviceType !== 'Unknown' ? info.serviceType : f.serviceType,
        spatialRef:  info.spatialReference || f.spatialRef,
        featureCount: info.featureCount?.toLocaleString() || f.featureCount,
      }))
      setStep(2)
    } catch (err) {
      setErrors({ url: err.message })
    } finally {
      setInspecting(false)
    }
  }


  function suggestMetadata() {
    const type = form.serviceType || 'ArcGIS service'
    const title = form.title || serviceInfo?.name || 'Verified Geospatial Service'
    const detected = serviceInfo?.geometryType ? `${serviceInfo.geometryType} geometry` : 'spatial features'
    setForm(f => ({
      ...f,
      title,
      description: f.description || `Authoritative ${type} containing ${detected}. This service is suitable for community verification, NFT-based ownership tracking, and GEOW reward eligibility.`,
      tags: f.tags || `${type}, ArcGIS, GeoWeb3, verified data, community rewards`,
      updateFreq: f.updateFreq || 'Quarterly',
      attribution: f.attribution || 'ArcGIS service owner / verified contributor',
    }))
  }

  async function prepareAndVerify() {
    // Step 3 → 4: build metadata and pin to IPFS
    const meta = buildServiceMetadata({ ...form, serviceUrl: form.url })
    const cid  = await pinMetadataToIPFS(meta, form.title)
    setIpfsCid(cid)
    setStep(4)
  }

  async function confirmMint() {
    setMinting(true)
    try {
      mintService({ ipfsCid, serviceUrl: form.url })
      // In production: listen for the ServiceMinted event to get tokenId
      setStep(5)
    } catch (err) {
      setErrors({ mint: err.message })
    } finally {
      setMinting(false)
    }
  }

  function reset() {
    setStep(1)
    setForm({ ...INITIAL, owner: address || '' })
    setServiceInfo(null)
    setIpfsCid(null)
    setErrors({})
  }

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 16, fontWeight: 700 }}>Mint Service as NFT</div>
          <div style={{ fontSize: 13, color: 'var(--geo-muted)', marginTop: 3 }}>Register your Esri service on-chain</div>
        </div>
      </div>

      {/* Step dots */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {STEPS.map((label, i) => {
            const n = i + 1
            const done = step > n
            const active = step === n
            return (
              <React.Fragment key={n}>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', margin: '0 auto 4px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700,
                    background: done ? 'rgba(0,212,170,.2)' : active ? 'rgba(59,130,246,.2)' : 'var(--geo-panel)',
                    color: done ? 'var(--geo-accent)' : active ? 'var(--geo-accent2)' : 'var(--geo-muted)',
                    border: `2px solid ${done ? 'var(--geo-accent)' : active ? 'var(--geo-accent2)' : 'var(--geo-border)'}`,
                    transition: 'all .3s',
                  }}>{done ? '✓' : n}</div>
                  <div style={{ fontSize: 10, color: active ? 'var(--geo-text)' : 'var(--geo-muted)' }}>{label}</div>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{ flex: 1, height: 2, background: done ? 'var(--geo-accent)' : 'var(--geo-border)', marginBottom: 20, transition: 'background .3s' }} />
                )}
              </React.Fragment>
            )
          })}
        </div>
      </div>

      {/* Step 1 — Service URL */}
      {step === 1 && (
        <div className="card fade-in">
          <div className="card-title" style={{ marginBottom: 14 }}>Step 1 — Service URL</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">ArcGIS REST Service URL</label>
              <input
                className={`form-input${errors.url ? ' error' : ''}`}
                value={form.url}
                onChange={e => set('url', e.target.value)}
                placeholder="https://services.arcgis.com/.../FeatureServer/0"
              />
              {errors.url && <div className="form-error">{errors.url}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Service Type (override if needed)</label>
              <select className="form-input" value={form.serviceType} onChange={e => set('serviceType', e.target.value)}>
                {['FeatureLayer','MapImageLayer','ImageLayer','SceneLayer','VectorTileLayer','Network Dataset'].map(t =>
                  <option key={t}>{t}</option>
                )}
              </select>
            </div>
            <button className="btn btn-primary" onClick={verifyService} disabled={!form.url || inspecting}>
              {inspecting ? <><span className="spinning">⟳</span> Verifying…</> : <>→ Verify &amp; Continue</>}
            </button>
          </div>
        </div>
      )}

      {/* Step 2 — Metadata */}
      {step === 2 && (
        <div className="card fade-in">
          <div className="card-title" style={{ marginBottom: 14 }}>Step 2 — Metadata</div>
          {serviceInfo && (
            <div style={{ padding: '8px 12px', background: 'rgba(0,212,170,.06)', border: '1px solid rgba(0,212,170,.2)', borderRadius: 8, marginBottom: 12, fontSize: 12, color: 'var(--geo-accent)' }}>
              ✓ Service verified — {serviceInfo.serviceType} · {serviceInfo.featureCount?.toLocaleString() || '?'} features · {serviceInfo.capabilities}
            </div>
          )}
          <button className="btn btn-secondary btn-sm" style={{ marginBottom: 12 }} onClick={suggestMetadata}>✨ Generate AI Metadata Suggestion</button>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Title</label>
              <input className="form-input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="My Service Name" />
            </div>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Description</label>
              <textarea className="form-input" rows={2} style={{ resize: 'none' }} value={form.description} onChange={e => set('description', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Spatial Reference</label>
              <input className="form-input" value={form.spatialRef} onChange={e => set('spatialRef', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Update Frequency</label>
              <select className="form-input" value={form.updateFreq} onChange={e => set('updateFreq', e.target.value)}>
                {['Daily','Weekly','Monthly','Quarterly','Annually','Static'].map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Tags (comma separated)</label>
              <input className="form-input" value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="GIS, parcels, NYC" />
            </div>
            <div className="form-group">
              <label className="form-label">Feature Count (approx.)</label>
              <input className="form-input" value={form.featureCount} onChange={e => set('featureCount', e.target.value)} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button className="btn btn-secondary" onClick={() => setStep(1)}>← Back</button>
            <button className="btn btn-primary" onClick={() => setStep(3)} disabled={!form.title}>→ Continue</button>
          </div>
        </div>
      )}

      {/* Step 3 — Licensing */}
      {step === 3 && (
        <div className="card fade-in">
          <div className="card-title" style={{ marginBottom: 14 }}>Step 3 — Licensing &amp; Ownership</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">License Type</label>
              <select className="form-input" value={form.license} onChange={e => set('license', e.target.value)}>
                {['CC BY 4.0','CC BY-SA 4.0','ODbL 1.0','Public Domain (CC0)','Custom / Proprietary'].map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Owner Wallet Address</label>
              <input className="form-input" value={form.owner} onChange={e => set('owner', e.target.value)} placeholder="0x..." />
            </div>
            <div className="form-group">
              <label className="form-label">Royalty Split on Secondary Sales (%)</label>
              <input className="form-input" type="number" min={0} max={30} value={form.royalty} onChange={e => set('royalty', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Data Source / Attribution</label>
              <input className="form-input" value={form.attribution} onChange={e => set('attribution', e.target.value)} placeholder="e.g. NYC Department of Finance" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button className="btn btn-secondary" onClick={() => setStep(2)}>← Back</button>
            <button className="btn btn-primary" onClick={prepareAndVerify}>→ Continue</button>
          </div>
        </div>
      )}

      {/* Step 4 — Verify */}
      {step === 4 && (
        <div className="card fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
            <div className="card-title">Step 4 — Verification</div>
            <span className="tag tag-green">✓ Ready</span>
          </div>
          {[
            ['Title',          form.title],
            ['Service Type',   form.serviceType],
            ['License',        form.license],
            ['Owner',          form.owner ? form.owner.slice(0,10)+'...' : displayName()],
            ['IPFS CID',       ipfsCid || '…'],
            ['Royalty',        form.royalty + '%'],
            ['Est. Gas',       '~0.003 MATIC'],
            ['GEOW Reward',    '+100 GEOW on mint'],
          ].map(([k, v]) => (
            <React.Fragment key={k}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', fontSize: 13 }}>
                <span style={{ color: 'var(--geo-muted)' }}>{k}</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{v}</span>
              </div>
              <div className="divider" />
            </React.Fragment>
          ))}
          {errors.mint && <div className="form-error" style={{ marginTop: 8 }}>{errors.mint}</div>}
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button className="btn btn-secondary" onClick={() => setStep(3)}>← Back</button>
            <button className="btn btn-primary" onClick={confirmMint} disabled={minting || isPending || isConfirming}>
              {(minting || isPending || isConfirming)
                ? <><span className="spinning">⟳</span> {isConfirming ? 'Confirming…' : 'Minting…'}</>
                : '🪙 Confirm & Mint NFT'}
            </button>
          </div>
        </div>
      )}

      {/* Step 5 — Success */}
      {step === 5 && (
        <div className="card fade-in" style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 52 }}>🎉</div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 18, color: 'var(--geo-accent)', margin: '12px 0 4px' }}>NFT Minted!</div>
          <div style={{ fontSize: 13, color: 'var(--geo-muted)', marginBottom: 16 }}>{form.title}</div>
          {txHash && (
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, padding: '8px 14px', background: 'var(--geo-panel)', borderRadius: 8, display: 'inline-block', color: 'var(--geo-muted)', marginBottom: 12 }}>
              Tx: {txHash.slice(0, 10)}...{txHash.slice(-6)}
            </div>
          )}
          <div><span className="tag tag-teal" style={{ fontSize: 14, padding: '6px 14px' }}>+100 GEOW earned</span></div>
          <div style={{ marginTop: 20, display: 'flex', gap: 8, justifyContent: 'center' }}>
            <button className="btn btn-secondary" onClick={() => window.location.href = '/services'}>View My Services</button>
            <button className="btn btn-primary" onClick={reset}>+ Mint Another</button>
          </div>
        </div>
      )}
    </div>
  )
}
