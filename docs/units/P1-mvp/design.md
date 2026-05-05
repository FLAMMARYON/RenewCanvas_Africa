# P1-mvp Design

## Chosen Approach

P1 is a phase integration gate, not a new model. F01, F03, and F08 are already verified; P1 ties them into a minimal proof-of-concept workflow for reviewers:

- artwork/category/material metadata is represented with the shared schema;
- pricing recommendations are available through F01;
- impact estimates are available through F03;
- museum placement is available through F08;
- admins get a verification prototype that summarizes all three signals in a human-review queue.

The implementation adds a pure verification-queue module and a dashboard page. The page uses static prototype data so it does not introduce database or auth dependencies before the data layer unit exists.

## Alternatives Considered

- Add a database-backed admin queue now: rejected because the current phase has no database migration unit yet.
- Expand F02-style material image verification now: rejected because F02 is the next ML phase and should not be pulled into P1.
- Rework existing admin artwork moderation: rejected because unrelated dirty UI changes exist and the safer phase slice is an additive route.

## Data Schema Changes

No persistent schema migration is introduced. P1 uses the existing `ArtworkRecord`, `PricingRecommendation`, `ImpactEstimate`, and `MuseumCurationPlan` shapes through a derived `VerificationQueueItem`:

- artwork public metadata;
- pricing status and explanation;
- impact status and assumptions;
- museum room/placement status;
- review flags;
- recommended admin action.

## API Surface

No new public API is required. P1 adds:

- `src/lib/ml/verification.ts`: pure queue builder for admin review.
- `src/app/dashboard/admin/verification/page.tsx`: admin verification prototype.

## Model Card

P1 does not introduce a trained model. It combines verified rule-based outputs for human decision support.

- Intended use: help admins review whether a prototype artwork listing has pricing, impact, and museum-placement evidence.
- Out-of-scope use: automatic approval, rejection, punishment, or artist ranking.
- Bias risks: missing data may correlate with lower digital literacy; the queue recommends manual review rather than rejection.
- Human oversight: all outputs are decision-support flags only.

## Failure Modes

- Static prototype data can drift from future database schema.
- Admins may mistake review flags for automatic moderation decisions.
- P0 in-memory rate limiting and static data are not production infrastructure.
- Missing impact/pricing/curation outputs may produce conservative review recommendations.

## Rollback Plan

Remove `src/lib/ml/verification.ts`, `src/app/dashboard/admin/verification/page.tsx`, P1 tests/docs, and the P1 status/log updates. F01, F03, and F08 remain unaffected.

## Acceptance Mapping

- MVP APIs and UI run locally: F01/F03/F08 APIs build; P1 adds admin verification UI.
- Docs/open artifacts exist: F01/F03/F08 open artifacts remain present; P1 adds phase docs.
- Admin verification mock/prototype: new admin verification page.
- Dataset schemas: F01, F03, and F08 open schema artifacts exist.
- Accessibility: admin page uses semantic headings, tables/lists, button labels, and text flags not color alone.
