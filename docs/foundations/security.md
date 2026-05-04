# Security Foundation

- Secrets must be read from environment variables through `src/lib/foundation/env.ts`.
- Public endpoints must validate input and use rate limiting before production release.
- The in-memory rate limiter is for prototypes and local development only. Production must use a distributed store.
- Logs must use explicit metadata. Do not log raw request bodies, uploaded images, private sales records, or personal data.
- Dependency checks use `npm run security:audit`, which fails on high and critical vulnerabilities.
