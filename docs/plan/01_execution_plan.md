# Execution Plan

This plan decomposes the source plan into stable work units. Status values must be mirrored in `docs/plan/02_status.json`.

## Feature Units

### F01-pricing
- Status: pending
- Purpose: Help artists price artworks fairly using transparent signals.
- Inputs: category, materials, material weight, dimensions, complexity, hours worked, artist level, previous sales, views, wishlist count.
- Outputs: suggested price range, confidence level, factorized explanation.
- ML stage: rule-based first; later classical ML regression and personalized modeling.
- Data dependencies: Artwork schema, Material schema, historical sale records, engagement metrics.
- Acceptance criteria: deterministic formula exposed in API; 100% test coverage on pricing math; explanation always returned; invalid inputs rejected.
- Security considerations: validate all request bodies; rate limit public endpoint; avoid leaking private sales history.
- Accessibility considerations: pricing explanations must be plain-language and screen-reader friendly.
- Definition of done: API, tests, docs, model card, pricing formula, and sample dataset schema are implemented and verified.

### F02-material-vision
- Status: pending
- Purpose: Detect recyclable materials in submitted artwork/raw-material images.
- Inputs: uploaded images, claimed materials.
- Outputs: detected materials, confidence scores, claimed-vs-detected comparison, review recommendation.
- ML stage: deep learning prototype using CLIP/MobileNet-style classifier; rule-based stub allowed before model service exists.
- Data dependencies: material taxonomy, image storage, labeled dataset.
- Acceptance criteria: taxonomy published; endpoint returns confidence; low-confidence results go to review; no automatic rejection.
- Security considerations: validate file types and sizes; malware scan uploads; avoid storing unnecessary EXIF/PII.
- Accessibility considerations: detection results must be available as text and not only color-coded.
- Definition of done: classifier/stub, taxonomy, model card, annotation guide, tests, and admin review integration verified.

### F03-impact-estimator
- Status: pending
- Purpose: Estimate waste diverted and carbon/landfill impact from material type and weight.
- Inputs: material records, weights, verification confidence.
- Outputs: kg diverted, CO2e avoided, landfill volume avoided, equivalency metrics, assumptions.
- ML stage: rule-based calculator; ML only verifies material category.
- Data dependencies: Material schema, material factors, verification status.
- Acceptance criteria: transparent methodology; 100% test coverage on impact math; buyer-visible and receipt-ready output.
- Security considerations: prevent unrealistic weights; expose uncertainty; avoid unsupported environmental claims.
- Accessibility considerations: impact summaries must be plain language and readable by screen readers.
- Definition of done: calculator, API, tests, methodology doc, and examples verified.

### F04-smart-routing
- Status: pending
- Purpose: Predict and optimize recyclable-material pickup routes if collection logistics are in scope.
- Inputs: pickup locations, time windows, expected volumes, vehicle capacity.
- Outputs: clusters, route order, pickup window recommendations.
- ML stage: classical ML/operations research.
- Data dependencies: collection bookings, geospatial data, capacity constraints.
- Acceptance criteria: routing avoids exposing exact user locations unnecessarily; route output reproducible from same inputs.
- Security considerations: protect location data; role-gate admin access.
- Accessibility considerations: dashboard map has table fallback and keyboard navigation.
- Definition of done: clustering/routing module, API, tests, privacy review, and dashboard verified.

### F05-recommendations
- Status: pending
- Purpose: Recommend artworks to buyers and buyer segments to artists.
- Inputs: artwork metadata, views, saves, purchases, searches, price range, location.
- Outputs: similar artworks, emerging/local/high-impact collections, artist insights.
- ML stage: content-based first; collaborative/hybrid later.
- Data dependencies: Artwork schema, tagging pipeline, engagement events, fairness metadata.
- Acceptance criteria: fairness exposure floor; no popularity-only ranking; reproducible recommendation tests.
- Security considerations: minimize behavioral data; hash/anonymize where possible.
- Accessibility considerations: recommendations must have accessible labels and explain why shown.
- Definition of done: recommender, fairness tests, docs, metrics, and API verified.

### F06-listing-assistant
- Status: pending
- Purpose: Help artists create stronger listings.
- Inputs: listing text, images, metadata, price recommendation, material docs.
- Outputs: photo quality score, missing metadata checklist, description suggestions, price mismatch warning.
- ML stage: computer vision and LLM-assisted suggestions; rule-based checklist first.
- Data dependencies: Artwork schema, pricing output, image metadata.
- Acceptance criteria: suggestions are editable; no automatic content overwrite; checks are test-covered.
- Security considerations: sanitize generated text; avoid prompt injection through listing text.
- Accessibility considerations: checklist is keyboard/screen-reader usable.
- Definition of done: listing assistant UI/API, docs, safety notes, and tests verified.

### F07-fraud-risk
- Status: pending
- Purpose: Detect suspicious listings or impact claims for human review.
- Inputs: image embeddings, text embeddings, price/impact metadata.
- Outputs: risk score, reasons, admin review recommendation.
- ML stage: embeddings and anomaly detection.
- Data dependencies: F02 image embeddings, F06 text analysis, F03 impact output.
- Acceptance criteria: decision support only; never automatic punishment; adversarial input tests pass.
- Security considerations: role-gated admin access; audit log for risk decisions.
- Accessibility considerations: reasons are text-based and not color-only.
- Definition of done: risk scorer, admin UI, policy doc, tests, and model card verified.

