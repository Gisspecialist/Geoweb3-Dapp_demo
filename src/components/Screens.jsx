// Stub screens — replace with full implementations as needed.
// Each mirrors the corresponding panel from the widget prototype.

import React from 'react'

// ── MyServices ────────────────────────────────────────────────────────────────
export function MyServices() {
  const services = [
    { id: 42, name: 'NYC Parcel Boundaries 2024', type: 'FeatureLayer',   emoji: '🗺️', reward: 48, hash: '0x7f3a...e91b' },
    { id: 38, name: 'Flood Risk Zones 2024',      type: 'MapImageLayer',  emoji: '🌊', reward: 32, hash: '0xa12c...3f88' },
    { id: 31, name: 'Urban Tree Canopy',           type: 'ImageLayer',     emoji: '🌳', reward: 15, hash: '0x44d1...9a02' },
    { id: 28, name: 'Zoning Districts NYC',        type: 'FeatureLayer',   emoji: '🏗️', reward: 22, hash: '0x9b2e...c17f' },
    { id: 19, name: 'Transit Network 2024',        type: 'Network',        emoji: '🚇', reward: 19, hash: '0xf731...0d4a' },
    { id: 12, name: 'LiDAR Elevation 2023',        type: 'ImageLayer',     emoji: '📡', reward: 11, hash: '0x2e88...7c11' },
  ]
  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 16, fontWeight: 700 }}>My Services</div>
          <div style={{ fontSize: 13, color: 'var(--geo-muted)', marginTop: 3 }}>All minted Esri services — tracked on-chain</div>
        </div>
        <a href="/mint" className="btn btn-primary btn-sm">+ Mint New</a>
      </div>
      <div className="grid3">
        {services.map(s => (
          <div key={s.id} style={{ background: 'var(--geo-card)', border: '1px solid var(--geo-border)', borderRadius: 12, overflow: 'hidden', cursor: 'pointer', transition: 'all .2s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--geo-accent)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--geo-border)'}
          >
            <div style={{ height: 100, background: 'linear-gradient(135deg,#0A0F1A,#1A2335)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, position: 'relative' }}>
              {s.emoji}
              <span style={{ position: 'absolute', bottom: 6, right: 8, fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--geo-accent)' }}>#{String(s.id).padStart(4,'0')}</span>
            </div>
            <div style={{ padding: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{s.name}</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--geo-muted)', marginTop: 2 }}>{s.hash}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--geo-border)' }}>
                <span className="tag tag-teal" style={{ fontSize: 10 }}>{s.type}</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--geo-accent)', fontWeight: 700 }}>+{s.reward} GEOW</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── UpdateMetadata ────────────────────────────────────────────────────────────
export function UpdateMetadata() {
  const [selected, setSelected] = React.useState('')
  const [submitted, setSubmitted] = React.useState(false)
  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 16, fontWeight: 700 }}>Update Metadata</div>
        <div style={{ fontSize: 13, color: 'var(--geo-muted)', marginTop: 3 }}>Modify service metadata — versioned on-chain</div>
      </div>
      <div className="card">
        <div className="card-title" style={{ marginBottom: 12 }}>Select Service to Update</div>
        <select className="form-input" value={selected} onChange={e => { setSelected(e.target.value); setSubmitted(false) }}>
          <option value="">— Select an owned service —</option>
          <option value="42">NFT #0042 — NYC Parcel Boundaries 2024</option>
          <option value="38">NFT #0038 — Flood Risk Zones 2024</option>
          <option value="31">NFT #0031 — Urban Tree Canopy</option>
        </select>
      </div>
      {selected && !submitted && (
        <div className="card fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
            <div className="card-title">Current Metadata — v1.4</div>
            <span className="tag tag-blue">Validated</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-input" rows={2} style={{ resize: 'none' }} defaultValue="Tax parcel boundaries for all NYC boroughs. Updated quarterly from ACRIS." />
            </div>
            <div className="form-group">
              <label className="form-label">Change Summary</label>
              <input className="form-input" placeholder="e.g. Added 2024 Q1 parcels, fixed coordinate issues in Brooklyn…" />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" onClick={() => setSubmitted(true)}>✓ Submit Update (+20 GEOW)</button>
              <button className="btn btn-secondary" onClick={() => setSelected('')}>✕ Cancel</button>
            </div>
          </div>
        </div>
      )}
      {submitted && (
        <div className="card fade-in" style={{ textAlign: 'center', padding: 32 }}>
          <div style={{ fontSize: 40 }}>✅</div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 16, color: 'var(--geo-accent)', margin: '10px 0 4px' }}>Update submitted!</div>
          <div style={{ fontSize: 13, color: 'var(--geo-muted)' }}>Metadata versioned on-chain · +20 GEOW</div>
          <button className="btn btn-secondary btn-sm" style={{ marginTop: 16 }} onClick={() => { setSelected(''); setSubmitted(false) }}>Update Another</button>
        </div>
      )}
    </div>
  )
}

