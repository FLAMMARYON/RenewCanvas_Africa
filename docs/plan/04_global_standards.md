# Global Standards

Every unit must satisfy these standards before verification can pass.

## Code Quality
- Strict TypeScript on JavaScript/TypeScript code.
- No `any` without a justification comment.
- Strict typing on Python code with mypy when Python services are introduced.
- 80% line coverage minimum on new code.
- 100% coverage on pricing math, impact math, and certificate hashing.
- Conventional Commits for all commits.
- Changes must be atomic and reviewable.

## Security
- Secrets must be in environment variables only, never in code.
- Parameterized queries must be used for all database access.
- Public endpoints must have rate limiting before production release.
- Input validation is required at every boundary.
- OWASP Top 10 risks must be reviewed per feature.
- Dependency scans must block high/critical CVEs in CI.

## Privacy And Ethics
- Personally identifying data must be minimized and encrypted at rest.
- ML models require model cards covering training data provenance, known biases, intended use, and out-of-scope use.
- Recommenders must enforce fairness constraints so emerging artists, women, and youth get a guaranteed exposure floor.
- Fraud scoring is decision support for humans, not automated punishment.
- Pricing must always expose reasoning to the artist.

## Accessibility
- WCAG 2.1 AA minimum for every UI.
- Keyboard navigation required.
- Screen-reader labels required.
- Color contrast checked.
- Multilingual assistant is a first-class accessibility feature.

## Performance Budgets
- Non-ML API p95 latency under 300 ms.
- ML inference endpoint p95 latency under 1.5 s.
- First Contentful Paint under 2 s on a mid-tier mobile device on 3G.
- ML model artifacts under 100 MB unless justified.

## Reproducibility
- ML training runs must be deterministic given the same seed and data snapshot.
- Data versioning must use DVC or equivalent once training data exists.
- Model artifacts must store training data hash, code commit, hyperparameters, evaluation metrics, and fairness metrics.

## Open-Source Posture
- Every promised open-source artifact must be published in `/open/` with a permissive license and README.
- Artifacts must stay current with running code.
- Required artifacts include formulas, schemas, methodology docs, model cards, taxonomies, certificate schemas, and verification tools.

## Observability
- Structured logging required.
- Request tracing required before production release.
- Basic metrics required: latency, error rate, throughput.
- ML inference logs must store input hashes, not raw sensitive inputs, plus confidence scores for audit.

## Internationalization
- All user-facing strings must be extractable to translation files from day one for new UI.
- Kinyarwanda, English, French, and Swahili are first-tier languages.

## Verification Requirements
- Each unit needs design, implementation, self-check, independent verification, and status update.
- Verification agents must run tests themselves.
- Failed units cannot advance.
- Final re-audit is required after all units are verified.
