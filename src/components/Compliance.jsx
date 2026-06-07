import React from 'react'

const rows = [
  ['Auth flow: Web3 Wallet or Esri OAuth', 'Implemented', 'Auth screen has demo wallet and Esri OAuth/callback mode.'],
  ['Email/ID verification using ArcGIS user profile + OTP', 'Implemented in Canvas mode', 'Account Linking screen loads ArcGIS profile mock/live token path and simulates OTP.'],
  ['Service minting 5-step wizard', 'Implemented', 'Service URL, metadata, licensing/ownership, verification/IPFS, mint confirmation.'],
  ['Ownership tracking', 'Implemented as demo data', 'My Services includes NFT token ID, owner, version, tx, IPFS, and license.'],
  ['Metadata updates and versioning', 'Implemented as demo workflow', 'Update screen logs metadata changes; contract contains on-chain versioning structure.'],
  ['Rewards engine', 'Implemented as demo + Solidity', 'Rewards page, claim button, leaderboard, and RewardsEngine contract are included.'],
  ['On-chain transaction log', 'Implemented as demo data', 'MINT / UPDATE / REWARD event log screen included.'],
  ['DAO/community voting for conflicts', 'Implemented in Canvas mode', 'DAO screen supports disputes, critical issues, and local voting.'],
  ['ArcGIS REST service inspection', 'Implemented', 'Mint and faucet screens validate public ArcGIS REST URLs using f=json.'],
  ['IPFS metadata', 'Implemented as mock pinning', 'Metadata builder exists; Pinata/Web3.Storage still needs production API keys.'],
  ['Polygon/Web3 contracts', 'Partially production-ready', 'Solidity contracts included, but Canvas mode uses mock hooks until RPC/wallets are enabled.'],
  ['AI-assisted metadata suggestions', 'Implemented in Canvas mode', 'Mint screen can generate metadata suggestions locally; production can wire Anthropic/OpenAI.'],
  ['Bitcoin faucet ArcGIS test iteration', 'Implemented as replacement', 'Original uploaded .download was only a Windows shortcut; app includes working faucet simulation.'],
]

export default function Compliance() {
  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 16, fontWeight: 700 }}>PDF Criteria Coverage Check</div>
        <div style={{ fontSize: 13, color: 'var(--geo-muted)', marginTop: 3 }}>This screen maps the application to the criteria from the attached email/PDF.</div>
      </div>
      <div className="card">
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr .45fr 1.45fr', gap: 8, padding: '6px 0', fontSize: 11, color: 'var(--geo-muted)', fontFamily: 'var(--mono)', borderBottom: '1px solid var(--geo-border)' }}>
          <span>CRITERION</span><span>STATUS</span><span>NOTES</span>
        </div>
        {rows.map(([criterion, status, notes]) => (
          <div key={criterion} style={{ display: 'grid', gridTemplateColumns: '1.1fr .45fr 1.45fr', gap: 8, padding: '10px 0', fontSize: 12, borderBottom: '1px solid var(--geo-border)', alignItems: 'center' }}>
            <span>{criterion}</span>
            <span className={`tag ${status.startsWith('Implemented') ? 'tag-teal' : status.startsWith('Partially') ? 'tag-amber' : 'tag-blue'}`}>{status}</span>
            <span style={{ color: 'var(--geo-muted)', lineHeight: 1.5 }}>{notes}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
