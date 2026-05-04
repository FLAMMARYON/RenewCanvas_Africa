# F03-impact-estimator Self-Check

## Commands Run

| Check | Command | Result |
| --- | --- | --- |
| Unit tests | `npm test` | PASS: 46 tests passed |
| Coverage | `npm run test:coverage` | PASS: 99.72% line coverage overall; impact module 100% line coverage |
| Type-check | `npm run typecheck` | PASS |
| Lint | `npm run lint` | PASS: zero warnings |
| Security audit | `npm run security:audit` | PASS for high/critical; npm reports 2 moderate transitive Next/PostCSS findings |
| Production build | `npm run build` | PASS |

## Checklist

- All tests pass: PASS. 46 tests passed.
- Lint, type-check, and coverage pass: PASS.
- Security scan shows no high or critical findings: PASS.
- Accessibility audit: NOT APPLICABLE. F03 adds API and open docs only; no UI.
- API latency budget: PASS by local unit/route execution; no load test yet.
- Documentation present: PASS. See `open/impact/README.md`, `open/impact/methodology.md`, and `open/impact/dataset-schema.json`.
- Open-source artifacts present: PASS.

## API Assertions

- Valid material payload returns `200`.
- Response includes `kgDiverted`, `co2eAvoidedKg`, `landfillVolumeAvoidedLitres`, `equivalents`, `confidence`, `assumptions`, `plainLanguageSummary`, `methodologyVersion`, and `requestId`.
- Response includes rate-limit headers.
- Malformed JSON returns `400`.
- Unknown materials are rejected.
- String/boolean/null numeric coercion is rejected.
- Non-boolean `verifiedByImage` is rejected.
- Invalid confidence scores are rejected.
- Unsupported environmental claim fields are rejected.
- More than 50 material rows are rejected.
- Weights below 0.001 kg are rejected to avoid zero-value receipt output.
- Per-material weights above 250 kg are rejected.
- Total request weight above 500 kg is rejected.
- Gram-scale rows are summed before rounding, preserving small material totals.
- Single accepted gram-scale rows remain visible in receipt totals and plain-language summaries.
- Low image-confidence rows add a manual-review assumption.
- Repeated identical material equivalents are aggregated into a single equivalent row.
- Image-verified materials missing confidence scores add a manual-review assumption.
- Repeated requests from one IP return `429`.

## Notes

- Impact estimation is deterministic and rule-based for Phase 1, not trained ML.
- The factors are transparent prototype factors and are explicitly not certified carbon-credit methodology.
- Image verification affects confidence only; it does not change the impact math.
- The prior verifier blockers were remediated: valid 50-row bottle-cap payloads totaling 0.1 kg now return non-zero totals, and a single 0.002 kg bottle-cap row remains visible in `kgDiverted`, `co2eAvoidedKg`, `landfillVolumeAvoidedLitres`, and the summary.
- The PASS_WITH_NOTES items were remediated: runtime validation now rejects schema-disallowed extra fields, rejects weights below 0.001 kg, and exposes low image confidence through assumptions.
- The second PASS_WITH_NOTES items were remediated: equivalent rows now aggregate duplicate labels, and missing image-confidence scores are surfaced as manual-review assumptions.
- Rate limiting uses the P0 in-memory limiter, suitable for prototype/local use only.
