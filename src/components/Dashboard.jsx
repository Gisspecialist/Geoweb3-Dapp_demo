// Dashboard.jsx — stub (full version mirrors the widget UI)
import React from 'react'
export default function Dashboard() {
  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div><div style={{ fontFamily: 'var(--mono)', fontSize: 16, fontWeight: 700 }}>Dashboard</div>
      <div style={{ fontSize: 13, color: 'var(--geo-muted)', marginTop: 3 }}>Your GeoWeb3 activity overview</div></div>
      <div className="grid4">
        {[['1,240','GEOW EARNED','▲ +80 this week','var(--geo-accent)'],['7','NFTS MINTED','2 updated today','var(--geo-accent2)'],['23','API CALLS/DAY','▲ +12%','var(--geo-accent3)'],['18','OSM CLAIMS','5 pending DAO review','var(--geo-accent2)'],['94','QUALITY SCORE','▲ Top 8%','#A78BFA']].map(([v,l,d,c]) => (
          <div key={l} style={{ background: 'var(--geo-panel)', border: '1px solid var(--geo-border)', borderRadius: 10, padding: 12 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 22, fontWeight: 700, color: c }}>{v}</div>
            <div style={{ fontSize: 11, color: 'var(--geo-muted)', marginTop: 4, letterSpacing: .5 }}>{l}</div>
            <div style={{ fontSize: 11, color: 'var(--geo-success)', marginTop: 2 }}>{d}</div>
          </div>
        ))}
      </div>
      <div style={{ background: 'var(--geo-card)', border: '1px solid var(--geo-border)', borderRadius: 12, padding: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>Reward Progress — Current Epoch</div>
        {[['API Contribution','46%'],['Metadata Completeness','94%'],['Service Uptime','99%']].map(([l,p]) => (
          <div key={l} style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: 'var(--geo-muted)' }}>{l}</span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--geo-accent)' }}>{p}</span>
            </div>
            <div className="progress-bar"><div className="progress-fill" style={{ width: p }} /></div>
          </div>
        ))}
      </div>
    </div>
  )
}
