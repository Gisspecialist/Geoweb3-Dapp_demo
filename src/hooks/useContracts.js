import React from 'react'

// Canvas-safe smart contract adapters.
// The original DApp used wagmi contract hooks. For ChatGPT Canvas/browser preview,
// these hooks simulate blockchain calls locally while preserving the same component API.

export const ADDRESSES = {
  GEOW_TOKEN:   import.meta.env.VITE_GEOW_TOKEN_ADDRESS || '0xCanvasGeowToken',
  SERVICE_NFT:  import.meta.env.VITE_SERVICE_NFT_ADDRESS || '0xCanvasServiceNFT',
  REWARDS:      import.meta.env.VITE_REWARDS_ADDRESS || '0xCanvasRewards',
}

export const SERVICE_NFT_ABI = []
export const GEOW_TOKEN_ABI = []
export const REWARDS_ABI = []

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))
const tx = () => '0x' + Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b => b.toString(16).padStart(2, '0')).join('')

export function useMintService() {
  const [state, setState] = React.useState({ isPending: false, isConfirming: false, isSuccess: false, txHash: null })
  const mintService = async ({ ipfsCid, serviceUrl }) => {
    setState({ isPending: true, isConfirming: false, isSuccess: false, txHash: null })
    await sleep(350)
    const txHash = tx()
    setState({ isPending: false, isConfirming: true, isSuccess: false, txHash })
    await sleep(600)
    const minted = JSON.parse(localStorage.getItem('geoweb3_minted_services') || '[]')
    minted.unshift({ ipfsCid, serviceUrl, txHash, mintedAt: new Date().toISOString() })
    localStorage.setItem('geoweb3_minted_services', JSON.stringify(minted.slice(0, 50)))
    setState({ isPending: false, isConfirming: false, isSuccess: true, txHash })
  }
  return { mintService, ...state }
}

export function useUpdateMetadata() {
  const [state, setState] = React.useState({ isPending: false, isSuccess: false, txHash: null })
  const updateMetadata = async ({ tokenId, newIpfsCid, changeSummary }) => {
    setState({ isPending: true, isSuccess: false, txHash: null })
    await sleep(400)
    const txHash = tx()
    const log = JSON.parse(localStorage.getItem('geoweb3_metadata_updates') || '[]')
    log.unshift({ tokenId, newIpfsCid, changeSummary, txHash, updatedAt: new Date().toISOString() })
    localStorage.setItem('geoweb3_metadata_updates', JSON.stringify(log.slice(0, 50)))
    setState({ isPending: false, isSuccess: true, txHash })
  }
  return { updateMetadata, ...state }
}

export function useOwnerTokens(address) {
  const services = JSON.parse(localStorage.getItem('geoweb3_minted_services') || '[]')
  return { data: address ? services.map((_, i) => BigInt(i + 1)) : [], isLoading: false }
}

export function useGeowBalance(address) {
  return { data: address ? 1240 : 0, isLoading: false }
}

export function useClaimRewards() {
  const [state, setState] = React.useState({ isPending: false, isSuccess: false, txHash: null })
  const claim = async () => {
    setState({ isPending: true, isSuccess: false, txHash: null })
    await sleep(500)
    setState({ isPending: false, isSuccess: true, txHash: tx() })
  }
  return { claim, ...state }
}

