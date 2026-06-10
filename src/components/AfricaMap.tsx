/**
 * Stylized vector map of Africa with Rwanda highlighted in the brand teal.
 *
 * Pure inline SVG (crisp at any size, tiny payload). The continent is muted;
 * Rwanda is marked with a brand-teal pin + pulse at its approximate location
 * (central-east Africa, by the Great Lakes) since the country is too small to
 * render as a distinct border at this scale.
 */
export function AfricaMap({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1000 1000"
      role="img"
      aria-label="Map of Africa with Rwanda highlighted"
      className={className}
    >
      <defs>
        <linearGradient id="africaFill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#99f6e4" />
          <stop offset="100%" stopColor="#5eead4" />
        </linearGradient>
        <filter id="africaShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="14" floodColor="#0f766e" floodOpacity="0.18" />
        </filter>
      </defs>

      {/* Continent (muted brand tint) */}
      <path
        filter="url(#africaShadow)"
        fill="url(#africaFill)"
        stroke="#0d9488"
        strokeOpacity="0.35"
        strokeWidth="4"
        strokeLinejoin="round"
        d="M250 150
           C 300 120, 380 122, 450 128
           C 520 132, 590 130, 628 150
           C 650 162, 648 196, 666 220
           C 690 252, 728 270, 742 312
           C 756 352, 742 372, 760 392
           C 792 426, 838 420, 846 446
           C 852 466, 818 480, 786 486
           C 742 494, 706 486, 688 512
           C 666 544, 678 588, 666 628
           C 652 676, 624 706, 612 752
           C 600 800, 588 852, 552 884
           C 520 912, 482 902, 466 866
           C 452 834, 462 796, 440 770
           C 414 740, 392 690, 388 642
           C 384 596, 404 566, 380 548
           C 352 528, 320 556, 300 540
           C 276 520, 290 482, 268 466
           C 240 446, 206 452, 196 424
           C 186 396, 214 372, 206 344
           C 198 314, 168 300, 176 264
           C 182 236, 216 232, 224 204
           C 230 182, 232 162, 250 150 Z"
      />

      {/* Connector from Rwanda marker to label */}
      <line x1="610" y1="540" x2="720" y2="470" stroke="#0d9488" strokeWidth="3" strokeOpacity="0.7" />

      {/* Rwanda pulse */}
      <circle cx="610" cy="540" r="10" fill="#0d9488" opacity="0.35">
        <animate attributeName="r" values="10;26;10" dur="2.4s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.35;0;0.35" dur="2.4s" repeatCount="indefinite" />
      </circle>

      {/* Rwanda marker (brand teal) */}
      <circle cx="610" cy="540" r="11" fill="#0d9488" stroke="#ffffff" strokeWidth="4" />

      {/* Label */}
      <g transform="translate(728 452)">
        <rect x="0" y="0" rx="10" ry="10" width="168" height="56" fill="#ffffff" stroke="#0d9488" strokeOpacity="0.3" strokeWidth="2" />
        <text x="20" y="26" fontFamily="system-ui, sans-serif" fontSize="22" fontWeight="700" fill="#0f766e">
          Rwanda
        </text>
        <text x="20" y="46" fontFamily="system-ui, sans-serif" fontSize="15" fill="#6b7280">
          Kigali, our home base
        </text>
      </g>
    </svg>
  );
}
