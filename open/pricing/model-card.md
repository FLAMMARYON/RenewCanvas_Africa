# Model Card: Pricing Rule v1

## Model Type

Deterministic rule-based pricing formula. No model has been trained yet.

## Intended Use

Provide artists with a transparent suggested price range for recycled-material artworks.

## Inputs

Category, materials, material weight, dimensions, complexity, hours worked, artist experience level, previous sale prices, views, and wishlist count.

## Outputs

Suggested price, min/max price range, confidence level, factor list, and explanation.

## Training Data

None. This is a hand-authored formula for Phase 1.

## Known Biases And Risks

- Professional artists receive higher recommendations through the experience multiplier.
- Demand metrics can be manipulated, so they are capped.
- Comparable sales may reinforce historic underpricing if an artist previously sold too low.
- Material and labour assumptions may need localization after real transaction data is collected.

## Human Control

Artists always retain final control over price.

## Future ML Path

Once enough sales data exists, train a regression model and compare it against this baseline. Keep explainability and artist override mandatory.
