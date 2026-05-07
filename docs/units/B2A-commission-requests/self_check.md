# B2A Commissioned Work Requests Self Check

Date: 2026-05-07

## Acceptance Mapping

| Requirement | Status |
| --- | --- |
| Buyer fills a form explaining what they want | Implemented |
| Buyer can specify product/project details | Implemented |
| Buyer can specify preferred materials | Implemented |
| Buyer enters budget amount | Implemented |
| Buyer selects small/medium/large or custom dimensions | Implemented |
| Request goes straight to admin | Implemented through admin commission queue |
| Admin sends request to artist of choice | Implemented as admin artist assignment |
| Artist can accept or reject | Implemented |
| Role access is enforced | Implemented |

## Verification

- `npm.cmd run db:generate`: PASS.
- `npm.cmd run typecheck`: PASS.
- `npm.cmd test`: PASS, 93/93 tests.
- `npm.cmd run lint`: PASS, zero warnings.
- `npm.cmd run db:migrate -- --name commission_requests`: PASS outside sandbox after Windows home-directory `EPERM`.
- `npm.cmd run db:seed`: PASS.
- `npx.cmd prisma migrate status`: PASS, 3 migrations found and database schema is up to date.
- `$env:NEXT_TELEMETRY_DISABLED='1'; npm.cmd run build`: PASS, 48 routes including commission pages and APIs.
- `npm.cmd run test:e2e`: PASS, 4/4 browser tests.

## Known Follow-Up

- Accepted commissions should later convert into real orders before payment work begins.
- Notifications for admin assignment and artist response belong in B11.
- Attachments or reference images should use the later media/upload pipeline.
