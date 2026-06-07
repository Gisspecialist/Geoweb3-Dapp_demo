import React from 'react'
import { productionApi } from '../utils/productionApi'

const ITEMS = [
  ['Esri OAuth backend', 'Exchanges ArcGIS auth code server-side and loads community/self user profile.'],
  ['OTP email verification', 'Sends one-time code, stores only a hash, links ArcGIS email to wallet.'],
  ['IPFS pinning service', 'Pins ERC-721 metadata through backend-held Pinata JWT.'],
  ['Polygon contracts', 'Deploys GEOW ERC-20, Service NFT, Rewards Engine, and DAO governance.'],
  ['Rewards oracle', 'Backend records API usage and calls RewardsEngine.recordApiCalls on-chain.'],
  ['OSM reward validation', 'Verifies OpenStreetMap changesets/elements, stores reward claims, detects duplicates, and routes disputed claims to DAO review.'],
  ['DAO governance', 'Supports proposal creation, wallet/email vote limiting, quorum, and conflict status.'],
  ['Security controls', 'CORS, Helmet headers, rate limiting, server-side secrets, .env templates.'],
  ['Deployment docs', 'Render/Railway/Fly backend, Vercel/Netlify frontend, Polygon Amoy/mainnet checklist.'],
]

export default function ProductionReadiness() {
  const [health, setHealth] = React.useState(null)
  const [error, setError] = React.useState('')

  async function check() {
    setError('')
    try { setHealth(await productionApi.health()) }
    catch (err) { setError(err.message) }
  }

  React.useEffect(() => { if (productionApi.enabled) check() }, [])

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 16, fontWeight: 700 }}>Production Deployment Center</div>
        <div style={{ fontSize: 13, color: 'var(--geo-muted)', marginTop: 3 }}>Real-world backend, blockchain, IPFS, OTP, ArcGIS OAuth, and DAO readiness.</div>
      </div>

      <div className="card">
        <div className="card-title" style={{ marginBottom: 8 }}>Backend Connection</div>
        <div style={{ fontSize: 13, color: 'var(--geo-muted)', lineHeight: 1.6 }}>
          API base: <code>{productionApi.baseUrl || 'Not configured — set VITE_API_BASE_URL'}</code>
        </div>
        <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={check}>Check Production Backend</button>
        {error && <div className="form-error" style={{ marginTop: 10 }}>{error}</div>}
        {health && <pre style={{ marginTop: 12, whiteSpace: 'pre-wrap', background: 'var(--geo-dark)', padding: 12, borderRadius: 8, fontSize: 11, color: 'var(--geo-muted)' }}>{JSON.stringify(health, null, 2)}</pre>}
      </div>

      <div className="grid2">
        {ITEMS.map(([title, body], idx) => (
          <div className="card" key={title}>
            <div className="card-title">{idx + 1}. {title}</div>
            <p style={{ fontSize: 13, color: 'var(--geo-muted)', lineHeight: 1.5 }}>{body}</p>
            <span className="tag tag-teal">Included in package</span>
          </div>
        ))}
      </div>
    </div>
  )
}
