import { createConfig, http } from 'wagmi'
import { polygon, polygonMumbai } from 'wagmi/chains'
import { createWeb3Modal } from '@web3modal/wagmi/react'
import { walletConnect, metaMask, injected } from 'wagmi/connectors'

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_WALLETCONNECT_PROJECT_ID'

const metadata = {
  name: 'GeoWeb3',
  description: 'Esri Service NFT Registry & Contributor Rewards',
  url: 'https://geoweb3.app',
  icons: ['https://geoweb3.app/icon.png'],
}

export const wagmiConfig = createConfig({
  chains: [polygon, polygonMumbai],
  transports: {
    [polygon.id]:      http(import.meta.env.VITE_RPC_URL),
    [polygonMumbai.id]: http(import.meta.env.VITE_RPC_URL_TESTNET),
  },
  connectors: [
    walletConnect({ projectId, metadata }),
    metaMask(),
    injected(),
  ],
})

// Initialize Web3Modal
createWeb3Modal({
  wagmiConfig,
  projectId,
  chains: [polygon, polygonMumbai],
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#00D4AA',
    '--w3m-border-radius-master': '8px',
  },
})
