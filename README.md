# GeoWeb3 DApp
## Fast Demo Mode with Fake Credentials

This package includes `.env.demo` and `.env` with fake, replaceable credentials for demonstration. Run `SETUP_DEMO_ENV_WINDOWS.bat` to copy the demo environment, then run `RUN_FULL_DEMO_WINDOWS.bat` to start the backend and frontend together. In demo mode, Esri OAuth, SMTP OTP email, IPFS pinning, Polygon rewards, and OSM validation are mocked so the application can be shown safely without real secrets. See `DEMO_CREDENTIALS_README.md` for details.



**Esri Service NFT Registry & Contributor Rewards Platform**

Mint your ArcGIS / Esri map services as NFTs on Polygon. Earn GEOW tokens for publishing, maintaining, and sharing spatial data services.

---

## Architecture Overview

```
User
 └─ Web3 DApp UI (React + Vite)
      ├─ Auth: Web3 Wallet (wagmi/WalletConnect) OR Esri OAuth2
      └─ API Layer
           ├─ ArcGIS REST API  — service inspection & OAuth
           ├─ IPFS / Pinata    — metadata storage
           └─ Polygon (Smart Contracts)
                ├─ GEOWToken.sol     — ERC-20 reward token
                ├─ ServiceNFT.sol    — ERC-721 service registry
                └─ RewardsEngine.sol — epoch rewards + leaderboard
```

---

## Quick Start

### 1. Clone & install

```bash
git clone https://github.com/your-org/geoweb3-dapp
cd geoweb3-dapp
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env and fill in:
#   VITE_WALLETCONNECT_PROJECT_ID
#   VITE_ARCGIS_CLIENT_ID
#   VITE_PINATA_API_KEY / VITE_PINATA_SECRET_KEY
#   Contract addresses (after deploy)
```

### 3. Deploy contracts (Polygon Mumbai testnet)

```bash
cd contracts
npm install
npx hardhat run scripts/deploy.js --network polygonMumbai
# Copy the printed addresses into your .env
```

### 4. Run the dev server

