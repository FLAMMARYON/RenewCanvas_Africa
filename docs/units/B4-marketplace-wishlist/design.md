# B4 Marketplace Search And Wishlist Design

## Scope

B4 makes browsing and wishlist behavior database-backed.

## Data

- `WishlistItem` links buyer accounts to listed artwork.
- `Artwork.favouriteCount` is incremented/decremented when wishlist rows are created/removed.
- `Artwork.viewCount` is incremented through the view tracking endpoint.

## APIs

- `GET /api/artworks` supports marketplace search, category/material filters, price bounds, sorting, and pagination.
- `POST /api/artworks/:id/view` records a public artwork view for listed artwork.
- `GET /api/wishlist` lists the signed-in buyer's saved artwork.
- `POST /api/wishlist` saves listed artwork for the signed-in buyer.
- `DELETE /api/wishlist/:artworkId` removes a saved artwork.

## Frontend

- Marketplace uses backend query parameters instead of filtering only in browser memory.
- Marketplace cards can save listed artwork to the buyer wishlist.
- Buyer wishlist reads and removes persisted rows instead of local removed-item state.
- Artwork detail pages record real view events.
