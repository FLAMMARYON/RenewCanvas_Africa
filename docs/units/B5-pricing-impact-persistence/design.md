# B5 Pricing And Impact Persistence Design

## Scope

B5 connects the existing pricing and impact engines to artwork persistence.

## Data

- `PricingRecommendation` stores the server-calculated price range, suggested price, confidence, factors, explanation, methodology version, and exact engine input.
- `ImpactEstimate` stores the calculated diversion, CO2e, landfill-volume estimate, confidence, assumptions, methodology version, engine input, and full result payload.
- Both tables link to `Artwork` and the artist user, with cascade cleanup when artwork is deleted.

## Calculation

- Artwork creation and update both create new recommendation snapshots.
- Pricing input is derived server-side from persisted artwork fields and artist-supplied complexity/experience context.
- Demand inputs are not accepted from artwork submissions. Stored snapshots force `views: 0`, `wishlistCount: 0`, and `previousArtistSales: []`.
- Impact input is derived from artwork material rows and image verification flags.

## Frontend

- Artist create still calls `/api/pricing` for a preview, then artwork submission stores a server-side recomputation.
- Artist artwork edit pages show the latest pricing and impact snapshots.
- Admin artwork moderation expands each artwork with the latest pricing and impact snapshots for review.
