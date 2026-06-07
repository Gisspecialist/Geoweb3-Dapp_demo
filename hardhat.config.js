import 'dotenv/config'
import '@nomicfoundation/hardhat-ethers'

const accounts = process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : []

export default {
  solidity: {
    version: '0.8.20',
    settings: { optimizer: { enabled: true, runs: 200 } },
  },
  networks: {
    polygonAmoy: {
      url: process.env.POLYGON_AMOY_RPC_URL || process.env.POLYGON_RPC_URL || '',
      accounts,
      chainId: 80002,
    },
    polygon: {
      url: process.env.POLYGON_RPC_URL || '',
      accounts,
      chainId: 137,
    },
  },
}
