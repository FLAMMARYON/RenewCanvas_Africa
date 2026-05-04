# F01-pricing Design

## Chosen Approach

Upgrade the existing pricing endpoint into a deterministic, transparent pricing engine that can later be replaced or augmented by classical ML. The implementation will use shared typed pricing logic under `src/lib/pricing`, expose a rate-limited `POST /api/pricing`, and publish open-source artifacts under `/open/pricing`.

The rule-based engine will accept the source-plan inputs available today:

- category
- materials
- material weight
- dimensions
- complexity
- hours worked
- artist experience level
- previous artist sales
- views
- wishlist count

It will return:

- `min`, `max`, `suggested`
- confidence level
- factor list
- plain-language explanation
- methodology version

## Alternatives Considered

- **Train a model now:** Rejected because there is no real sales dataset yet. A deterministic formula is auditable and matches Phase 1.
- **Keep pricing logic inside the API route:** Rejected because pricing math needs 100% test coverage and reuse by listing assistant later.
- **Use third-party AI for price recommendations:** Rejected for Phase 1 because it would reduce reproducibility and explainability.

## Data Schema Changes

No database migrations yet. This unit defines TypeScript request/response schemas and an open dataset schema for future persisted records.

## API Surface

`POST /api/pricing`

Request:

```json
{
  "category": "Wall Art",
  "materials": ["PET bottles"],
  "materialWeight": 2.5,
  "complexity": "moderate",
  "experienceLevel": "emerging",
  "dimensions": "60cm x 80cm",
  "hoursWorked": 12,
  "views": 120,
  "wishlistCount": 8,
  "previousArtistSales": [35000, 42000]
}
```

Response:

```json
{
  "currency": "RWF",
  "min": 28000,
  "max": 47000,
  "suggested": 36000,
  "confidence": "medium",
  "factors": [],
  "explanation": "...",
  "methodologyVersion": "pricing-rule-v1"
}
```

## Model Card

Phase 1 is not trained ML. A model card will still be published describing deterministic inputs, intended use, limitations, bias risks, and future ML path.

## Failure Modes

- Invalid category/material inputs: reject with 400 and field-level errors.
- Unrealistic weights/hours/sales: clamp or reject based on explicit bounds.
- Oversized comparable-sales arrays: reject above 200 prices to avoid expensive request-local sorting.
- Malformed dimensions: reject non-string values and strings longer than 120 characters. The content remains free-form until the product defines a dimension grammar.
- Demand metrics manipulated by bots: factor is capped and explained.
- Comparable sales leak sensitive history: only aggregate numeric values accepted, not buyer identities.
- Endpoint abuse: P0 in-memory rate limiter is applied for prototype protection.

## Rollback Plan

Revert the pricing unit commit. The API route will return to the previous simple implementation. No migrations are introduced.

## TODOs Filed For Later Units

- Persist pricing recommendations in the data model unit.
- Use verified material confidence from F02 when available.
- Train regression model only after enough historical sales exist.
- Before production, configure trusted proxy handling for `x-forwarded-for` so rate limits cannot be bypassed by forged client IP headers.
- If curators require structured dimensions later, define and enforce a formal grammar instead of the current free-form 120-character string.
