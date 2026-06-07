import axios from 'axios'
import { productionApi } from './productionApi'

const PINATA_API   = 'https://api.pinata.cloud'
const PINATA_KEY   = import.meta.env.VITE_PINATA_API_KEY
const PINATA_SECRET = import.meta.env.VITE_PINATA_SECRET_KEY
const GATEWAY      = import.meta.env.VITE_IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs/'

/**
 * Build a GeoWeb3 metadata object conforming to ERC-721 + geo extensions.
 * This gets pinned to IPFS and the CID stored in the NFT's tokenURI.
 */
export function buildServiceMetadata({
  title,
  description,
  serviceUrl,
  serviceType,
  spatialReference,
  updateFrequency,
  tags,
  featureCount,
  license,
  owner,
  attribution,
  thumbnailUrl = null,
}) {
  return {
    // ERC-721 standard fields
    name: title,
    description,
    image: thumbnailUrl || `https://geoweb3.app/og/service.png`,
    external_url: serviceUrl,

    // GeoWeb3 extension fields
    attributes: [
      { trait_type: 'Service Type',      value: serviceType },
      { trait_type: 'Spatial Reference', value: spatialReference },
      { trait_type: 'Update Frequency',  value: updateFrequency },
      { trait_type: 'Feature Count',     value: featureCount || 'Unknown' },
      { trait_type: 'License',           value: license },
      { trait_type: 'Attribution',       value: attribution },
    ],
    tags: tags ? tags.split(',').map(t => t.trim()) : [],

    // Provenance
    geo: {
      service_url:       serviceUrl,
      service_type:      serviceType,
      spatial_reference: spatialReference,
      update_frequency:  updateFrequency,
      feature_count:     featureCount,
    },

    // Version tracking — updated on each metadata update tx
    version: '1.0',
    created_at: new Date().toISOString(),
    platform: 'GeoWeb3',
  }
}

/**
 * Pin a JSON metadata object to IPFS via Pinata.
 * Returns the IPFS CID (e.g. "QmXyz...").
 *
 * @param {object} metadata — result of buildServiceMetadata()
 * @param {string} name     — human label for Pinata pin manager
 * @returns {Promise<string>} IPFS CID
 */
export async function pinMetadataToIPFS(metadata, name = 'GeoWeb3 Service') {
  // Production mode: keep Pinata credentials on the backend.
  // Browser-side Pinata keys are kept only for legacy/demo use.
  if (productionApi.enabled) {
    const out = await productionApi.pinMetadata({ metadata, name })
    return out.cid
  }

  if (!PINATA_KEY || PINATA_KEY === 'YOUR_PINATA_API_KEY') {
    // Mock mode for local dev — return a fake CID
    console.warn('[IPFS] Pinata keys not set — returning mock CID')
    return 'QmMock' + Math.random().toString(36).slice(2, 10).toUpperCase()
  }

  const res = await axios.post(
    `${PINATA_API}/pinning/pinJSONToIPFS`,
    {
      pinataContent: metadata,
      pinataMetadata: { name },
      pinataOptions: { cidVersion: 1 },
    },
    {
      headers: {
        pinata_api_key:        PINATA_KEY,
        pinata_secret_api_key: PINATA_SECRET,
        'Content-Type':        'application/json',
      },
    }
  )

  return res.data.IpfsHash
}

/**
 * Build a full gateway URL from a CID.
 */
export function ipfsUrl(cid) {
  return `${GATEWAY}${cid}`
}
