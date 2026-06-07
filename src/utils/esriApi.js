/**
 * esriApi.js — ArcGIS REST API helpers
 *
 * Used to:
 *   1. Validate that a service URL is reachable and parse its capabilities
 *   2. Exchange Esri OAuth codes for tokens (use server-side in production)
 */

const ESRI_AUTH_URL = 'https://www.arcgis.com/sharing/rest/oauth2'
const CLIENT_ID     = import.meta.env.VITE_ARCGIS_CLIENT_ID
const REDIRECT_URI  = import.meta.env.VITE_ARCGIS_REDIRECT_URI

// ── OAuth ─────────────────────────────────────────────────────────────────────

/**
 * Redirect the user to Esri's OAuth2 authorization page.
 */
export function initiateEsriOAuth() {
  const params = new URLSearchParams({
    client_id:     CLIENT_ID,
    response_type: 'code',
    redirect_uri:  REDIRECT_URI,
    expiration:    '-1',  // non-expiring token for development
  })
  window.location.href = `${ESRI_AUTH_URL}/authorize?${params}`
}

/**
 * Exchange an authorization code for an access token.
 * ⚠️  In production, do this server-side to protect your client_secret.
 */
export async function exchangeEsriCode(code) {
  // POST to your backend: POST /api/auth/esri { code }
  // Your backend calls https://www.arcgis.com/sharing/rest/oauth2/token
  throw new Error('exchangeEsriCode must be implemented server-side. See docs/ESRI_AUTH.md')
}

// ── Service Inspection ────────────────────────────────────────────────────────

/**
 * Fetch and validate an ArcGIS REST service.
 * Returns a structured summary of the service capabilities.
 *
 * @param {string} serviceUrl — e.g. https://services.arcgis.com/.../FeatureServer/0
 * @param {string} [token]    — optional Esri token for private services
 * @returns {Promise<ServiceInfo>}
 */
export async function inspectService(serviceUrl, token = null) {
  const url = new URL(serviceUrl)
  url.searchParams.set('f', 'json')
  if (token) url.searchParams.set('token', token)

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`Service unreachable: HTTP ${res.status}`)

  const data = await res.json()
  if (data.error) throw new Error(`Esri error: ${data.error.message}`)

  return parseServiceInfo(serviceUrl, data)
}

/**
 * Parse raw Esri JSON into a clean ServiceInfo shape.
 */
function parseServiceInfo(url, raw) {
  return {
    url,
    name:             raw.name           || raw.mapName       || 'Untitled Service',
    description:      raw.description    || '',
    serviceType:      detectServiceType(url, raw),
    spatialReference: raw.spatialReference?.wkid
                        ? `EPSG:${raw.spatialReference.wkid}`
                        : raw.spatialReference?.wkt || 'Unknown',
    featureCount:     raw.maxRecordCount || null,
    capabilities:     raw.capabilities  || '',
    fields:           (raw.fields || []).map(f => ({ name: f.name, type: f.type, alias: f.alias })),
    extent:           raw.extent || null,
    geometryType:     raw.geometryType  || null,
    minScale:         raw.minScale      || 0,
    maxScale:         raw.maxScale      || 0,
    supportedFormats: raw.supportedImageFormatTypes || null,
    reachable:        true,
  }
}

function detectServiceType(url, raw) {
  const u = url.toLowerCase()
  if (u.includes('featureserver'))   return 'FeatureLayer'
  if (u.includes('mapserver'))       return 'MapImageLayer'
  if (u.includes('imageserver'))     return 'ImageLayer'
  if (u.includes('sceneserver'))     return 'SceneLayer'
  if (u.includes('vectortileserver'))return 'VectorTileLayer'
  if (u.includes('networkserver'))   return 'Network Dataset'
  if (raw.serviceDataType?.includes('esriImageService')) return 'ImageLayer'
  return 'Unknown'
}

// ── User Profile ──────────────────────────────────────────────────────────────

/**
 * Fetch the authenticated Esri user's profile.
 * Requires a valid Esri access token.
 */
export async function fetchEsriUserProfile(token) {
  const res = await fetch(
    `https://www.arcgis.com/sharing/rest/community/self?f=json&token=${token}`
  )
  const data = await res.json()
  if (data.error) throw new Error(data.error.message)
  return {
    username: data.username,
    fullName: data.fullName,
    email:    data.email,
    org:      data.orgId,
    thumbnail: data.thumbnail
      ? `https://www.arcgis.com/sharing/rest/community/users/${data.username}/info/${data.thumbnail}?token=${token}`
      : null,
  }
}
