# Pricing Formula

Methodology version: `pricing-rule-v1`

The Phase 1 pricing assistant is deterministic. It is not trained ML yet.

## Inputs

- artwork category
- recyclable materials
- material weight in kg
- complexity
- artist experience level
- hours worked
- views
- wishlist count
- previous artist sales as numeric comparable prices

## Formula Summary

The engine starts with a 15,000 RWF base price, applies category, complexity, experience, material, and demand multipliers, then adds material value, labour value, and a bounded comparable-sales anchor.

Demand signals are capped to reduce manipulation:

- views are capped at 2,000
- wishlist count is capped at 250

The response always includes factor-level reasoning so artists can understand the recommendation.

## Intended Use

Use this as artist decision support. Artists keep final control over listing price.

## Out Of Scope

The formula should not be used for loans, credit scoring, automated artist ranking, or automatic rejection of listings.
