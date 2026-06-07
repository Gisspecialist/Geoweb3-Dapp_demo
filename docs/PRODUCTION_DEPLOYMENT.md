# GeoWeb3 Production Deployment Guide

This package now includes the production services needed to move beyond the Canvas demo:

1. **Esri OAuth token exchange** through `backend/server.js` so the browser never holds the Esri client secret.
2. **ArcGIS user/email lookup** through `/api/esri/user` using the ArcGIS `community/self` endpoint.
3. **OTP email verification** through `/api/otp/send` and `/api/otp/verify`, with server-side HMAC OTP storage and expiration.
4. **IPFS metadata pinning** through `/api/ipfs/pin-json`, keeping the Pinata JWT on the backend.
5. **Polygon smart contract deployment** through Hardhat and `scripts/deploy.js`.
6. **Rewards oracle endpoint** through `/api/oracle/usage` to submit API-usage rewards to `RewardsEngine.recordApiCalls`.
7. **DAO/community verification backend** through `/api/dao/proposals` and `/api/dao/proposals/:id/vote`.
8. **On-chain DAO contract** `GeoWeb3DAO` for token-weighted community governance.

## Local production-style run

```bash
cp .env.example .env
npm install
npm run backend
npm run dev
```

Open the frontend at `http://127.0.0.1:3000` and the backend health check at `http://127.0.0.1:8080/health`.

## Contract deployment order

```bash
npm run compile:contracts
npm run deploy:contracts
```

Deployment creates `deploy/polygonAmoy.json` containing:

- `GEOW_TOKEN`
- `SERVICE_NFT`
- `REWARDS_ENGINE`
- `GEOW_DAO`

Copy these values into `.env` as the matching `VITE_*` variables and set `REWARDS_ENGINE_ADDRESS` for the backend oracle.

## Recommended live hosting layout

- **Frontend:** Vercel, Netlify, Cloudflare Pages, or static hosting from `/dist`.
- **Backend:** Render, Railway, Fly.io, Azure App Service, AWS Elastic Beanstalk, or a small VPS.
- **Blockchain:** Polygon Amoy testnet first, then Polygon mainnet after security review.
- **Secrets:** keep Esri client secret, SMTP password, Pinata JWT, deployer private key, and oracle private key only in backend/CI secret storage.

## Minimum production security checklist

- Rotate all private keys before mainnet deployment.
- Use a dedicated deployer wallet and a separate rewards oracle wallet.
- Put the backend behind HTTPS.
- Restrict `FRONTEND_ORIGIN` to your actual deployed frontend domain.
- Use a persistent database for account links, proposals, votes, and audit logs before public launch.
- Add contract tests, frontend tests, and an external Solidity audit before holding real-value assets.
- Replace development SMTP with a transactional email provider.
- Verify contracts on Polygonscan after deployment.

## Offline/local Solidity compile option

If Hardhat cannot download the Solidity compiler because of a proxy or offline environment, run:

```bash
npm run compile:contracts:local
```

This uses the bundled `solc` package and writes ABI/bin files into `artifacts-solc/`.
