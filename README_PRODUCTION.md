# GeoWeb3 DApp — Production-Ready Package

This version wires in the real-world deployment components requested: Esri OAuth backend, OTP email delivery, IPFS pinning, Polygon contracts, rewards oracle, and DAO/community voting.

## Quick start on Windows

Run these commands from the folder containing `package.json`:

```bat
copy .env.example .env
npm config set registry https://registry.npmjs.org/
npm install
npm run backend
npm run dev
```

Frontend: `http://127.0.0.1:3000`  
Backend health check: `http://127.0.0.1:8080/health`

## What is now included

- `backend/server.js` — Express backend for Esri OAuth, OTP, IPFS, DAO, and rewards oracle.
- `src/utils/productionApi.js` — frontend API client.
- `src/components/ProductionReadiness.jsx` — in-app deployment status screen.
- `src/contracts/GeoWeb3.sol` — GEOW token, Service NFT, Rewards Engine, and DAO contract.
- `scripts/deploy.js` — Hardhat deployment script.
- `hardhat.config.js` — Polygon Amoy and Polygon mainnet network configuration.
- `docs/PRODUCTION_DEPLOYMENT.md` — deployment checklist.

## Development vs production behavior

If `VITE_API_BASE_URL` is not set, the app continues to run as a Canvas/local demo. If it is set, these functions use the backend:

- Account linking OTP
- IPFS metadata pinning
- DAO proposal creation and voting
- Backend health checks

If backend secrets such as `PINATA_JWT` or SMTP credentials are missing, the backend returns safe dev-mode responses rather than exposing secrets in the browser.
