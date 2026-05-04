# RenewCanvas Impact Estimator

The Phase 1 impact estimator is a deterministic, transparent calculator. It estimates waste diverted, CO2e avoided, landfill volume avoided, and material equivalents from material type and weight.

It is intended for marketplace listings, buyer receipts, and admin review. It is not a certified carbon-credit methodology and must not be used for regulatory reporting without audited factors.

## API Example

```http
POST /api/impact
Content-Type: application/json
```

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

The API returns `kgDiverted`, `co2eAvoidedKg`, `landfillVolumeAvoidedLitres`, `equivalents`, `confidence`, `assumptions`, and `plainLanguageSummary`.

## Methodology

The calculator multiplies each material's weight by published prototype factors in `methodology.md`, then sums the results. Image verification affects confidence only; it does not inflate or reduce impact values.

## Open Artifacts

- `methodology.md`: factor table, assumptions, and limitations.
- `dataset-schema.json`: JSON schema for impact-estimator input rows.
