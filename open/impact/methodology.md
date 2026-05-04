# Impact Estimator Methodology

Methodology version: `impact-rule-v1`

## Intended Use

This methodology supports transparent, receipt-ready estimates for upcycled artwork listings. It helps buyers and administrators understand the approximate environmental value of reclaimed materials.

## Out Of Scope

- Certified carbon-credit issuance.
- Regulatory emissions reporting.
- Automatic fraud punishment.
- Claims that are not tied to material type and weight.

## Factors

| Material | CO2e avoided per kg | Landfill litres avoided per kg | Equivalent unit | Approx kg per unit |
| --- | ---: | ---: | --- | ---: |
| PET bottles | 1.5 | 25 | 500ml PET bottles reused | 0.02 |
| Bottle caps | 1.4 | 18 | plastic bottle caps reused | 0.002 |
| Cardboard | 0.9 | 10 | flattened cardboard sheets reused | 0.08 |
| Paper | 0.8 | 8 | paper sheets reused | 0.005 |
| Fabric scraps | 2.8 | 14 | textile scrap bundles reused | 0.25 |
| Aluminium cans | 8.5 | 16 | aluminium cans reused | 0.014 |
| Glass | 0.35 | 4 | glass bottles reused | 0.2 |
| Electronic waste | 6 | 6 | small e-waste parts reused | 0.1 |
| Burlap/grain sacks | 1.2 | 12 | grain sacks reused | 0.18 |
| Plastic bags | 1.8 | 30 | plastic bags reused | 0.006 |
| Metal scraps | 3.2 | 5 | metal scrap pieces reused | 0.15 |
| Other | 0.5 | 8 | kg of other reused material | 1 |

## Confidence Rules

- `high`: every material is image-verified and average confidence is at least 0.75.
- `medium`: at least one material is image-verified or average confidence is at least 0.5.
- `low`: no image verification and no moderate confidence signal.

Confidence describes verification quality. It does not change the math.

If any image-verified material has confidence below 0.5, the API adds a manual-review assumption to the returned estimate.
If an image-verified material omits confidence, the API also adds a manual-review assumption.

## Input Bounds

- Each material row must be between 0.001 kg and 250 kg.
- Each request may include up to 50 material rows and 500 kg total material weight.
- Unsupported claim fields are rejected instead of silently accepted.

## Limitations

Factors are conservative prototype factors for product transparency. They should be replaced with audited, region-specific factors before compliance use.
