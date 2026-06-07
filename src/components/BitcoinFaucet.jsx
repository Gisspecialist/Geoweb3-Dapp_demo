import React from 'react'
import { useAuthStore } from '../hooks/useAuthStore'

const DEFAULT_ARCGIS = 'https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Census_Tracts/FeatureServer/0'
const SHORTCUT_TARGET = 'C:\\Users\\char7755\\Downloads\\bitcoin_faucet_arcgis.html'

function randomTx(prefix = 'btc-test') {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return prefix + '-' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

function readLedger() {
  try { return JSON.parse(localStorage.getItem('geoweb3_faucet_ledger') || '[]') }
  catch { return [] }
}

function writeLedger(rows) {
  localStorage.setItem('geoweb3_faucet_ledger', JSON.stringify(rows.slice(0, 30)))
}

export default function BitcoinFaucet() {
  const { address, displayName } = useAuthStore()
  const [wallet, setWallet] = React.useState(address || 'tb1qcanvasdemo000000000000000000000000000')
  const [arcgisUrl, setArcgisUrl] = React.useState(DEFAULT_ARCGIS)
  const [serviceInfo, setServiceInfo] = React.useState(null)
  const [status, setStatus] = React.useState('Ready')
  const [ledger, setLedger] = React.useState(readLedger)
  const [busy, setBusy] = React.useState(false)

  async function validateArcgisService() {
    setBusy(true)
    setStatus('Validating ArcGIS service...')
    try {
      const u = new URL(arcgisUrl)
      u.searchParams.set('f', 'json')
      const res = await fetch(u.toString())
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (data.error) throw new Error(data.error.message)
      const info = {
        name: data.name || data.mapName || 'ArcGIS Service',
        type: arcgisUrl.toLowerCase().includes('featureserver') ? 'FeatureLayer' : arcgisUrl.toLowerCase().includes('mapserver') ? 'MapImageLayer' : 'ArcGIS Service',
        spatialReference: data.spatialReference?.latestWkid || data.spatialReference?.wkid || 'Unknown',
        maxRecordCount: data.maxRecordCount || 'Unknown',
        capabilities: data.capabilities || 'Unknown',
      }
      setServiceInfo(info)
      setStatus(`Validated: ${info.name}`)
      return info
    } catch (err) {
      setStatus(`Validation failed: ${err.message}. You can still run a demo faucet claim.`)
      return null
    } finally {
      setBusy(false)
    }
  }

  async function claimFaucet() {
    setBusy(true)
    setStatus('Preparing faucet claim...')
    const info = serviceInfo || await validateArcgisService()
    await new Promise(resolve => setTimeout(resolve, 650))
    const amountSats = 2500
    const rewardGeow = 10
    const row = {
      id: randomTx(),
      wallet,
      amountSats,
      rewardGeow,
      arcgisName: info?.name || 'Unverified ArcGIS service',
      arcgisUrl,
      createdAt: new Date().toISOString(),
      mode: 'Canvas demo transaction',
    }
    const next = [row, ...readLedger()]
    writeLedger(next)
    setLedger(next)
    setStatus('Faucet claim recorded in the local canvas ledger.')
    setBusy(false)
  }

  function clearLedger() {
    localStorage.removeItem('geoweb3_faucet_ledger')
    setLedger([])
    setStatus('Ledger cleared.')
  }

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 16, fontWeight: 700 }}>Bitcoin Faucet + ArcGIS Connector</div>
          <div style={{ fontSize: 13, color: 'var(--geo-muted)', marginTop: 3 }}>Canvas-safe faucet workflow wired into the GeoWeb3 DApp</div>
        </div>
        <span className="tag tag-amber">Demo / testnet only</span>
      </div>

      <div className="card" style={{ borderColor: 'rgba(245,158,11,.35)' }}>
        <div className="card-title" style={{ marginBottom: 8 }}>Uploaded faucet file status</div>
        <div style={{ fontSize: 13, color: 'var(--geo-muted)', lineHeight: 1.65 }}>
          The uploaded <span className="mono">bitcoin_faucet_arcgis(1).download</span> file is a Windows shortcut, not the actual HTML application. It points to <span className="mono">{SHORTCUT_TARGET}</span>. I wired in a new working faucet component here so the DApp can run in Canvas, but the original HTML file would still be needed to preserve any custom code that was inside it.
        </div>
      </div>

      <div className="grid2">
        <div className="card">
          <div className="card-title" style={{ marginBottom: 14 }}>Faucet Claim</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Bitcoin testnet / wallet address</label>
              <input className="form-input" value={wallet} onChange={e => setWallet(e.target.value)} placeholder="tb1q... or 0x... for demo" />
            </div>
            <div className="form-group">
              <label className="form-label">ArcGIS REST service URL</label>
              <textarea className="form-input" rows={3} value={arcgisUrl} onChange={e => setArcgisUrl(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="btn btn-secondary" onClick={validateArcgisService} disabled={busy}>Validate ArcGIS</button>
              <button className="btn btn-primary" onClick={claimFaucet} disabled={busy || !wallet || !arcgisUrl}>{busy ? <><span className="spinning">⟳</span> Working…</> : '₿ Claim Test Faucet'}</button>
            </div>
            <div className="tag tag-gray" style={{ justifyContent: 'flex-start', whiteSpace: 'normal' }}>{status}</div>
          </div>
        </div>

        <div className="card">
          <div className="card-title" style={{ marginBottom: 14 }}>Connector Result</div>
          {serviceInfo ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {[['Service', serviceInfo.name], ['Type', serviceInfo.type], ['Spatial Ref', serviceInfo.spatialReference], ['Max Records', serviceInfo.maxRecordCount], ['Capabilities', serviceInfo.capabilities]].map(([k,v]) => (
                <React.Fragment key={k}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 13 }}><span className="muted">{k}</span><span className="mono" style={{ textAlign: 'right' }}>{String(v)}</span></div>
                  <div className="divider" />
                </React.Fragment>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 13, color: 'var(--geo-muted)', lineHeight: 1.7 }}>Validate an ArcGIS REST endpoint to bind a faucet claim to a real spatial data service. In production, this is where the backend would check rate limits, CAPTCHA, wallet eligibility, and transaction broadcast status.</div>
          )}
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div className="card-title">Local Faucet Ledger</div>
          <button className="btn btn-secondary btn-sm" onClick={clearLedger}>Clear</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr .9fr .7fr .7fr .9fr', gap: 8, padding: '6px 0', fontSize: 11, color: 'var(--geo-muted)', fontFamily: 'var(--mono)', borderBottom: '1px solid var(--geo-border)' }}>
          <span>TX</span><span>WALLET</span><span>SATS</span><span>GEOW</span><span>TIME</span>
        </div>
        {ledger.length === 0 && <div style={{ padding: 16, fontSize: 13, color: 'var(--geo-muted)' }}>No faucet claims yet.</div>}
        {ledger.map(row => (
          <div key={row.id} style={{ display: 'grid', gridTemplateColumns: '1.2fr .9fr .7fr .7fr .9fr', gap: 8, padding: '10px 0', fontSize: 12, borderBottom: '1px solid var(--geo-border)', alignItems: 'center' }}>
            <span className="mono muted">{row.id.slice(0, 18)}…</span>
            <span className="mono">{row.wallet.slice(0, 10)}…</span>
            <span className="mono accent">{row.amountSats.toLocaleString()}</span>
            <span className="mono accent2">+{row.rewardGeow}</span>
            <span className="mono muted">{new Date(row.createdAt).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
