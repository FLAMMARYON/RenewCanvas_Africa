# F03-impact-estimator Verification

Verdict: PASS_WITH_NOTES

## Scope Reviewed

- `docs/plan/04_global_standards.md`
- `docs/plan/01_execution_plan.md` F03 acceptance criteria
- `docs/units/F03-impact-estimator/design.md`
- `docs/units/F03-impact-estimator/self_check.md`
- `src/lib/ml/impact.ts`
- `src/app/api/impact/route.ts`
- `src/lib/foundation/rate-limit.ts`
- `tests/ml/impact.test.ts`
- `tests/api/impact-route.test.ts`
- `open/impact/README.md`
- `open/impact/methodology.md`
- `open/impact/dataset-schema.json`

## Commands Run

- `npm test`: PASS, 46 tests passed.
- `npm run test:coverage`: PASS, 46 tests passed; overall line coverage 99.72%; `src/lib/ml/impact.ts` line coverage 100%.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS, zero warnings.
- `npm run build`: PASS.
- `npm run security:audit`: PASS at the configured high-severity gate; npm still reports 2 moderate transitive Next/PostCSS advisories.
- Independent adversarial Node probe against `validateImpactInput`, `calculateImpactEstimate`, and `POST /api/impact`: PASS. The first inline probe was blocked by sandbox path/module resolution; rerun outside the sandbox completed successfully.

## Acceptance Criteria Assessment

- Transparent methodology: PASS. `open/impact/methodology.md` publishes intended use, out-of-scope uses, factor table, confidence rules, input bounds, and limitations.
- 100% test coverage on impact math: PASS. Coverage reports `src/lib/ml/impact.ts` at 100% line coverage.
- Buyer-visible and receipt-ready output: PASS. The API returns kg diverted, estimated CO2e avoided, estimated landfill litres avoided, equivalents, assumptions, confidence, material breakdown, methodology version, plain-language summary, and request ID.
- Prevent unrealistic weights: PASS. Validation rejects non-number, `NaN`, `Infinity`, zero, negative, below-`0.001` kg, above-250 kg per row, above-500 kg per request, and more than 50 rows.
- Expose uncertainty: PASS. Low image confidence below `0.5` and missing `confidenceScore` on image-verified rows both add manual-review assumptions.
- Avoid unsupported environmental claims: PASS. Extra top-level and material-level fields such as `certifiedCarbonCredits`, `carbonNeutral`, `claim`, and `certified` are rejected with field-level errors.
- Rate limiting: PASS. `POST /api/impact` checks the P0 in-memory limiter before parsing the request body and returns `429` after repeated requests from one IP.

## Adversarial Results

The independent probe covered malformed material rows, numeric coercion, unknown material types, invalid/non-boolean `verifiedByImage`, invalid confidence scores, missing `confidenceScore` on image-verified rows, unsupported environmental claims and extra fields, material weights below `0.001 kg`, per-row and total-weight limits, low-confidence uncertainty assumptions, duplicate equivalent aggregation, rate limiting, and both prior bottle-cap rounding regressions.

Observed results:

- Primitive/null material rows: rejected with `materials.N` errors.
- String numeric values, boolean weights, `NaN`, and `Infinity`: rejected, not coerced.
- Unknown material type: rejected with `materials.0.type`.
- Non-boolean `verifiedByImage`: rejected with `materials.0.verifiedByImage`.
- Confidence outside `0..1` or non-finite: rejected with `materials.0.confidenceScore`.
- Unsupported environmental claim fields: rejected with `extraFields` and `materials.0.extraFields`.
- Weight `0.000999 kg`: rejected with `materials.0.weightKg`.
- 51 rows: rejected with `materials`.
- Row weight `250.001 kg`: rejected with `materials.0.weightKg`.
- Total weight `500.001 kg`: rejected with `totalWeightKg`.
- Image-verified row without `confidenceScore`: accepted but adds a missing-confidence manual-review assumption.
- Image-verified row with `confidenceScore: 0.49`: accepted, returns `confidence: "medium"`, and adds a low-confidence manual-review assumption.
- Duplicate bottle-cap equivalents from `0.002 kg` and `0.004 kg` rows aggregate into one equivalent with `value: 3`.
- 50 bottle-cap rows at `0.002 kg`: returns `kgDiverted: 0.1`, `co2eAvoidedKg: 0.14`, `landfillVolumeAvoidedLitres: 1.8`, and one equivalent with `value: 50`.
- Single bottle-cap row at `0.002 kg`: returns `kgDiverted: 0.002`, `co2eAvoidedKg: 0.0028`, `landfillVolumeAvoidedLitres: 0.036`, and one equivalent with `value: 1`.
- 31st request from the same probe IP: returns `429`.
- Malformed JSON: returns `400`.

## Self-Check Accuracy

The self-check is accurate. I reproduced the claimed test count, coverage, type-check, lint, high-severity audit gate, production build, rate limiting, unsupported-field rejection, below-`0.001 kg` rejection, missing/low-confidence assumptions, equivalent aggregation, and both bottle-cap regression fixes.

## Non-Blocking Notes

1. `src/app/api/impact/route.ts:10` and `src/lib/foundation/rate-limit.ts:13` use a P0 in-memory rate limiter. This satisfies the unit design, but it is process-local and will not provide consistent enforcement across multiple server instances or restarts.

2. `npm run security:audit` passes the configured high/critical gate, but npm still reports 2 moderate transitive advisories through Next/PostCSS. This is not blocking under the global standard, which blocks high/critical CVEs, but it should stay visible.

## Conclusion

F03 meets the documented acceptance criteria and the previously reported adversarial failures are fixed. The remaining notes are production-hardening items, not blocking correctness issues.
