# F01-pricing Self-Check

## Commands Run

| Check | Command | Result |
| --- | --- | --- |
| Unit tests | `npm test` | PASS: 25 tests passed |
| Coverage | `npm run test:coverage` | PASS: 99.52% line coverage overall; pricing module 100% line/function coverage |
| Type-check | `npm run typecheck` | PASS |
| Lint | `npm run lint` | PASS: zero warnings |
| Security audit | `npm run security:audit` | PASS for high/critical; npm reports 2 moderate transitive Next/PostCSS findings |
| Production build | `npm run build` | PASS |
| Live API check | `POST /api/pricing` against local dev server | PASS |

## Checklist

- All tests pass: PASS. 25 tests passed after verifier remediation.
- Lint, type-check, and coverage pass: PASS.
- Security scan shows no high or critical findings: PASS.
- Accessibility audit: NOT APPLICABLE. F01 changes no UI.
- API latency budget: PASS by local smoke test; no load test yet.
- Documentation present: PASS. See `open/pricing/README.md`, `open/pricing/model-card.md`, and `open/pricing/dataset-schema.json`.
- Open-source artifacts present: PASS.

## Live API Assertions

- Valid full payload returns `200`.
- Response includes `currency`, `min`, `max`, `suggested`, `confidence`, `factors`, `explanation`, `methodologyVersion`, and `requestId`.
- Response includes rate-limit headers.
- Invalid category returns `400` with field-level errors.
- Mixed valid/invalid materials are rejected.
- Invalid previous sales are rejected.
- Non-array previous sales are rejected.
- Previous sales arrays above 200 entries are rejected.
- Numeric fields reject strings, booleans, nulls, and other coercible non-number JSON values.
- Dimensions reject non-string values and strings longer than 120 characters.
- Repeated requests from one IP return `429`.
- High demand inputs are capped and the response explains the cap to the artist.

## Notes

- Pricing is deterministic rule-based for Phase 1, not trained ML.
- Rate limiting uses the P0 in-memory limiter, suitable for prototype/local use only.
- Demand signals are capped to reduce simple manipulation.
- Artist retains final control over price; this is decision support.
- The prior verifier blockers were remediated: pricing coverage is 100%, invalid material entries are rejected, invalid previous sales are rejected, capped demand signals are explained in both factors and plain-language reasoning, numeric input validation no longer coerces malformed JSON types, dimensions now have explicit boundary validation, and PASS_WITH_NOTES items were either fixed or tracked in `notes_resolution.md`.
