# F01-pricing PASS_WITH_NOTES Resolution

Verifier: `019df0ed-829d-77b1-8e83-5e0e92e44b90`

## Resolved Now

- Added a `previousArtistSales` maximum of 200 values at the runtime boundary.
- Added validator and API regression tests for excessive `previousArtistSales` arrays.
- Aligned `open/pricing/dataset-schema.json` with runtime material-weight validation by changing `materialWeightKg` from `minimum: 0` to `exclusiveMinimum: 0`.
- Added `dimensions.maxLength: 120` and `previousArtistSales.maxItems: 200` to the open dataset schema.

## Tracked For Later

- `dimensions` remains a free-form string because the product has not defined a semantic grammar. If structured dimensions become necessary, F01 design now tracks a formal grammar TODO.
- The current coverage script enforces the global threshold while the self-check/verifier inspect pricing-specific 100% coverage. A stricter per-file coverage gate should be added when the test runner setup is expanded.
- Production deployments must only trust `x-forwarded-for` behind controlled proxy infrastructure. F01 design now tracks this hardening TODO.
