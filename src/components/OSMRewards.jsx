import React, { useMemo, useState } from 'react'
import { validateOsmContribution, submitOsmRewardClaim } from '../utils/productionApi'

const contributionTypes = [
  ['new_feature', 'New mapped feature', 80],
  ['edit_feature', 'Corrected or improved feature', 45],
  ['attribute_update', 'Added tags / attributes', 35],
  ['validation', 'Validated another contributor\'s data', 25],
  ['conflict_resolution', 'Helped resolve a disputed map edit', 60],
]
const targetTypes = [['changeset','OSM changeset'], ['node','OSM node'], ['way','OSM way'], ['relation','OSM relation']]
const featureTypes = ['Road / trail', 'Building', 'Water point', 'Boundary', 'Land use', 'POI / facility', 'Disaster or climate feature', 'Accessibility feature']

function scoreClaim({ contributionType, featureType, validation }) {
  const base = contributionTypes.find(x => x[0] === contributionType)?.[2] || 20
  const featureBonus = ['Boundary', 'Water point', 'Disaster or climate feature', 'Accessibility feature'].includes(featureType) ? 15 : 5
  const verifiedBonus = validation?.valid ? 25 : 0
  return base + featureBonus + verifiedBonus
}

export default function OSMRewards() {
  const [form, setForm] = useState({
    osmUsername: 'sample_mapper',
    walletAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    targetType: 'changeset',
    targetId: '123456789',
    contributionType: 'new_feature',
    featureType: 'POI / facility',
    serviceArea: 'Belize / pilot community',
    description: 'Mapped or improved open geospatial features that can support community verification and rewards.',
  })
  const [validation, setValidation] = useState(null)
  const [status, setStatus] = useState('')
  const [claim, setClaim] = useState(null)

  const estimatedReward = useMemo(() => scoreClaim({ contributionType: form.contributionType, featureType: form.featureType, validation }), [form, validation])
  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  async function runValidation() {
    setStatus('Checking OSM public API and local rules...')
    setValidation(null)
    try {
      const data = await validateOsmContribution(form.targetType, form.targetId)
      setValidation(data)
      setStatus(data.valid ? 'OSM contribution located and ready for reward review.' : 'Could not verify from OSM API. You can still submit for DAO/community review.')
    } catch (err) {
      const fallback = { valid: false, mock: true, error: err.message, message: 'Live OSM validation unavailable; claim can be submitted for DAO review.' }
      setValidation(fallback)
      setStatus(fallback.message)
    }
  }

  async function submitClaim() {
    setStatus('Submitting OSM reward claim...')
    try {
      const payload = { ...form, estimatedReward, validation }
      const data = await submitOsmRewardClaim(payload)
      setClaim(data.claim || data)
      setStatus('OSM reward claim recorded. Production mode can forward it to the rewards oracle and DAO review queue.')
    } catch (err) {
      const local = { id: 'local-osm-' + Date.now(), status: 'Local demo claim', estimatedReward, payload: form, validation }
      const rows = JSON.parse(localStorage.getItem('geoweb3_osm_claims') || '[]')
      localStorage.setItem('geoweb3_osm_claims', JSON.stringify([local, ...rows].slice(0, 50)))
      setClaim(local)
      setStatus('Backend unavailable, so the claim was saved in local demo storage.')
    }
  }

  return <div>
    <div style={styles.hero}>
      <div>
        <div style={styles.kicker}>OpenStreetMap + GeoWeb3</div>
        <h1 style={styles.title}>OSM Map Reward Tool</h1>
        <p style={styles.lead}>Reward contributors for useful OpenStreetMap edits, community validation, and geospatial data improvements. This extends GeoWeb3 beyond ArcGIS services while keeping DAO review, wallet linking, metadata records, and GEOW reward logic in one application.</p>
      </div>
      <div style={styles.rewardCard}>
        <div style={styles.rewardLabel}>Estimated reward</div>
        <div style={styles.rewardValue}>{estimatedReward} GEOW</div>
        <div style={styles.rewardNote}>{validation?.valid ? 'Live OSM verification bonus included' : 'Submit for validation or DAO review'}</div>
      </div>
    </div>

    <div style={styles.grid3}>
      <InfoCard title="Why OSM fits GeoWeb3" body="OSM contributors create public map value. GeoWeb3 can verify changesets or elements, score useful edits, and reward contributors through GEOW tokens." />
      <InfoCard title="How abuse is reduced" body="Claims are checked against OSM IDs, contributor identity, feature tags, local validation rules, rate limits, and DAO/community review for disputes." />
      <InfoCard title="Production role" body="A backend oracle records approved OSM contributions and can trigger token rewards, NFT metadata updates, or DAO proposals." />
    </div>

    <section style={styles.panel}>
      <h2 style={styles.h2}>Submit OSM Contribution</h2>
      <div style={styles.formGrid}>
        <Field label="OSM username"><input value={form.osmUsername} onChange={e=>update('osmUsername', e.target.value)} style={styles.input}/></Field>
        <Field label="Wallet address"><input value={form.walletAddress} onChange={e=>update('walletAddress', e.target.value)} style={styles.input}/></Field>
        <Field label="OSM target type"><select value={form.targetType} onChange={e=>update('targetType', e.target.value)} style={styles.input}>{targetTypes.map(([v,l]) => <option key={v} value={v}>{l}</option>)}</select></Field>
        <Field label="OSM ID / changeset ID"><input value={form.targetId} onChange={e=>update('targetId', e.target.value)} style={styles.input}/></Field>
        <Field label="Contribution type"><select value={form.contributionType} onChange={e=>update('contributionType', e.target.value)} style={styles.input}>{contributionTypes.map(([v,l]) => <option key={v} value={v}>{l}</option>)}</select></Field>
        <Field label="Feature category"><select value={form.featureType} onChange={e=>update('featureType', e.target.value)} style={styles.input}>{featureTypes.map(x => <option key={x}>{x}</option>)}</select></Field>
        <Field label="Service area / community"><input value={form.serviceArea} onChange={e=>update('serviceArea', e.target.value)} style={styles.input}/></Field>
        <Field label="Description"><textarea value={form.description} onChange={e=>update('description', e.target.value)} style={{...styles.input, minHeight: 80}}/></Field>
      </div>
      <div style={styles.actions}>
        <button style={styles.secondaryBtn} onClick={runValidation}>Validate OSM ID</button>
        <button style={styles.primaryBtn} onClick={submitClaim}>Submit Reward Claim</button>
      </div>
      {status && <div style={styles.status}>{status}</div>}
    </section>

    <div style={styles.grid2}>
      <section style={styles.panel}>
        <h2 style={styles.h2}>Validation Result</h2>
        {validation ? <pre style={styles.pre}>{JSON.stringify(validation, null, 2)}</pre> : <p style={styles.muted}>No validation has been run yet. Enter an OSM changeset, node, way, or relation ID and click Validate.</p>}
      </section>
      <section style={styles.panel}>
        <h2 style={styles.h2}>Latest Claim</h2>
        {claim ? <pre style={styles.pre}>{JSON.stringify(claim, null, 2)}</pre> : <p style={styles.muted}>Submitted reward claims will appear here. In production, approved claims can be forwarded to the rewards oracle and DAO queue.</p>}
      </section>
    </div>

    <section style={styles.panel}>
      <h2 style={styles.h2}>Recommended Production Workflow</h2>
      <ol style={styles.list}>
        <li>User links ArcGIS/Esri account, OSM username, email, and wallet.</li>
        <li>User submits an OSM changeset or map element ID with contribution type.</li>
        <li>Backend validates the OSM object, freshness, mapper, tags, geometry type, and duplicate-claim status.</li>
        <li>High-value or disputed edits go to DAO/community verification.</li>
        <li>Approved edits are recorded by the rewards oracle and paid in GEOW tokens.</li>
        <li>Important verified OSM improvements can also be attached to service NFT metadata as supporting community evidence.</li>
      </ol>
    </section>
  </div>
}

