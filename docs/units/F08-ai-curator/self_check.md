# F08-ai-curator Self-Check

## Commands Run

| Check | Command | Result |
| --- | --- | --- |
| Unit and API tests | `npm test` | PASS: 59 tests passed |
| Coverage | `npm run test:coverage` | PASS: 98.40% line coverage overall; curator module 94.56% line coverage |
| Type-check | `npm run typecheck` | PASS after Next route metadata regenerated |
| Lint | `npm run lint` | PASS: zero warnings |
| Security audit | `npm run security:audit` | PASS for high/critical; npm reports 2 moderate transitive Next/PostCSS findings |
| Production build | `npm run build` | PASS; `/api/museum/curation` included in route output |

## Checklist

- All tests pass: PASS. 59 tests passed.
- Lint, type-check, and coverage pass: PASS.
- Security scan shows no high or critical findings: PASS.
- Accessibility audit: PASS by static review for this unit. The API returns textual room labels and `accessibilitySummary`; virtual-room integration adds visible text explanations and no new interactive controls.
- API latency budget: PASS by local route execution; no load test yet.
- Documentation present: PASS. See `open/curation/README.md`, `open/curation/methodology.md`, and `open/curation/curation-schema.json`.
- Open-source artifacts present: PASS.

## API Assertions

- Valid artwork metadata returns `200` with deterministic `plan`, `rooms`, `placements`, `accessibilitySummary`, and `requestId`.
- Response includes rate-limit headers.
- Malformed JSON returns `400`.
- Unknown categories and unknown materials are rejected.
- Unsafe `imageUrl` values using `ftp:`, `file:`, protocol-relative URLs, or invalid URL strings are rejected.
- `http:`, `https:`, and site-relative image URLs are accepted.
- Private/unapproved metadata fields are rejected.
- Empty and excessive artwork batches are rejected.
- Rate limiting returns `429` after repeated requests from one IP.

## Curator Assertions

- Same artwork set produces the same curation plan regardless of input order.
- Rooms are generated from public metadata.
- Type, material, and impact groupings are visible in room metadata and placement explanations.
- Large themes paginate into stable room slots.
- Sculpture and installation works are placed as floor/court-style placements.
- Virtual-room placement now uses the shared curator output instead of separate category-only placement logic.
- The published open curation schema now includes both request and successful response definitions.
- The published open curation schema now encodes the `imageUrl` rule with machine-readable `anyOf`/`pattern` constraints.
- The virtual museum includes a non-canvas screen-reader artwork list with room titles and arrangement explanations.

## Notes

- F08 is rule/tag-based only. Embedding-based visual/story clustering remains deferred until F02/P2 supplies image/text embeddings.
- The rate limiter is P0 in-memory infrastructure and should be replaced before multi-instance deployment.
- The moderate Next/PostCSS audit findings remain below the high/critical blocker threshold but must stay visible.
- First verifier blocker fixes were added after `FAIL`: unsafe image URLs are rejected and `open/curation/curation-schema.json` now documents both request and response shapes.
- Second verifier PASS_WITH_NOTES items were remediated: URL constraints are machine-readable in the schema, and the museum has a screen-reader list outside the Three.js canvas.
