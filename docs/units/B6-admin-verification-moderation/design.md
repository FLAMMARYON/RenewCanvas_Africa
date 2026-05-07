# B6 Admin Verification And Moderation Design

## Scope

B6 replaces the static P1 admin verification prototype with a persistent review workflow.

## Data

- `VerificationReview` stores one review row per artwork with status, recommended action, review flags, admin notes, artist messages, decision timestamps, and the deciding admin.
- `VerificationEvidenceAttachment` stores artist-provided evidence linked to both the review and artwork.
- Admin decisions write `AuditLog` rows with the decision, note, previous artwork status, and next artwork status.

## Workflow

- `GET /api/verification` lists database-backed verification items for admins.
- Admins can approve, reject, or request more information through `POST /api/verification/:artworkId/decision`.
- Request-more-info keeps the artwork under review and exposes the request to the owning artist.
- Artists submit evidence through `POST /api/verification/:artworkId/evidence`; this returns the review to pending and resubmits the artwork.
- Approving a review lists the artwork; rejecting a review stores the rejection note on the artwork.

## Frontend

- Admin verification now loads the real backend queue.
- Admin verification shows persisted evidence and decision notes.
- Artist artwork edit pages show request-more-info prompts and let artists submit evidence URLs/notes.