function Field({ label, children }) { return <label style={styles.field}><span style={styles.label}>{label}</span>{children}</label> }
function InfoCard({ title, body }) { return <div style={styles.infoCard}><h3 style={styles.h3}>{title}</h3><p style={styles.muted}>{body}</p></div> }

const styles = {
  hero: { display: 'grid', gridTemplateColumns: '1fr 260px', gap: 18, alignItems: 'stretch', marginBottom: 18 },
  kicker: { color: 'var(--geo-accent)', fontFamily: 'var(--mono)', letterSpacing: 1.2, fontSize: 12, textTransform: 'uppercase' },
  title: { margin: '6px 0', fontSize: 32, color: 'var(--geo-text)' },
  lead: { color: 'var(--geo-muted)', lineHeight: 1.55, margin: 0, maxWidth: 920 },
  rewardCard: { background: 'linear-gradient(135deg, rgba(0,212,170,.16), rgba(59,130,246,.14))', border: '1px solid var(--geo-border)', borderRadius: 16, padding: 18, display: 'flex', flexDirection: 'column', justifyContent: 'center' },
  rewardLabel: { color: 'var(--geo-muted)', fontSize: 12, textTransform: 'uppercase', fontFamily: 'var(--mono)' },
  rewardValue: { color: 'var(--geo-accent)', fontSize: 34, fontWeight: 800, fontFamily: 'var(--mono)', marginTop: 6 },
  rewardNote: { color: 'var(--geo-muted)', fontSize: 12, marginTop: 6 },
  grid3: { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12, marginBottom: 12 },
  grid2: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12, marginTop: 12 },
  panel: { background: 'var(--geo-panel)', border: '1px solid var(--geo-border)', borderRadius: 14, padding: 16, marginBottom: 12 },
  infoCard: { background: 'var(--geo-card)', border: '1px solid var(--geo-border)', borderRadius: 14, padding: 14 },
  h2: { margin: '0 0 12px', color: 'var(--geo-text)' },
  h3: { margin: '0 0 8px', color: 'var(--geo-text)', fontSize: 16 },
  muted: { color: 'var(--geo-muted)', lineHeight: 1.5, margin: 0 },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 },
  field: { display: 'flex', flexDirection: 'column', gap: 5 },
  label: { fontSize: 12, color: 'var(--geo-muted)', fontFamily: 'var(--mono)' },
  input: { background: 'var(--geo-card)', border: '1px solid var(--geo-border)', color: 'var(--geo-text)', borderRadius: 10, padding: '10px 12px', fontSize: 14 },
  actions: { display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' },
  primaryBtn: { background: 'var(--geo-accent)', color: '#04201a', border: 'none', borderRadius: 10, padding: '10px 14px', fontWeight: 700, cursor: 'pointer' },
  secondaryBtn: { background: 'transparent', color: 'var(--geo-accent)', border: '1px solid var(--geo-accent)', borderRadius: 10, padding: '10px 14px', fontWeight: 700, cursor: 'pointer' },
  status: { marginTop: 12, color: 'var(--geo-accent2)', fontFamily: 'var(--mono)', fontSize: 12 },
  pre: { background: 'var(--geo-card)', color: 'var(--geo-text)', border: '1px solid var(--geo-border)', borderRadius: 12, padding: 12, overflow: 'auto', maxHeight: 330, fontSize: 12 },
  list: { color: 'var(--geo-muted)', lineHeight: 1.7, margin: 0, paddingLeft: 22 },
}
