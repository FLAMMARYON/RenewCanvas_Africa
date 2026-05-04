# F01-pricing Verification

Verdict: PASS_WITH_NOTES

Date: 2026-05-04
Verifier: independent verification agent

## Scope Reviewed

- `docs/plan/04_global_standards.md`
- `docs/plan/01_execution_plan.md` F01-pricing acceptance criteria
- `docs/units/F01-pricing/design.md`
- `docs/units/F01-pricing/escalation.md`
- `docs/units/F01-pricing/self_check.md`
- `src/lib/ml/pricing.ts`
- `src/app/api/pricing/route.ts`
- `src/lib/ml/schemas.ts`
- `src/lib/foundation/rate-limit.ts`
- `src/lib/foundation/request.ts`
- `tests/ml/pricing.test.ts`
- `tests/api/pricing-route.test.ts`
- `open/pricing/README.md`
- `open/pricing/model-card.md`
- `open/pricing/dataset-schema.json`

## Commands Run

```powershell
npm test
npm run typecheck
npm run lint
npm run test:coverage
npm run security:audit
npm run build
rg -n "\bany\b" src/lib src/app/api tests -g "*.ts" -g "*.tsx"
```

Additional adversarial probe run with `npx tsx` from stdin:

- Rejected numeric coercion for `materialWeight`, `hoursWorked`, `views`, `wishlistCount`, and `previousArtistSales`.
- Rejected malformed `previousArtistSales` entries including booleans, `NaN`, `Infinity`, and non-array values.
- Rejected unknown mixed materials.
- Rejected negative and excessive demand metrics at the validation boundary.
- Confirmed high-but-allowed demand values are capped to the same output as the documented cap.
- Confirmed the capped-demand explanation is present and raw manipulated demand values are not echoed back.
- Rejected non-string and over-120-character `dimensions`.
- Confirmed repeated same-IP requests return `429`.

## Results

- `npm test`: PASS, 23/23 tests passed.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS with zero warnings.
- `npm run test:coverage`: PASS. Overall line coverage was 99.52%; `src/lib/ml/pricing.ts` reported 100% statements, 100% functions, and 100% lines.
- `npm run security:audit`: PASS for the configured high-severity gate. npm still reports 2 moderate transitive Next/PostCSS findings.
- `npm run build`: PASS.
- `rg` found no `any` usage in the reviewed TypeScript areas.

## Acceptance Criteria Assessment

- Deterministic formula exposed in API: PASS. `POST /api/pricing` calls shared deterministic pricing logic and returns `methodologyVersion`.
- 100% test coverage on pricing math: PASS for line/function coverage on `src/lib/ml/pricing.ts`; branch coverage is 97.7%.
- Explanation always returned: PASS for successful recommendations; response includes factor list and plain-language explanation.
- Invalid inputs rejected: PASS for required fields, malformed JSON, numeric type coercion, invalid materials, malformed previous sales, excessive dimensions, and out-of-range demand metrics.
- Validate all request bodies: PASS within the F01 contract reviewed.
- Rate limit public endpoint: PASS for prototype in-memory limiter.
- Avoid leaking private sales history: PASS. Only aggregate comparable-sales contribution is returned, not individual sale values.
- Open artifacts present: PASS. Pricing README, model card, and dataset schema exist under `open/pricing`.
- Self-check accuracy: PASS. The claimed test, coverage, type-check, lint, audit, build, rate-limit, validation, demand-cap, and artifact claims reproduced.

## Non-blocking Notes

1. `src/lib/ml/pricing.ts:156` through `src/lib/ml/pricing.ts:164` validates `dimensions` by type and length only. A short arbitrary string such as `"not a dimension"` is accepted. The current docs do not define a stricter dimension grammar, so I am not treating this as blocking, but the API should either document free-form dimensions or enforce a format such as `60cm x 80cm`.

2. `src/lib/ml/pricing.ts:166` through `src/lib/ml/pricing.ts:178` validates each `previousArtistSales` value but does not cap array length. Very large arrays could make median sorting expensive in one request. Add a maximum count if this endpoint is exposed beyond prototype traffic.

3. `package.json:11` checks only global `--lines 80`. Current pricing coverage satisfies the unit requirement, but CI would not specifically fail if future pricing-module coverage dropped below 100%.

4. `open/pricing/dataset-schema.json` allows `materialWeightKg` minimum `0`, while runtime validation rejects `0` and requires a value greater than `0`. Align the open schema with the runtime contract.

5. `src/lib/foundation/request.ts:9` through `src/lib/foundation/request.ts:14` trusts `x-forwarded-for`. This is acceptable for local/prototype checks only if production deployment controls that header through trusted proxy infrastructure.

## Final Assessment

F01-pricing satisfies the documented unit gate after the prior escalation fixes. I found no blocking issue in numeric coercion, malformed `previousArtistSales`, excessive dimensions, capped demand manipulation, rate limiting, or explanation transparency. The notes above should be addressed before production hardening, but they do not block this unit.
