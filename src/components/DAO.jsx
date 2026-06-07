import React, { useEffect, useState } from 'react'
import { productionApi } from '../utils/productionApi'
import { useAuthStore } from '../hooks/useAuthStore'

const START = [
  { id: 1, title: 'Verify Flood Risk Zones service ownership', category: 'Ownership conflict', yes: 18, no: 3, status: 'Open', description: 'Two contributors claim the same ArcGIS service. Community verifies authoritative owner.' },
  { id: 2, title: 'Approve higher quality score for Parcels 2024', category: 'Quality bonus', yes: 24, no: 4, status: 'Open', description: 'Reviewer requests a quality score upgrade from 86 to 94 after metadata cleanup.' },
  { id: 3, title: 'Resolve duplicate Urban Tree Canopy metadata', category: 'Metadata dispute', yes: 31, no: 8, status: 'Passed', description: 'DAO members voted to merge duplicate records and preserve the latest IPFS metadata pointer.' },
]

export default function DAO() {
  const { address, displayName } = useAuthStore()
  const [issues, setIssues] = useState(() => JSON.parse(localStorage.getItem('geoweb3_dao_issues') || 'null') || START)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Ownership conflict')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState(productionApi.enabled ? 'Production DAO backend enabled.' : 'Demo DAO mode. Configure VITE_API_BASE_URL for backend vote tracking.')

  useEffect(() => {
    if (!productionApi.enabled) return
    productionApi.listProposals().then(out => {
      if (out.proposals?.length) setIssues(out.proposals)
    }).catch(err => setStatus(`DAO backend load failed: ${err.message}`))
  }, [])

  function save(next) { setIssues(next); localStorage.setItem('geoweb3_dao_issues', JSON.stringify(next)) }

  async function vote(id, field) {
    if (productionApi.enabled) {
      try {
        const out = await productionApi.voteProposal({ id, vote: field, voter: address || displayName() })
        setIssues(issues.map(issue => String(issue.id) === String(id) ? out.proposal : issue))
        setStatus('Vote recorded by backend. Duplicate votes from the same wallet/email are rejected.')
      } catch (err) { setStatus(`Vote failed: ${err.message}`) }
      return
    }
    save(issues.map(issue => issue.id === id ? { ...issue, [field]: issue[field] + 1 } : issue))
  }

  async function createIssue() {
    if (productionApi.enabled) {
      try {
        const out = await productionApi.createProposal({ title, category, description, creator: address || displayName() })
        setIssues([out.proposal, ...issues])
        setTitle(''); setDescription(''); setStatus('Proposal submitted to production DAO backend.')
      } catch (err) { setStatus(`Proposal creation failed: ${err.message}`) }
      return
    }
    const next = [{ id: Date.now(), title, category, description, yes: 0, no: 0, status: 'Open' }, ...issues]
    save(next); setTitle(''); setDescription('')
  }

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 16, fontWeight: 700 }}>DAO + Community Verification</div>
        <div style={{ fontSize: 13, color: 'var(--geo-muted)', marginTop: 3 }}>Resolve conflicts, verify contributors, and vote on critical data-governance issues.</div>
      </div>
      <div className="card"><div className="card-title" style={{ marginBottom: 8 }}>Status</div><div style={{ fontSize: 13, color: 'var(--geo-muted)' }}>{status}</div></div>
      <div className="card">
        <div className="card-title" style={{ marginBottom: 12 }}>Create Verification Issue</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr .8fr', gap: 12 }}>
          <input className="form-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Issue title" />
          <select className="form-input" value={category} onChange={e => setCategory(e.target.value)}>{['Ownership conflict','Metadata dispute','Quality bonus','Reward appeal','Critical community issue'].map(c => <option key={c}>{c}</option>)}</select>
          <textarea className="form-input" rows={2} style={{ gridColumn: 'span 2', resize: 'none' }} value={description} onChange={e => setDescription(e.target.value)} placeholder="Explain what DAO members need to verify or decide." />
        </div>
        <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={createIssue} disabled={!title}>Submit to DAO</button>
      </div>
      <div className="grid2">
        {issues.map(issue => {
          const total = issue.yes + issue.no || 1
          const yesPct = Math.round((issue.yes / total) * 100)
          return <div className="card" key={issue.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'start' }}><div className="card-title">{issue.title}</div><span className={`tag ${issue.status === 'Passed' ? 'tag-teal' : 'tag-blue'}`}>{issue.status}</span></div>
            <div style={{ fontSize: 12, color: 'var(--geo-muted)', marginTop: 6 }}>{issue.category}</div>
            <p style={{ fontSize: 13, color: 'var(--geo-muted)', lineHeight: 1.5 }}>{issue.description}</p>
            <div style={{ height: 8, borderRadius: 99, background: 'var(--geo-dark)', overflow: 'hidden', border: '1px solid var(--geo-border)' }}><div style={{ width: `${yesPct}%`, height: '100%', background: 'var(--geo-accent)' }} /></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginTop: 8, color: 'var(--geo-muted)' }}><span>Yes {issue.yes}</span><span>No {issue.no}</span><span>{yesPct}% approval</span></div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}><button className="btn btn-primary btn-sm" onClick={() => vote(issue.id, 'yes')}>Vote Yes</button><button className="btn btn-secondary btn-sm" onClick={() => vote(issue.id, 'no')}>Vote No</button></div>
          </div>
        })}
      </div>
    </div>
  )
}
