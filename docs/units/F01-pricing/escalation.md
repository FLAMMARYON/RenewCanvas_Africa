# F01-pricing Escalation

## Context

F01 received three consecutive independent verifier FAIL verdicts before passing the unit gate.

## Blocking Issues Found

1. Pricing math coverage did not initially meet the unit requirement for 100% coverage.
2. Mixed invalid material entries and malformed `previousArtistSales` values were accepted or silently coerced.
3. Capped demand signals were applied but not explained clearly enough to artists.
4. JSON numeric coercion allowed booleans, strings, and nulls through the public API boundary.
5. Optional `dimensions` input accepted non-string values and excessive string lengths.

## Remediation

- Added strict validation for every public pricing input.
- Rejected mixed invalid materials, invalid previous sales, non-array previous sales, non-number numeric fields, and malformed dimensions.
- Added adversarial route and validator regression tests for each verifier finding.
- Restored pricing module line/function coverage to 100%.
- Updated self-check evidence after remediation.

## Scope Decision

No product scope change is proposed. The failures were validation and evidence gaps inside the intended F01 scope, and remediation is bounded to the pricing unit.
