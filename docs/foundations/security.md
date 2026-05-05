# Security Foundation

- Secrets must be read from environment variables through `src/lib/foundation/env.ts`.
- Public endpoints must validate input and use rate limiting before production release.
- The in-memory rate limiter is for prototypes and local development only. Production must use a distributed store.
- Logs must use explicit metadata. Do not log raw request bodies, uploaded images, private sales records, or personal data.
- Dependency checks use `npm run security:audit`, which fails on high and critical vulnerabilities.

## Production Dependency Audit Exceptions

Before serious production launch, rerun dependency checks even if local development and staging are already passing:

- `npm.cmd audit`
- `npm.cmd audit --omit=dev`
- `npm.cmd outdated`
- `npm.cmd ls @hono/node-server postcss next prisma`

If moderate transitive findings remain and `npm audit fix --force` is the only available remediation, do not force the downgrade automatically. Complete a production exception review first:

- Confirm whether the vulnerable package is present in the production runtime or only in build/dev tooling.
- Confirm whether the vulnerable code path is reachable from public traffic.
- Check whether the app directly uses the vulnerable function or only receives it through framework/tool internals.
- Recheck whether compatible patched Next or Prisma releases are available.
- Document the advisory IDs, package paths, exposure assessment, compensating controls, owner, and review expiry date.
- Get explicit production risk acceptance from the accountable owner before launch.

Required compensating controls when an accepted dependency exception remains:

- Build in CI and deploy production artifacts only.
- Do not run `next dev`, Prisma Studio, seed scripts, or Prisma migration dev commands in production.
- Run database migrations as a controlled deployment step.
- Put public traffic behind path normalization and request filtering, such as a reverse proxy, WAF, or managed edge layer.
- Keep rate limits, request size limits, and structured security logging enabled.
- Recheck `npm audit`, `npm audit --omit=dev`, and `npm outdated` after every Next or Prisma release until the exception is cleared.

Launch rule: if a remaining audit finding is reachable and exploitable in production traffic, delay launch or add an architectural mitigation before launch. If it is not reachable in production and compensating controls are in place, it may proceed only with a documented exception and review date.
