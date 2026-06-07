const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

async function request(path, options = {}) {
  if (!API_BASE) throw new Error('Production API is not configured. Set VITE_API_BASE_URL to your deployed backend URL.')
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `Request failed with HTTP ${res.status}`)
  return data
}

export const productionApi = {
  enabled: Boolean(API_BASE),
  baseUrl: API_BASE,
  health: () => request('/health'),
  sendOtp: ({ email, walletAddress, arcgisUsername }) => request('/api/otp/send', {
    method: 'POST', body: JSON.stringify({ email, walletAddress, arcgisUsername })
  }),
  verifyOtp: ({ email, walletAddress, otp, profile }) => request('/api/otp/verify', {
    method: 'POST', body: JSON.stringify({ email, walletAddress, otp, profile })
  }),
  esriTokenExchange: ({ code, redirectUri }) => request('/api/esri/oauth/token', {
    method: 'POST', body: JSON.stringify({ code, redirectUri })
  }),
  esriUser: ({ token }) => request('/api/esri/user', {
    method: 'POST', body: JSON.stringify({ token })
  }),
  pinMetadata: ({ metadata, name }) => request('/api/ipfs/pin-json', {
    method: 'POST', body: JSON.stringify({ metadata, name })
  }),
  listProposals: () => request('/api/dao/proposals'),
  createProposal: ({ title, category, description, creator }) => request('/api/dao/proposals', {
    method: 'POST', body: JSON.stringify({ title, category, description, creator })
  }),
  voteProposal: ({ id, vote, voter }) => request(`/api/dao/proposals/${id}/vote`, {
    method: 'POST', body: JSON.stringify({ vote, voter })
  }),
  recordUsage: ({ serviceId, serviceOwner, callCount }) => request('/api/oracle/usage', {
    method: 'POST', body: JSON.stringify({ serviceId, serviceOwner, callCount })
  }),
}


export async function validateOsmContribution(targetType, targetId) {
  if (!API_BASE) {
    const id = String(targetId || '').trim()
    return {
      valid: Boolean(id),
      mock: true,
      targetType,
      targetId: id,
      message: id ? 'Local demo validation accepted the OSM reference. Configure VITE_API_BASE_URL for live backend validation.' : 'Missing OSM ID.'
    }
  }
  return request(`/api/osm/validate?targetType=${encodeURIComponent(targetType)}&targetId=${encodeURIComponent(targetId)}`)
}

export async function submitOsmRewardClaim(payload) {
  if (!API_BASE) {
    const claim = {
      id: 'local-osm-' + Date.now(),
      status: 'Local Demo Pending DAO Review',
      estimatedReward: payload.estimatedReward || 0,
      createdAt: new Date().toISOString(),
      payload,
    }
    const existing = JSON.parse(localStorage.getItem('geoweb3_osm_claims') || '[]')
    localStorage.setItem('geoweb3_osm_claims', JSON.stringify([claim, ...existing].slice(0, 50)))
    return { ok: true, claim, mock: true }
  }
  return request('/api/osm/rewards/submit', { method: 'POST', body: JSON.stringify(payload) })
}
