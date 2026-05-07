# B2 Profiles And Roles Handover

## Completed

- Added `BuyerProfile`, `AdminProfile`, and `Address` models.
- Extended `ArtistProfile` for public profile, techniques, social links, and private payout details.
- Added `/api/profile` with authenticated `GET` and `PATCH`.
- Wired buyer, artist, and admin profile pages to the backend profile API.
- Removed artist profile draft saving from the artist profile page.
- Seeded demo profile and default buyer address records.
- Applied migration `20260507013231_b2_profiles_roles`.

## Next Backend Slice

B3 should replace mock artwork data and introduce the media/upload pipeline. That is the right point to choose cloud object storage and implement signed uploads for artwork images, avatars, and verification documents.
