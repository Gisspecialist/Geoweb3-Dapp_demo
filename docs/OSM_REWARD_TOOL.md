# GeoWeb3 OSM Map Reward Tool

## Purpose
The OSM Map Reward Tool extends GeoWeb3 so contributors can earn rewards for useful OpenStreetMap edits, validations, and conflict-resolution activities. It is designed to complement the ArcGIS service NFT registry, not replace it.

## Supported inputs
- OSM changeset ID
- OSM node ID
- OSM way ID
- OSM relation ID
- OSM username
- contributor wallet address
- contribution type
- feature category
- service area / community context

## Reward logic
The app estimates GEOW rewards using a transparent scoring model:

- New mapped feature: 80 GEOW base
- Corrected or improved feature: 45 GEOW base
- Added tags / attributes: 35 GEOW base
- Validated another contributor's data: 25 GEOW base
- Helped resolve disputed map edit: 60 GEOW base
- High-value feature bonus: 15 GEOW
- Standard feature bonus: 5 GEOW
- Live OSM verification bonus: 25 GEOW

## Validation workflow
The backend calls the public OSM API to verify whether the referenced changeset or element exists. It records the OSM user, timestamp, tag count, validation status, wallet, and estimated reward. If validation fails or the claim requires review, the backend automatically creates a DAO proposal for community voting.

## Production backend endpoints
- `GET /api/osm/validate?targetType=changeset&targetId=123`
- `POST /api/osm/rewards/submit`
- `GET /api/osm/rewards`

## Anti-abuse controls recommended for production
- Require account linking between email, Esri account, wallet, and OSM username.
- Use OSM OAuth if available for stronger OSM identity verification.
- Reject duplicate claims for the same wallet + OSM target.
- Rate-limit submissions by IP, wallet, and OSM username.
- Route high-value or disputed claims to DAO review before payout.
- Add a human/community verification stage for sensitive features.
- Keep a public audit log of reward decisions and DAO outcomes.

## How it connects to the rest of GeoWeb3
Approved OSM claims can feed the same GEOW Rewards Engine used by ArcGIS API usage and service minting. Verified OSM evidence can also be attached to Service NFT metadata as a supporting source for community validation.
