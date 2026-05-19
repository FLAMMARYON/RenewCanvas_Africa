"use client";

/**
 * AnimatedLogo Component - Hybrid 01 Brand Identity
 *
 * Imperfect hand-painted circular brushloop with centered gold/orange leaf.
 * The brushloop rotates slowly, the leaf spins and bobs gently.
 *
 * Usage:
 * - Loading screens: <AnimatedLogo size={120} animate />
 * - Static display: <AnimatedLogo size={80} animate={false} />
 * - With text: <AnimatedLogo size={64} showText />
 * - Navbar: <AnimatedLogo size={40} showText textSize="sm" animate={false} />
 */

import { useId } from "react";

interface AnimatedLogoProps {
  size?: number;
  animate?: boolean;
  showText?: boolean;
  textSize?: "sm" | "md" | "lg";
  className?: string;
}

// Brand colors
const BRAND_TEAL = "#007A68";
const BRAND_TEAL_DARK = "#005A4D";
const BRAND_ORANGE = "#F59E0B";
const BRAND_ORANGE_DARK = "#D97706";

export default function AnimatedLogo({
  size = 80,
  animate = true,
  showText = false,
  textSize = "md",
  className = "",
}: AnimatedLogoProps) {
  const id = useId();
  const textSizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  };

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div className="logo-motion" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="RenewCanvas Africa logo"
        >
          <defs>
            {/* Teal gradient for brushloop */}
            <linearGradient id={`brushGrad-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={BRAND_TEAL} />
              <stop offset="100%" stopColor={BRAND_TEAL_DARK} />
            </linearGradient>
            {/* Orange gradient for leaf */}
            <linearGradient id={`leafGrad-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={BRAND_ORANGE} />
              <stop offset="100%" stopColor={BRAND_ORANGE_DARK} />
            </linearGradient>
          </defs>

          {/* Brushloop - imperfect circular brushstroke */}
          <g className={animate ? "brushloop" : ""}>
            {/* Main brushstroke ring - organic, hand-painted feel */}
            <path
              d="M100 18
                 C148 15, 182 48, 185 98
                 C188 152, 155 185, 102 188
                 C50 190, 15 155, 15 102
                 C15 50, 50 18, 98 18
                 L100 18
                 M100 38
                 C58 40, 35 65, 35 100
                 C35 140, 60 165, 100 165
                 C142 165, 168 140, 168 100
                 C168 58, 142 35, 100 38"
              fill={`url(#brushGrad-${id})`}
              fillRule="evenodd"
            />
            {/* Brush texture - outer wispy strokes */}
            <path
              d="M95 12 C45 10, 8 50, 12 102 C15 158, 55 192, 108 188"
              fill="none"
              stroke={BRAND_TEAL}
              strokeWidth="6"
              strokeLinecap="round"
              opacity="0.6"
            />
            <path
              d="M112 190 C162 185, 192 148, 190 98 C188 45, 152 12, 102 15"
              fill="none"
              stroke={BRAND_TEAL_DARK}
              strokeWidth="5"
              strokeLinecap="round"
              opacity="0.4"
            />
            {/* Inner texture strokes */}
            <path
              d="M100 32 C55 35, 32 62, 32 100"
              fill="none"
              stroke={BRAND_TEAL}
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.3"
            />
          </g>

          {/* Leaf - centered gold/orange leaf */}
          <g className={animate ? "leaf" : ""}>
            <path
              d="M100 62
                 C118 68, 135 88, 135 112
                 C135 142, 115 162, 100 168
                 L100 168
                 C85 162, 65 142, 65 112
                 C65 88, 82 68, 100 62
                 Z"
              fill={`url(#leafGrad-${id})`}
            />
            {/* Leaf center vein */}
            <path
              d="M100 72 L100 158"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.5"
            />
            {/* Secondary veins */}
            <path
              d="M100 95 C88 102, 78 112, 72 125"
              fill="none"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.3"
            />
            <path
              d="M100 95 C112 102, 122 112, 128 125"
              fill="none"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.3"
            />
          </g>
        </svg>
      </div>

      {showText && (
        <div className={`font-bold ${textSizes[textSize]}`}>
          <span className="text-black">Renew</span>
          <span style={{ color: BRAND_TEAL }}>Canvas</span>
        </div>
      )}

      {/* CSS Animations */}
      <style jsx>{`
        .logo-motion {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .logo-motion .brushloop {
          transform-origin: 100px 100px;
          animation: brushloopRotate 8s linear infinite;
        }

        .logo-motion .leaf {
          transform-origin: 100px 115px;
          animation:
            leafSpin 4s ease-in-out infinite,
            leafBob 3s ease-in-out infinite;
        }

        @keyframes brushloopRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes leafSpin {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(8deg); }
        }

        @keyframes leafBob {
          0%, 100% { translate: 0 0; }
          50% { translate: 0 -6px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .logo-motion .brushloop,
          .logo-motion .leaf {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * RenewCanvasLoader Component
 * Full-page loading overlay with animated logo
 */
export function RenewCanvasLoader({
  message = "Preparing your circular art experience..."
}: {
  message?: string
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-6">
        <AnimatedLogo size={96} animate />
        <div className="text-center">
          <h2 className="text-xl font-bold">
            <span className="text-black">Renew</span>
            <span style={{ color: BRAND_TEAL }}>Canvas</span>
            <span style={{ color: BRAND_ORANGE }}> Africa</span>
          </h2>
          <p className="mt-2 text-sm tracking-wide text-slate-500">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * LoadingScreen Component
 * Fixed overlay loading screen
 */
export function LoadingScreen({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/98 backdrop-blur-sm">
      <AnimatedLogo size={120} animate />
      <div className="mt-6 text-center">
        <h2 className="text-2xl font-bold">
          <span className="text-black">Renew</span>
          <span style={{ color: BRAND_TEAL }}>Canvas</span>
          <span style={{ color: BRAND_ORANGE }}> Africa</span>
        </h2>
        <p className="mt-2 text-sm text-gray-500 animate-pulse">{message}</p>
      </div>
    </div>
  );
}

/**
 * SplashScreen Component
 * App splash/startup screen for mobile apps or initial load
 */
export function SplashScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-orange-50">
      <AnimatedLogo size={160} animate />
      <div className="mt-8 text-center">
        <h1 className="text-4xl font-bold">
          <span className="text-black">Renew</span>
          <span style={{ color: BRAND_TEAL }}>Canvas</span>
        </h1>
        <p className="mt-1 text-xl font-semibold tracking-wider" style={{ color: BRAND_ORANGE }}>
          AFRICA
        </p>
        <p className="mt-4 text-gray-500 text-sm">
          Renewing Canvas. Restoring Value. Reimagining Africa.
        </p>
      </div>
      <div className="mt-8 flex gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full animate-bounce" style={{ backgroundColor: BRAND_TEAL, animationDelay: "0ms" }} />
        <span className="h-2.5 w-2.5 rounded-full animate-bounce" style={{ backgroundColor: BRAND_TEAL, animationDelay: "150ms" }} />
        <span className="h-2.5 w-2.5 rounded-full animate-bounce" style={{ backgroundColor: BRAND_ORANGE, animationDelay: "300ms" }} />
      </div>
    </div>
  );
}

/**
 * Static icon using PNG for non-animated contexts
 */
export function StaticLogo({
  size = 40,
  showText = false,
  textSize = "sm" as "sm" | "md" | "lg",
  className = ""
}: {
  size?: number;
  showText?: boolean;
  textSize?: "sm" | "md" | "lg";
  className?: string;
}) {
  const textSizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  };

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <img
        src="/brand/renewcanvas-icon-full-color.png"
        alt="RenewCanvas Africa"
        width={size}
        height={size}
        style={{ width: size, height: size }}
      />
      {showText && (
        <div className={`font-bold ${textSizes[textSize]}`}>
          <span className="text-black">Renew</span>
          <span style={{ color: BRAND_TEAL }}>Canvas</span>
        </div>
      )}
    </div>
  );
}

/**
 * NavbarLogo Component - uses PNG for crisp display
 */
export function NavbarLogo() {
  return (
    <StaticLogo size={40} showText textSize="sm" />
  );
}
