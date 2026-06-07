# GeoWeb3 Demo Credentials and Fake Keys

This package includes `.env.demo` and `.env` with fake/demo credentials so the application can be demonstrated quickly without real Esri, SMTP, Pinata, Polygon, or OpenStreetMap OAuth credentials.

## Important

The included credentials are not real secrets. They are intentionally fake and must not be used for production token payouts, real user verification, or live contract deployment.

## Demo behavior

When `DEMO_MODE=true` and `MOCK_EXTERNAL_SERVICES=true`:

- Esri OAuth token exchange returns a mock ArcGIS profile.
- OTP email delivery prints the code in the backend terminal and returns `devOtp` to the frontend response.
- IPFS pinning returns a mock CID beginning with `bafyDemo`.
- Polygon/rewards oracle calls are recorded off-chain in `backend/data/geoweb3-db.json`.
- OSM validation accepts numeric changeset/node/way/relation IDs without calling the live OSM API unless `OSM_LIVE_VALIDATION=true`.
- DAO votes and OSM reward claims are saved locally in `backend/data/geoweb3-db.json`.

## Windows demo startup

From the folder that contains `package.json`:

```bat
SETUP_DEMO_ENV_WINDOWS.bat
RUN_FULL_DEMO_WINDOWS.bat
```

Then open:

```text
http://127.0.0.1:3000
```

Backend health check:

```text
http://127.0.0.1:8080/health
```

## Replace for production

Before real deployment, replace these values in `.env`:

- `DEMO_MODE=false`
- `MOCK_EXTERNAL_SERVICES=false`
- `ESRI_CLIENT_ID`
- `ESRI_CLIENT_SECRET`
- `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
- `PINATA_JWT`
- `POLYGON_AMOY_RPC_URL` or `POLYGON_RPC_URL`
- `DEPLOYER_PRIVATE_KEY`
- `ORACLE_PRIVATE_KEY`
- `ORACLE_ADDRESS`
- `REWARDS_ENGINE_ADDRESS`
- `VITE_GEOW_TOKEN_ADDRESS`
- `VITE_SERVICE_NFT_ADDRESS`
- `VITE_REWARDS_ADDRESS`
- `VITE_GEOW_DAO_ADDRESS`
- `OSM_USER_AGENT` with a real contact email
- Optional OSM OAuth credentials if account-authorized OSM verification is added

## Demo test values

Use these for quick testing:

- Demo email: `demo.user@geoweb3.example`
- Demo ArcGIS username: `demo_arcgis_user`
- Demo OSM username: `demo_mapper`
- Demo wallet: `0x742d35Cc6634C0532925a3b844Bc454e4438f44e`
- Demo OSM changeset ID: `123456789`
- Demo OSM node ID: `987654321`
