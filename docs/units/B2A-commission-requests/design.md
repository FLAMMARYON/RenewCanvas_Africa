# B2A Commissioned Work Requests Design

Date: 2026-05-07

## Scope

This slice adds a backend-backed commissioned-work workflow across buyer, admin, and artist dashboards.

## Workflow

1. Buyer submits a request describing the custom product or artwork they want.
2. Request goes directly to RenewCanvas admins.
3. Admin assigns the request to an active artist.
4. Assigned artist accepts or rejects the project.

Buyer and artist contact remains mediated by RenewCanvas admins.

## Data Model

`CommissionRequest` stores buyer, optional assigned artist, project title, description, preferred materials, budget, size category, optional dimensions, status, admin notes, artist response notes, assignment time, and response time.

Status lifecycle:

- `submitted`
- `assigned`
- `accepted`
- `rejected`
- `cancelled`
- `completed`

Size options:

- `small`
- `medium`
- `large`
- `custom`

## API Surface

- `GET /api/commissions`: lists requests scoped by current role.
- `POST /api/commissions`: buyer submits a request.
- `PATCH /api/commissions/:id/assign`: admin assigns an active artist.
- `PATCH /api/commissions/:id/respond`: assigned artist accepts or rejects.

## Screens

- `/dashboard/buyer/commissions`: buyer request form and request list.
- `/dashboard/admin/commissions`: admin queue and assignment controls.
- `/dashboard/artist/commissions`: artist assignment queue with accept/reject actions.

## Out Of Scope

- Payment collection for accepted commissions.
- Commission-to-order conversion.
- File attachments or inspiration images.
- Messaging threads and notification delivery.
