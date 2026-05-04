# F08-ai-curator Verification Notes Resolution

Verifier: `019df167-d661-7343-acb7-df4d3ea38f10`

Verdict: `PASS_WITH_NOTES`

## Notes

1. `open/curation/curation-schema.json` documented the `imageUrl` constraint in prose but did not encode it as machine-readable JSON Schema.
2. The Three.js museum relied on adjacent visible text and modal details rather than a fuller non-canvas artwork list.

## Resolution

- The schema now encodes `imageUrl` with `anyOf`: `http`/`https` URI patterns or site-relative paths starting with one slash, explicitly excluding protocol-relative URLs.
- The virtual museum now includes a screen-reader accessible non-canvas artwork list with the curation summary, room title, and arrangement explanation for each artwork.

## Remaining Follow-Up

- The public museum can still benefit from a visible flat-screen list mode in a later accessibility-focused unit, but F08 now has a non-canvas textual alternative.