### F08-ai-curator
- Status: pending
- Purpose: Arrange museum artworks by type, theme, material, impact, and story.
- Inputs: artwork tags, categories, materials, color palette, impact score, artist location.
- Outputs: room assignments, wing themes, layout slots.
- ML stage: rule/tag-based first; embeddings later.
- Data dependencies: Artwork schema, tagging pipeline, impact output.
- Acceptance criteria: museum rooms are generated by metadata; type/material/impact arrangement visible; layout deterministic from same inputs.
- Security considerations: avoid exposing private artist metadata in public room labels.
- Accessibility considerations: virtual museum has keyboard/mouse navigation and accessible textual alternatives.
- Definition of done: curation module, museum integration, tests, and docs verified.

### F09-multilingual-accessibility
- Status: pending
- Purpose: Support Kinyarwanda, English, French, Swahili, audio descriptions, and voice narration.
- Inputs: artwork metadata, descriptions, narration scripts.
- Outputs: translated strings, plain-language summaries, audio descriptions, searchable multilingual text.
- ML stage: translation/TTS/image-to-description.
- Data dependencies: i18n string catalog, Artwork schema, content moderation.
- Acceptance criteria: user-facing strings extracted; translations testable; subtitles/audio descriptions available.
- Security considerations: prevent prompt/data leakage in translation service.
- Accessibility considerations: WCAG 2.1 AA; screen-reader and keyboard support.
- Definition of done: i18n framework, accessibility assistant, docs, tests, and model cards verified.

### F10-impact-ledger
- Status: pending
- Purpose: Issue public, verifiable impact digital certificates without speculative tokens.
- Inputs: artwork ID, artist reference, materials, kg diverted, verification status, sale timestamp.
- Outputs: certificate record, certificate hash, public verification view/tool.
- ML stage: no ML; cryptographic verification.
- Data dependencies: Artwork schema, Material schema, Impact schema, sale records.
- Acceptance criteria: certificate hash deterministic; 100% test coverage on hashing; schema and verifier published.
- Security considerations: canonicalize certificate payloads; avoid PII; protect write access.
- Accessibility considerations: verification page readable and keyboard-accessible.
- Definition of done: certificate schema, hashing, public verifier, docs, tests, and optional chain anchor verified.

## Phase Units

### P0-foundations
- Status: pending
- Purpose: Establish architecture, tooling, CI, observability, secret handling, and module boundaries.
- Inputs: repository, package manager, environment assumptions.
- Outputs: project scaffolding, test/lint/type pipelines, observability skeleton, secret management docs.
- ML stage: none.
- Data dependencies: none.
- Acceptance criteria: reproducible install/test; no hardcoded secrets; baseline CI documented.
- Security considerations: dependency audit; env-only secrets; rate-limit pattern.
- Accessibility considerations: testing strategy includes UI audits.
- Definition of done: foundations docs/config/tests verified.

### P1-mvp
- Status: pending
- Purpose: Deliver open-source proof-of-concept.
- Inputs: F01, F03, F08, artwork/material schemas.
- Outputs: upgraded pricing, category metadata, museum arrangement, impact calculator, admin verification mock, dataset schemas.
- ML stage: rule-based.
- Data dependencies: Artwork/Material/Impact schemas.
- Acceptance criteria: MVP APIs and UI run locally; docs and open artifacts exist.
- Security considerations: validate all API boundaries; no sensitive data in fixtures.
- Accessibility considerations: admin screen and museum fallback accessible.
- Definition of done: phase summary and all dependent units verified.

### P2-ml-verification
- Status: pending
- Purpose: Add ML-assisted verification and tagging.
- Inputs: F02, F06, tagging pipeline.
- Outputs: material classifier, photo scoring, tagging, similarity search.
- ML stage: deep learning/embeddings.
- Data dependencies: labeled images, taxonomy, object storage.
- Acceptance criteria: model cards and evaluation metrics published.
- Security considerations: upload safety and prompt-injection review.
- Accessibility considerations: admin results available as text.
- Definition of done: phase summary and all dependent units verified.

### P3-operational-intelligence
- Status: pending
- Purpose: Add routing, recommendations, and artist insights.
- Inputs: F04, F05, analytics events.
- Outputs: route planning, buyer recommendations, artist insights.
- ML stage: classical ML/recommender.
- Data dependencies: collection data, engagement events.
- Acceptance criteria: fairness constraints and privacy review pass.
- Security considerations: geolocation and behavioral data minimization.
- Accessibility considerations: dashboards have table alternatives.
- Definition of done: phase summary and all dependent units verified.

### P4-trust-scale
- Status: pending
- Purpose: Add certificates, multilingual accessibility, model release discipline, and personalized pricing.
- Inputs: F10, F09, F01 phase 3 data.
- Outputs: impact certificates, public verification, multilingual assistant, personal dashboards.
- ML stage: mixed; translation/TTS/personalized ML.
- Data dependencies: verified impact data, sales history, i18n catalogs.
- Acceptance criteria: public verifier works; translations tested; models reproducible.
- Security considerations: certificate integrity, privacy, chain anchoring risks.
- Accessibility considerations: multilingual accessibility first-class.
- Definition of done: final phase summary and all dependent units verified.

## Reorder Notes
- F04 is numbered as a secondary feature in the source plan but is required for P3 and appears before F05 in dependency order.
- F03 can be built before F02 using claimed materials, but must later integrate F02 confidence scores.
- F08 rule-based curation can be built before embedding-based tagging; embedding upgrades happen after F02/P2.
