# F03-impact-estimator Design

## Chosen Approach

Build a deterministic environmental impact calculator under `src/lib/ml/impact.ts` and expose it through a rate-limited `POST /api/impact` endpoint. The calculator accepts material records with type, weight, image-verification state, and optional confidence score. It returns receipt-ready estimates for:

- kg waste diverted
- estimated kg CO2e avoided
- estimated landfill volume avoided in litres
- plain-language material equivalents
- assumptions and methodology version

This is rule-based in Phase 1. ML is not used to calculate environmental impact; later material-vision confidence from F02 can feed `verifiedByImage` and `confidenceScore`.

## Alternatives Considered

- **Use external carbon APIs:** Rejected for Phase 1 because it adds network dependency, cost, and less reproducible estimates.
- **Claim certified emissions savings:** Rejected because current factors are prototype estimates, not audited carbon-credit methodology.
- **Only calculate by total weight:** Rejected because material-specific factors make the output more useful and transparent.

## Data Schema Changes

No database migration in this unit. F03 reuses `MaterialRecord` and `ImpactEstimate` TypeScript schemas from `src/lib/ml/schemas.ts` and publishes an open JSON schema under `open/impact`.

## API Surface

`POST /api/impact`

Request:

```json
{
  "materials": [
    {
      "type": "PET bottles",
      "weightKg": 2.5,
      "verifiedByImage": true,
      "confidenceScore": 0.82
    }
  ]
}
```

Response:

```json
{
  "kgDiverted": 2.5,
  "co2eAvoidedKg": 3.75,
  "landfillVolumeAvoidedLitres": 62.5,
  "equivalents": [],
  "assumptions": [],
  "methodologyVersion": "impact-rule-v1",
  "confidence": "medium",
  "requestId": "impact_..."
}
```

## Model Card

This unit has no trained ML model. The open methodology document acts as the Phase 1 model card: intended use is transparent impact estimation for marketplace listings and receipts; out-of-scope use is certified carbon accounting, regulatory reporting, or automatic fraud decisions.

## Failure Modes

- Unrealistic material weights: reject zero, negative, non-number, or above 250 kg per material and above 500 kg per request.
- Unknown material types: reject with field-level errors.
- Low-confidence image verification: include uncertainty in assumptions and lower confidence, do not block calculation.
- Unsupported environmental claims: label outputs as estimates and publish factors.
- Endpoint abuse: use P0 in-memory rate limiting.

## Rollback Plan

Revert the F03 unit commit. No migrations or persistent data are introduced.

## TODOs Filed For Later Units

- Replace manually entered `verifiedByImage` and `confidenceScore` with F02 material-recognition output.
- Persist impact estimates on artwork records in the data model unit.
- Add certificate hashing in F10 using the finalized impact estimate payload.
- If RenewCanvas needs formal carbon accounting, replace prototype factors with audited regional methodology before using the figures in compliance reports.
