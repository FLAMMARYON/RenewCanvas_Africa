/**
 * Real, geographically-accurate map of Africa, hollowed into a brand-coloured
 * silhouette with Kigali, Rwanda highlighted.
 *
 * Source: an open/royalty-free (CC0) outline map of Africa (per-country paths on
 * a 0..1000 viewBox). It is recoloured to the brand teal gradient with subtle
 * white country seams, and a brand-orange Kigali pin + pulse + label is baked in
 * at Rwanda's location. The processed asset lives at
 * `public/brand/africa-map.svg`; rendering it via <img> keeps the page payload
 * light and the pin perfectly aligned (it shares the map's coordinate space).
 */
export function AfricaMap({ className = "" }: { className?: string }) {
  return (
    <img
      src="/brand/africa-map.svg"
      alt="Map of Africa with Kigali, Rwanda highlighted"
      className={`object-contain ${className}`}
    />
  );
}
