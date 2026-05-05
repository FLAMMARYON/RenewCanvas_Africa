# P1 MVP Screenshots

Date: 2026-05-04

Screenshots were captured from a production build served with temporary local screenshot tooling:

```bash
npm run build
npm run start
node scripts/capture-screenshots.mjs
```

The server base URL was `http://localhost:3000`. Desktop viewport was 1440 by 900.

The temporary Puppeteer dependency and script were removed after capture, so this folder preserves the resulting PNG evidence rather than permanent screenshot tooling.

## Captured Routes

All captures returned HTTP 200. PNG files are saved in this folder.

| Route | File |
| --- | --- |
| `/` | `home.png` |
| `/about` | `about.png` |
| `/artists` | `artists.png` |
| `/artists/1` | `artist-detail-1.png` |
| `/artwork/1` | `artwork-detail-1.png` |
| `/auctions` | `auctions.png` |
| `/book-collection` | `book-collection.png` |
| `/checkout` | `checkout.png` |
| `/contact` | `contact.png` |
| `/dashboard/admin` | `dashboard-admin.png` |
| `/dashboard/admin/artists` | `dashboard-admin-artists.png` |
| `/dashboard/admin/artworks` | `dashboard-admin-artworks.png` |
| `/dashboard/admin/auctions` | `dashboard-admin-auctions.png` |
| `/dashboard/admin/impact` | `dashboard-admin-impact.png` |
| `/dashboard/admin/materials` | `dashboard-admin-materials.png` |
| `/dashboard/admin/orders` | `dashboard-admin-orders.png` |
| `/dashboard/admin/settings` | `dashboard-admin-settings.png` |
| `/dashboard/admin/users` | `dashboard-admin-users.png` |
| `/dashboard/admin/verification` | `admin-verification.png` |
| `/dashboard/artist` | `dashboard-artist.png` |
| `/dashboard/artist/analytics` | `dashboard-artist-analytics.png` |
| `/dashboard/artist/artworks` | `dashboard-artist-artworks.png` |
| `/dashboard/artist/artworks/1` | `dashboard-artist-artwork-edit-1.png` |
| `/dashboard/artist/artworks/create` | `dashboard-artist-artwork-create.png` |
| `/dashboard/artist/orders` | `dashboard-artist-orders.png` |
| `/dashboard/artist/profile` | `dashboard-artist-profile.png` |
| `/dashboard/buyer` | `dashboard-buyer.png` |
| `/dashboard/buyer/orders` | `dashboard-buyer-orders.png` |
| `/dashboard/buyer/profile` | `dashboard-buyer-profile.png` |
| `/dashboard/buyer/wishlist` | `dashboard-buyer-wishlist.png` |
| `/faq` | `faq.png` |
| `/forgot-password` | `forgot-password.png` |
| `/how-it-works` | `how-it-works.png` |
| `/impact` | `impact.png` |
| `/login` | `login.png` |
| `/marketplace` | `marketplace.png` |
| `/order-confirmation` | `order-confirmation.png` |
| `/privacy` | `privacy.png` |
| `/refund-policy` | `refund-policy.png` |
| `/register` | `register.png` |
| `/reset-password` | `reset-password.png` |
| `/terms` | `terms.png` |
| `/virtual-room` | `virtual-room.png` |

## Skipped Routes

None. Dynamic routes were captured only where local mock/static IDs exist:

- `/artists/1`
- `/artwork/1`
- `/dashboard/artist/artworks/1`

Protected dashboard routes rendered locally without login and were captured. No auth bypass was added.

## Notes

- The first screenshot attempt used `networkidle0` and stalled after 18 captures; the temporary script was adjusted to wait for `domcontentloaded` plus a short settle delay.
- Captures reflect the current working tree, including broad unstaged UI edits that are intentionally not staged for P1.
- No screenshot route failures were recorded in `manifest.json`.
