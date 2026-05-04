# Museum Curation Methodology

Version: `rule-v1`

## Intended Use

The curator arranges public upcycled artwork listings into virtual museum rooms so visitors can browse by type, material, and impact.

## Algorithm

1. Validate public artwork metadata and reject unknown materials/categories instead of guessing.
2. Assign a primary theme:
   - high-impact works first when impact score is at least `80` or kg diverted is at least `8`;
   - single-material works next by material theme;
   - all remaining works by artwork category/type.
3. Sort deterministically by theme title, impact score, title, then artwork id.
4. Create rooms with a capacity of 8 artworks.
5. Assign wall/floor slots from room type.
6. Emit text explanations and accessibility summaries.

## Out-of-Scope Uses

- Ranking artist quality.
- Moderation.
- Fraud scoring.
- Cultural value judgments.

## Bias And Fairness Review

The prototype intentionally uses public artwork metadata only. It does not use gender, age, ethnicity, or private artist details. This reduces privacy risk but means demographic exposure fairness is not yet measurable in this unit. The later recommender unit must add explicit exposure-floor tests for emerging, women, and youth artists.

## Limitations

- Sparse metadata creates generic rooms.
- The rule set may overproduce rooms for inventory-heavy categories.
- Embedding-based visual/story clustering is deferred until the material-vision/tagging pipeline exists.
- Curator override tools are deferred to dashboard work.
