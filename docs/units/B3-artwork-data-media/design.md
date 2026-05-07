# B3 Artwork Data And Media Design

## Scope

B3 replaces mock artwork data with database-backed artwork inventory and role-aware APIs.

## Data

- `Artwork.ownerType` distinguishes artist-owned consignment from RenewCanvas-owned platform inventory.
- Artwork records now include dimensions, review timestamps, rejection reason, view/favourite counters, and submitted/reviewed lifecycle fields.
- `ArtworkImage` includes storage provider/key/upload status metadata so a real cloud storage provider can be wired without changing the artwork API shape.

## APIs

- `GET /api/artworks` lists public marketplace artwork with `listed` status only.
- `GET /api/artworks?scope=artist` lists the signed-in artist's artwork.
- `GET /api/artworks?scope=admin` lists all artwork for moderation.
- `POST /api/artworks` creates artist submissions or admin-created RenewCanvas-owned inventory.
- `GET/PATCH/DELETE /api/artworks/:id` supports detail, edit/resubmit, and delete flows.
- `POST /api/artworks/:id/review` lets admins approve to `listed` or reject with a reason.
- `POST /api/artwork-media/uploads` is a signed-upload-ready placeholder contract. It validates image intent and returns a placeholder upload descriptor until cloud storage is selected.

## Frontend

- Marketplace reads listed artwork from the backend.
- Artwork detail pages use real IDs/slugs.
- Artist artwork list and edit pages use backend artwork APIs.
- Artist artwork creation submits to the backend instead of writing local artwork drafts.
- Admin artwork moderation reads from the backend and uses the review API.
