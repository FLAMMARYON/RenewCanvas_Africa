# RenewCanvas Phase 1 MVP

This folder records the open artifacts for the Phase 1 proof-of-concept integration.

## Verified Inputs

- F01 pricing formula and dataset schema: `open/pricing/`
- F03 impact methodology and dataset schema: `open/impact/`
- F08 museum curation methodology and API schema: `open/curation/`

## P1 Integration

The MVP combines those verified units into a human-review workflow:

- transparent pricing recommendation;
- impact estimate with assumptions;
- museum placement by type/material/impact;
- admin verification queue that keeps humans responsible for approval decisions.

The prototype is rule-based and does not train or deploy a new model in P1.
