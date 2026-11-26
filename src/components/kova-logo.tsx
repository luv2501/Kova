import React from "react";

interface KovaLogoProps {
  className?: string;
  markOnly?: boolean;
  size?: "sm" | "md" | "lg";
  forceDarkSurface?: boolean;
}

/**
 * Compact 'K' architectural monogram mark featuring straight left pillar,
 * hairline upper arm, and sweeping curved lower serif leg.
 */
export function KovaLogoMark({
  className = "w-6 h-6",
  forceDarkSurface = false,
}: {
  className?: string;
  forceDarkSurface?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="currentColor"
      className={`${className} ${
        forceDarkSurface
          ? "text-[#F2C594]"
          : "text-[#111113] dark:text-[#F2C594]"
      }`}
      aria-hidden="true"
    >
      {/* Left vertical stem */}
      <path d="M 4 4 H 9.5 V 36 H 4 Z" />
      {/* Hairline upper diagonal arm */}
      <path d="M 9.5 19.5 L 29.5 4 H 32 L 10.5 21 Z" />
      {/* Sculpted curved lower serif leg */}
      <path d="M 9.5 18.6 C 17 18.2 21.5 23 25.5 29.5 C 28.5 34.4 31.8 37.5 37 36.8 C 32.5 38.8 26 36.8 21.5 30.8 C 17.8 25.5 14.5 20.8 9.5 20.8 Z" />
    </svg>
  );
}

/**
 * Bespoke architectural serif SVG wordmark:
 * Curved-leg K, high-contrast Didone O, sharp V, and crossbar-less A.
 */
export function KovaLogo({
  className = "",
  markOnly = false,
  size = "md",
  forceDarkSurface = false,
}: KovaLogoProps) {
  if (markOnly) {
    const markSizes = {
      sm: "w-4 h-4",
      md: "w-6 h-6",
      lg: "w-8 h-8",
    };
    return (
      <KovaLogoMark
        className={markSizes[size]}
        forceDarkSurface={forceDarkSurface}
      />
    );
  }

  const wordmarkHeights = {
    sm: "h-4",
    md: "h-5",
    lg: "h-7",
  };

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <svg
        viewBox="0 0 202 45"
        fill="currentColor"
        className={`w-auto ${wordmarkHeights[size]} ${
          forceDarkSurface
            ? "text-[#F2C594]"
            : "text-[#111113] dark:text-[#F2C594]"
        }`}
        role="img"
        aria-label="KOVA"
      >
        {/* K — Straight stem, hairline upper diagonal, sweeping curved serif tail */}
        <path d="M 4 4 H 10 V 40 H 4 Z" />
        <path d="M 10 21.5 L 32.5 4 H 35 L 11.2 22.8 Z" />
        <path d="M 10 20.2 C 18 19.6 23.2 24.8 27.6 32.2 C 31.2 38.2 35.4 42.1 42 41 C 36.4 43.4 28.4 40.9 23.2 33.8 C 19 27.8 15.2 22.2 10 22.2 Z" />

        {/* O — High-contrast Didone oval (thick side bowls, hairline top & bottom) */}
        <path
          fillRule="evenodd"
          d="M 73 3.5 A 22 18.5 0 1 1 72.99 3.5 Z M 73 4.9 A 15.8 17.1 0 1 0 73.01 4.9 Z"
        />

        {/* V — Thick descending left diagonal, sharp point, hairline ascending right diagonal */}
        <path d="M 105 4 H 111.5 L 126.2 37.2 L 144.8 4 H 146.6 L 125.8 40.5 H 124.2 Z" />

        {/* A — Crossbar-less architectural A (hairline left leg, sharp apex, thick right leg) */}
        <path d="M 155 40 L 176.2 3.5 L 198 40 H 191.6 L 173.95 10.46 L 156.8 40 Z" />
      </svg>
    </div>
  );
}
