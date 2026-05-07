# B4 Marketplace Search And Wishlist Handover

## Completed

- Added migration `20260507053354_b4_marketplace_wishlist`.
- Added `WishlistItem` table with buyer/artwork uniqueness.
- Added marketplace query support for search, filters, sorting, and pagination.
- Added persistent wishlist API routes.
- Added artwork view tracking route.
- Rewired marketplace cards, artwork detail view tracking, and buyer wishlist page.
- Seed now gives the demo buyer a saved artwork.

## Next Backend Slice

B5 should persist pricing and impact recommendations so artist artwork creation can save the pricing/impact engine output with artwork drafts and admins can review recommendation history.
