# Observability Foundation

The project uses structured JSON log events from `src/lib/foundation/logger.ts`.

Minimum metadata for API requests:

- request ID
- endpoint
- HTTP method
- status code
- latency bucket

ML inference logs must use input hashes and confidence scores, not raw images, raw descriptions, or private user data.
