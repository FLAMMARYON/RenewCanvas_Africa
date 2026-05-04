# Dependency Graph

## Nodes
- P0-foundations
- F01-pricing
- F03-impact-estimator
- F08-ai-curator
- P1-mvp
- F02-material-vision
- F06-listing-assistant
- F07-fraud-risk
- P2-ml-verification
- F04-smart-routing
- F05-recommendations
- P3-operational-intelligence
- F10-impact-ledger
- F09-multilingual-accessibility
- P4-trust-scale

## Edges
- P0-foundations -> F01-pricing
- P0-foundations -> F03-impact-estimator
- P0-foundations -> F08-ai-curator
- F01-pricing -> P1-mvp
- F03-impact-estimator -> P1-mvp
- F08-ai-curator -> P1-mvp
- P1-mvp -> F02-material-vision
- P1-mvp -> F06-listing-assistant
- F01-pricing -> F06-listing-assistant
- F02-material-vision -> F06-listing-assistant
- F02-material-vision -> F07-fraud-risk
- F06-listing-assistant -> F07-fraud-risk
- F03-impact-estimator -> F07-fraud-risk
- F02-material-vision -> F08-ai-curator
- F02-material-vision -> P2-ml-verification
- F06-listing-assistant -> P2-ml-verification
- F07-fraud-risk -> P2-ml-verification
- P2-ml-verification -> F04-smart-routing
- P2-ml-verification -> F05-recommendations
- F08-ai-curator -> F05-recommendations
- F04-smart-routing -> P3-operational-intelligence
- F05-recommendations -> P3-operational-intelligence
- P3-operational-intelligence -> F10-impact-ledger
- P3-operational-intelligence -> F09-multilingual-accessibility
- F10-impact-ledger -> P4-trust-scale
- F09-multilingual-accessibility -> P4-trust-scale

## Topological Build Order
1. P0-foundations
2. F01-pricing
3. F03-impact-estimator
4. F08-ai-curator
5. P1-mvp
6. F02-material-vision
7. F06-listing-assistant
8. F07-fraud-risk
9. P2-ml-verification
10. F04-smart-routing
11. F05-recommendations
12. P3-operational-intelligence
13. F10-impact-ledger
14. F09-multilingual-accessibility
15. P4-trust-scale

## Cycle Resolution
- F03 depends conceptually on F02 material verification, but the cycle is resolved by splitting F03 into a rule-based calculator using claimed materials first, then integrating F02 confidence scores later.
- F08 depends conceptually on embeddings from F02, but the cycle is resolved by shipping rule/tag-based curation first, then embedding-based clustering later.
