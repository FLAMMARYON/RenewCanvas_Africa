# CI Foundation

The baseline CI gate for this repository must run the same commands used in local verification.

Required jobs:

1. Install dependencies with `npm ci`.
2. Run `npm run lint`.
3. Run `npm run typecheck`.
4. Run `npm test`.
5. Run `npm run test:coverage`.
6. Run `npm run security:audit`.
7. Run `npm run build`.

Required policy:

- Any high or critical dependency vulnerability fails CI.
- Lint warnings fail CI.
- TypeScript errors fail CI.
- New-code coverage must meet or exceed 80% line coverage.
- Pricing math, impact math, and certificate hashing units must enforce 100% coverage once introduced.
- CI must not require secrets for pull-request validation.

Provider note:

No hosted CI provider has been selected yet. This document is the provider-neutral baseline. When GitHub Actions, GitLab CI, or another system is chosen, its workflow file must implement this exact gate.