```bash
npm run dev
# Opens at http://localhost:3000
```

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_RPC_URL` | Polygon Mainnet RPC (Alchemy/Infura) |
| `VITE_RPC_URL_TESTNET` | Polygon Mumbai RPC |
| `VITE_CHAIN_ID` | `137` (mainnet) or `80001` (testnet) |
| `VITE_GEOW_TOKEN_ADDRESS` | Deployed GEOWToken contract address |
| `VITE_SERVICE_NFT_ADDRESS` | Deployed ServiceNFT contract address |
| `VITE_REWARDS_ADDRESS` | Deployed RewardsEngine contract address |
| `VITE_WALLETCONNECT_PROJECT_ID` | From cloud.walletconnect.com |
| `VITE_ARCGIS_CLIENT_ID` | ArcGIS OAuth App ID |
| `VITE_ARCGIS_REDIRECT_URI` | Must match your ArcGIS app settings |
| `VITE_PINATA_API_KEY` | Pinata API key for IPFS pinning |
| `VITE_PINATA_SECRET_KEY` | Pinata secret |

---

## Project Structure

```
geoweb3/
├── src/
│   ├── components/
│   │   ├── AppShell.jsx       — Layout with sidebar + topbar
│   │   ├── AuthScreen.jsx     — Web3 / Esri login
│   │   ├── Dashboard.jsx      — Activity overview
│   │   ├── MintService.jsx    — 5-step minting wizard
│   │   └── Screens.jsx        — MyServices, UpdateMetadata, Rewards, OnChainLog
│   ├── hooks/
│   │   ├── useAuthStore.js    — Zustand auth state (Web3 + Esri)
│   │   └── useContracts.js    — wagmi contract hooks + ABIs
│   ├── utils/
│   │   ├── wagmiConfig.js     — Wagmi + Web3Modal setup
│   │   ├── esriApi.js         — ArcGIS REST inspection + OAuth
│   │   └── ipfs.js            — Pinata IPFS upload + metadata builder
│   ├── styles/
│   │   └── global.css         — Design tokens + utility classes
│   ├── App.jsx                — Router + providers
│   └── main.jsx               — Entry point
├── contracts/
│   └── GeoWeb3.sol            — All 3 contracts (GEOWToken, ServiceNFT, RewardsEngine)
├── .env.example
├── index.html
├── package.json
└── vite.config.js
```

---

## Smart Contracts

Three contracts work together:

### GEOWToken (ERC-20)
- Symbol: `GEOW`, 18 decimals
- Mintable by authorised contracts only (ServiceNFT, RewardsEngine)
- Initial supply: 10M tokens to deployer/DAO treasury

### ServiceNFT (ERC-721)
- Each NFT = one Esri service registration
- `tokenURI` points to IPFS JSON metadata
- On mint: awards **100 GEOW** to minter
- On metadata update: awards **20 GEOW** to owner
- Stores: `ipfsCid`, `serviceUrl`, `version`, `mintedAt`, `updatedAt`

### RewardsEngine
- Weekly epochs with automatic reward calculation
- API call rewards: **5 GEOW per 10 calls** (oracle-reported)
- Quality bonus: **2× epoch rewards** for quality score ≥ 90%
- Users call `claimRewards()` to receive pending GEOW
- On-chain leaderboard via `getLeaderboard(limit)`

### Deploy order
```
1. GEOWToken.deploy()
2. ServiceNFT.deploy(geowToken.address)
3. RewardsEngine.deploy(geowToken.address)
4. geowToken.addMinter(serviceNFT.address)
5. geowToken.addMinter(rewardsEngine.address)
```

---

## NFT Metadata Schema

Stored on IPFS, conforms to ERC-721 metadata standard with geo extensions:

```json
{
  "name": "NYC Parcel Boundaries 2024",
  "description": "Tax parcel boundaries for all NYC boroughs...",
  "image": "https://geoweb3.app/og/service.png",
  "external_url": "https://services.arcgis.com/...",
  "attributes": [
    { "trait_type": "Service Type",      "value": "FeatureLayer" },
    { "trait_type": "Spatial Reference", "value": "EPSG:4326" },
    { "trait_type": "Update Frequency",  "value": "Quarterly" },
    { "trait_type": "License",           "value": "CC BY 4.0" }
  ],
  "geo": {
    "service_url": "https://services.arcgis.com/...",
    "service_type": "FeatureLayer",
    "spatial_reference": "EPSG:4326",
    "update_frequency": "Quarterly"
  },
  "version": "1.0",
  "created_at": "2024-01-01T00:00:00.000Z",
  "platform": "GeoWeb3"
}
```

---

## Auth Flows

### Web3 Wallet
1. User clicks "Web3 Wallet" → wagmi opens MetaMask / WalletConnect
2. On connect: `useAuthStore.loginWithWallet(address, chainId)` 
3. Redirect to `/dashboard`

### Esri OAuth2
1. User clicks "Esri OAuth" → redirect to `arcgis.com/sharing/rest/oauth2/authorize`
2. Esri redirects back to `/auth/callback?code=...`
3. **Exchange code server-side** (keep `client_secret` off frontend)
4. Store token → `useAuthStore.loginWithEsri(code)`

> ⚠️ The Esri token exchange **must** happen server-side in production. See `src/utils/esriApi.js` for the TODO comment and required API call.

---

## API Call Tracking (Oracle)

The RewardsEngine requires an oracle to report API call counts. Implement a backend service that:

1. Monitors ArcGIS service request logs (via your org's usage API)
2. Maintains a mapping of `serviceUrl → ownerWalletAddress`
3. Periodically calls `rewardsEngine.recordApiCalls(ownerAddress, callCount)`

Suggested stack: Node.js cron job, AWS Lambda, or a Chainlink External Adapter.

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit with clear messages
4. Open a PR against `main`

---

## License

MIT — see LICENSE.txt

---

## Roadmap

- [ ] Hardhat contract deployment scripts + tests
- [ ] Chainlink oracle integration for API call tracking  
- [ ] ArcGIS Living Atlas service discovery / import
- [ ] Service marketplace (peer-to-peer NFT transfers)
- [ ] DAO governance for GEOW token holders
- [ ] Mobile app (React Native)
- [ ] STAC/OGC API metadata standard support


## Canvas-ready wiring update

This package has been updated so it will run cleanly in a browser preview/Canvas-style environment without requiring MetaMask, WalletConnect, Polygon RPC, deployed smart contracts, Pinata credentials, or a live Esri OAuth server.

### What was changed

- Added a new **BTC Faucet** screen at `/faucet`.
- Wired the faucet into the top navigation and sidebar.
- Replaced runtime Web3 wallet dependencies with Canvas-safe local adapters that preserve the same mint/update/reward flow.
- Kept ArcGIS REST validation live through `fetch(...?f=json)` when the supplied ArcGIS service allows browser access.
- Added a local faucet ledger using `localStorage` so faucet claims can be created, viewed, and cleared in the browser.
- Changed login to demo wallet / demo Esri modes so the app can open immediately in Canvas.

### Important note about the uploaded faucet file

The uploaded file named `bitcoin_faucet_arcgis(1).download` is not the original faucet HTML source code. It is a Windows shortcut pointing to:

```text
C:\Users\char7755\Downloads\bitcoin_faucet_arcgis.html
```

Because the target HTML file was not included, the original custom faucet code could not be recovered from that upload. A new working faucet module was created and wired into the app as `src/components/BitcoinFaucet.jsx`.

### Run locally

```bash
npm install
npm run dev
```

Then open the local Vite URL and use either:

- **Continue with Demo Wallet**
- **Continue with Esri Demo**

### Build for deployment

```bash
npm run build
npm run preview
```

### Production wiring points

For a real deployment, replace the Canvas-safe mock adapters with production services:

1. **Bitcoin faucet backend** — create a server API that validates CAPTCHA/rate limits, funds testnet BTC from a controlled hot wallet, and returns a real transaction hash.
2. **ArcGIS validation** — keep browser validation for public services, but validate private services on the backend with ArcGIS OAuth tokens.
3. **Smart contracts** — reconnect `src/hooks/useContracts.js` to wagmi or ethers once `VITE_SERVICE_NFT_ADDRESS`, `VITE_GEOW_TOKEN_ADDRESS`, and `VITE_REWARDS_ADDRESS` are deployed.
4. **IPFS** — set Pinata or another IPFS pinning provider in `.env`.
5. **Security** — never expose Bitcoin private keys or Esri OAuth client secrets in frontend code.

## PDF Criteria Recheck Addendum

This Canvas-ready package has been rechecked against the attached Gmail/PDF requirements. In addition to the original auth, minting, ownership tracking, metadata update, rewards, and on-chain log workflows, this version adds:

- Account Linking + OTP Verification screen (`/link`) to demonstrate ArcGIS email/profile verification before wallet linking.
- DAO + Community Verification screen (`/dao`) to demonstrate voting on conflicts, ownership disputes, quality bonuses, and critical community issues.
- Criteria Coverage Check screen (`/compliance`) to show a live in-app matrix against the PDF/email criteria.
- AI Metadata Suggestion button inside the Mint Service workflow.

Production note: these features are Canvas-safe demos using localStorage and mock actions. To go fully live, enable the backend OAuth token exchange, email OTP delivery, deployed Polygon contracts, IPFS pinning keys, and a secure DAO/voting backend or smart-contract module.

---

## Production Deployment Addendum

This package now includes the real-world services needed beyond the Canvas demo:

- Backend Esri OAuth code exchange.
- Backend ArcGIS user/email lookup.
- OTP email verification and wallet/account linking.
- Backend IPFS pinning with Pinata JWT kept off the browser.
- Polygon smart contract deployment with Hardhat.
- Rewards oracle endpoint for API usage rewards.
- DAO/community verification backend and `GeoWeb3DAO` Solidity contract.
- In-app **Production** screen to verify backend readiness.

See `README_PRODUCTION.md` and `docs/PRODUCTION_DEPLOYMENT.md` for exact deployment steps.


## User-Friendly Viewing Skins

This version includes a floating **🎨 Skins** button in the lower-right corner of the application. Users can switch between Geo Dark, Clean Light, Ocean Blue, Forest Green, Desert Amber, and High Contrast viewing modes. The panel also includes text-size controls, spacing controls, and a reduce-motion option. Preferences are saved locally in the browser. See `docs/SKIN_SWITCHER.md` for details.


## OSM Map Reward Tool

This version includes an OpenStreetMap reward workflow so GeoWeb3 can reward public map contributions as well as ArcGIS service publication. The workflow supports:

- OSM changeset, node, way, and relation ID validation.
- OSM username + wallet reward claims.
- Reward scoring by contribution type, feature category, and verification status.
- Duplicate-claim prevention in the backend.
- DAO/community review for unverifiable, disputed, or high-value OSM edits.
- Optional production routing to the rewards oracle for GEOW token payouts after approval.

Run the app and open **OSM Rewards** from the navigation. In prebuilt mode, use `osm-rewards.html` or the floating **🌍 OSM Rewards** launcher.