// ── Rewards ───────────────────────────────────────────────────────────────────
export function Rewards() {
  const LEADERBOARD = [
    { rank: 1, handle: 'geo_ninja',     amount: '4,820', color: '#F59E0B' },
    { rank: 2, handle: 'mapmaster_rex', amount: '3,210', color: '#94A3B8' },
    { rank: 3, handle: 'spatial_pro',   amount: '2,950', color: '#B45309' },
    { rank: 4, handle: 'arcgis_kate',   amount: '2,400', color: 'var(--geo-accent2)' },
    { rank: 5, handle: 'datanerd_qc',   amount: '1,890', color: '#A78BFA' },
    { rank: 6, handle: 'tilelord',      amount: '1,740', color: 'var(--geo-success)' },
  ]
  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 16, fontWeight: 700 }}>Rewards &amp; Leaderboard</div>
        <div style={{ fontSize: 13, color: 'var(--geo-muted)', marginTop: 3 }}>Earn GEOW for spatial data contributions</div>
      </div>
      <div className="grid3">
        {[['1,240','GEOW Balance','var(--geo-accent)'], ['+80','This Epoch','var(--geo-accent2)'], ['#14','Global Rank','var(--geo-accent3)']].map(([v,l,c]) => (
          <div key={l} style={{ background: 'var(--geo-panel)', border: '1px solid var(--geo-border)', borderRadius: 10, padding: 14, textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 28, fontWeight: 700, color: c }}>{v}</div>
            <div style={{ fontSize: 12, color: 'var(--geo-muted)', marginTop: 4 }}>{l}</div>
          </div>
        ))}
      </div>
      <div className="grid2">
        <div className="card">
          <div className="card-title" style={{ marginBottom: 12 }}>How Rewards Work</div>
          {[['🪙 Mint new service','+100 GEOW','tag-teal'],['✏️ Metadata update','+20 GEOW','tag-teal'],['📊 Per 10 API calls','+5 GEOW','tag-teal'],['⭐ Quality ≥90%','2× epoch','tag-amber'],['👤 Referral','+50 GEOW','tag-teal']].map(([k,v,t]) => (
            <React.Fragment key={k}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', fontSize: 13 }}>
                <span style={{ color: 'var(--geo-muted)' }}>{k}</span>
                <span className={`tag ${t}`}>{v}</span>
              </div>
              <div className="divider" />
            </React.Fragment>
          ))}
          <button className="btn btn-primary" style={{ marginTop: 12, width: '100%' }}>↓ Claim Pending (80 GEOW)</button>
        </div>
        <div className="card">
          <div className="card-title" style={{ marginBottom: 12 }}>Leaderboard — Epoch 14</div>
          {LEADERBOARD.map(u => (
            <div key={u.rank} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 6px', borderRadius: 6, background: u.rank % 2 === 0 ? 'var(--geo-panel)' : 'transparent' }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 12, width: 20, color: u.color }}>{u.rank}</span>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: `${u.color}22`, color: u.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>{u.handle.slice(0,2).toUpperCase()}</div>
              <span style={{ flex: 1, fontSize: 13 }}>{u.handle}</span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--geo-accent)', fontWeight: 700 }}>{u.amount}</span>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 6px', borderRadius: 6, background: 'rgba(0,212,170,.07)', border: '1px solid rgba(0,212,170,.2)', marginTop: 4 }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 12, width: 20, color: 'var(--geo-accent)' }}>14</span>
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(0,212,170,.15)', color: 'var(--geo-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>YOU</div>
            <span style={{ flex: 1, fontSize: 13, color: 'var(--geo-accent)' }}>you</span>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--geo-accent)', fontWeight: 700 }}>1,240</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── OnChainLog ────────────────────────────────────────────────────────────────
export function OnChainLog() {
  const rows = [
    { tx:'0xfa82...c91d', type:'MINT',   service:'NYC Parcel #0043',    detail:'v1.0 · 2h ago',        reward:'+100' },
    { tx:'0xb82a...f31c', type:'UPDATE', service:'Flood Risk #0038',    detail:'v1.4→v1.5 · 5h ago',   reward:'+20'  },
    { tx:'0xe71c...3a91', type:'REWARD', service:'Weekly epoch #13',    detail:'Distributed · 2d ago', reward:'+80'  },
    { tx:'0xaa3c...9b41', type:'MINT',   service:'Urban Tree #0031',    detail:'v1.0 · 5d ago',        reward:'+100' },
    { tx:'0x77f1...2e88', type:'UPDATE', service:'Parcels #0042',       detail:'v1.2→v1.3 · 7d ago',   reward:'+20'  },
    { tx:'0x9b2e...c17f', type:'MINT',   service:'Zoning #0028',        detail:'v1.0 · 12d ago',       reward:'+100' },
  ]
  const tagMap = { MINT:'tag-teal', UPDATE:'tag-blue', REWARD:'tag-amber' }
  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 16, fontWeight: 700 }}>On-Chain Transaction Log</div>
          <div style={{ fontSize: 13, color: 'var(--geo-muted)', marginTop: 3 }}>Immutable ownership &amp; version history</div>
        </div>
        <button className="btn btn-secondary btn-sm">↗ PolygonScan</button>
      </div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <div className="card-title">All Events</div>
          <span className="tag tag-gray">Polygon Mainnet</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '110px 90px 1fr 1fr 80px', gap: 8, padding: '6px 0', fontSize: 11, color: 'var(--geo-muted)', fontFamily: 'var(--mono)', borderBottom: '1px solid var(--geo-border)' }}>
          <span>TX HASH</span><span>TYPE</span><span>SERVICE</span><span>DETAIL</span><span style={{ textAlign: 'right' }}>GEOW</span>
        </div>
        {rows.map(r => (
          <div key={r.tx} style={{ display: 'grid', gridTemplateColumns: '110px 90px 1fr 1fr 80px', gap: 8, padding: '10px 0', fontSize: 12, borderBottom: '1px solid var(--geo-border)', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--mono)', color: 'var(--geo-muted)' }}>{r.tx}</span>
            <span className={`tag ${tagMap[r.type]}`} style={{ fontSize: 10 }}>{r.type}</span>
            <span>{r.service}</span>
            <span style={{ fontFamily: 'var(--mono)', color: 'var(--geo-muted)' }}>{r.detail}</span>
            <span style={{ fontFamily: 'var(--mono)', color: 'var(--geo-accent)', fontWeight: 700, textAlign: 'right' }}>{r.reward}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
