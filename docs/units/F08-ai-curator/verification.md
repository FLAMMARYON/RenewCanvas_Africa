# F08-ai-curator Independent Verification

Verdict: PASS

## Scope

Third verification after prior `FAIL` and later `PASS_WITH_NOTES` remediation. I re-read:

- `docs/plan/04_global_standards.md`
- `docs/plan/01_execution_plan.md` F08 acceptance criteria
- `docs/units/F08-ai-curator/design.md`
- `docs/units/F08-ai-curator/self_check.md`
- prior `docs/units/F08-ai-curator/verification.md`
- `docs/units/F08-ai-curator/notes_resolution.md`

I audited the running implementation and open artifacts instead of trusting the self-check.

## Commands Run

- `npm test`: PASS, 59/59 tests.
- `npm run test:coverage`: PASS, 98.40% line coverage overall; `src/lib/ml/curator.ts` 94.56% line coverage.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- `npm run security:audit`: PASS for the high/critical gate. npm still reports 2 moderate transitive Next/PostCSS findings.
- `npm run build`: PASS; `/api/museum/curation` is included in the route output.
- PowerShell JSON-schema probe of `open/curation/curation-schema.json`: PASS; `imageUrl.anyOf` is present with patterns `^https?://` and `^/(?!/)`, request schemas use `additionalProperties: false`, and the successful response shape requires `plan` and `requestId`.

## Prior Findings Re-tested

PASS: unsafe `imageUrl` values are rejected by `/api/museum/curation`.

- Route and module tests cover `ftp://example.com/x.jpg`, `file:///C:/secret.txt`, and `//evil.example/x.jpg`, each returning validation errors for `artworks.0.imageUrl`.
- Module tests also cover `not-a-url`.
- Implementation reference: `src/lib/ml/curator.ts:143` rejects protocol-relative URLs, non-http(s) absolute URLs, and invalid URL strings while allowing site-relative paths.

PASS: `open/curation/curation-schema.json` accurately documents request and successful response shapes.

- Request schema includes `artworks`, category/material enums, numeric impact fields, max batch size, and private-field rejection through `additionalProperties: false`.
- Successful response schema includes `requestId`, `plan`, `rooms`, `placements`, `accessibilitySummary`, room grouping fields, capacity, and placement explanations.

PASS: the schema encodes the `imageUrl` constraint as machine-readable `anyOf`/`pattern`.

- `open/curation/curation-schema.json` defines `imageUrl.anyOf` for http(s) URLs and site-relative paths, with `^/(?!/)` excluding protocol-relative URLs.

PASS: `virtual-room` includes a non-canvas accessible artwork list.

- `src/app/virtual-room/page.tsx:824` renders a screen-reader-only section labeled `Accessible museum artwork list`.
- The list includes the curation summary, artwork title/artist, curated room title, and arrangement explanation at `src/app/virtual-room/page.tsx:826`.

## Acceptance Criteria And Adversarial Coverage

PASS: deterministic output from same inputs in different order.

- `tests/ml/curator.test.ts:146` reverses the same artwork set and deep-compares the full plan.
- Sorting is stable by theme, impact, title, and id in `src/lib/ml/curator.ts:327`.

PASS: type/material/impact arrangement is visible.

- Rooms expose `grouping`, `groupingValue`, and `accessibilityLabel` in `src/lib/ml/curator.ts:372`.
- Placements expose `arrangementExplanation` in `src/lib/ml/curator.ts:388`.
- Tests assert impact, material, and type rooms are all produced in `tests/ml/curator.test.ts:155`.

PASS: room-slot capacity and pagination.

- Capacity is 8 in `src/lib/ml/curator.ts:60`.
- `tests/ml/curator.test.ts:169` verifies a 10-artwork theme creates two stable rooms with 8 and 2 placements.

PASS: malformed JSON, unknown category/material, private metadata, numeric coercion, oversized batches, and rate limiting.

- Malformed JSON returns 400 in `tests/api/curation-route.test.ts:110`.
- Unknown categories/materials and private artwork fields are rejected in `tests/api/curation-route.test.ts:54` and `tests/ml/curator.test.ts:59`.
- Numeric string coercion is rejected by strict number validation in `src/lib/ml/curator.ts:156`.
- Empty and 501-artwork batches are rejected in `tests/ml/curator.test.ts:128`.
- The 31st same-IP request returns 429 in `tests/api/curation-route.test.ts:120`.

PASS: public-only metadata exposure.

- The validator rejects root and artwork fields outside allowlists at `src/lib/ml/curator.ts:61` and `src/lib/ml/curator.ts:62`.
- The success response returns only `plan` and `requestId` from `src/app/api/museum/curation/route.ts:87`.
- The plan contains room and placement metadata, not private artist contact fields.

PASS: virtual-room integration uses shared curation output rather than category-only placement.

- `src/app/virtual-room/page.tsx:7` imports `curateMuseum`.
- `src/app/virtual-room/page.tsx:267` creates `museumCurationPlan`.
- `src/app/virtual-room/page.tsx:273` derives placements from `museumCurationPlan.placements`.

PASS: open artifacts are current enough for F08.

- `open/curation/README.md` describes the rule-based public metadata curator.
- `open/curation/methodology.md` matches the implemented theme priority, deterministic sorting, room capacity, and text-explanation behavior.
- `open/curation/curation-schema.json` matches the API request and successful response surface.

PASS: accessibility textual alternatives.

- API output includes `accessibilitySummary`, room `accessibilityLabel`, and placement `arrangementExplanation`.
- The virtual room has keyboard navigation handlers at `src/app/virtual-room/page.tsx:659`.
- The selected artwork modal image has alt text at `src/app/virtual-room/page.tsx:843`.
- The non-canvas artwork list at `src/app/virtual-room/page.tsx:824` provides a textual alternative to the Three.js canvas.

## Residual Risk

- The curation endpoint uses an in-memory P0 rate limiter. This satisfies the current unit and tests, but a distributed limiter is still needed before multi-instance production deployment.
- `npm audit --audit-level=high` passes, but npm reports 2 moderate transitive Next/PostCSS findings. These remain below the documented high/critical blocking threshold.

No blocking issues found.
