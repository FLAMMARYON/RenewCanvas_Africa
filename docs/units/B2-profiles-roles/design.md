# B2 Profiles And Roles Design

## Scope

B2 moves buyer, artist, and admin profile data out of frontend-only state and into authenticated backend storage.

## Data

- `BuyerProfile` stores buyer contact details and notification preferences.
- `ArtistProfile` now stores contact details, public artist fields, material preferences, techniques, and private payout details.
- `AdminProfile` stores internal operator contact details and role title.
- `Address` stores user-owned addresses. B2 wires the buyer default delivery address and leaves multi-address management for a later checkout/address-book slice.

Avatar and document upload buttons remain UI placeholders. Cloud storage belongs with the B3 media/upload pipeline so file validation, signed upload URLs, and object ownership rules are handled consistently.

## API

`/api/profile` is authenticated for buyer, artist, and admin users.

- `GET` returns the session user, role profile, default buyer address, and display name.
- `PATCH` updates only the current user's role-specific profile.

Email and role remain session/account fields and are not editable through this API.

## Frontend

- Buyer profile loads and saves via `/api/profile`, including notification preferences and default delivery address.
- Artist profile loads and saves via `/api/profile`; the previous local profile draft save is removed.
- Admin profile exists at `/dashboard/admin/profile` because the shared dashboard menu already links to role profile pages.
