import React from "react";

interface ConnectionQuoteProps {
  variant?: "kicker" | "stacked" | "compact";
  forceDarkSurface?: boolean;
  className?: string;
}

export function SpeechBubblesIcon({
  className = "w-6 h-6",
  forceDarkSurface = false,
}: {
  className?: string;
  forceDarkSurface?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 36 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="square"
      strokeLinejoin="miter"
      className={`${className} ${
        forceDarkSurface
          ? "text-[#A1A1AA]"
          : "text-[#52525B] dark:text-[#A1A1AA]"
      }`}
      aria-hidden="true"
    >
      {/* Front architectural speech bubble */}
      <path d="M 2 3 H 24 V 20 H 11 L 5 26 V 20 H 2 Z" />
      {/* Overlapping rear speech bubble */}
      <path d="M 24 8 H 34 V 24 H 30 V 29 L 25 24 H 14 V 20" />
    </svg>
  );
}

export function ConnectionQuote({
  variant = "kicker",
  forceDarkSurface = false,
  className = "",
}: ConnectionQuoteProps) {
  const baseText = forceDarkSurface
    ? "text-[#A1A1AA]"
    : "text-[#52525B] dark:text-[#A1A1AA]";
  const goldAccent = forceDarkSurface
    ? "text-[#F2C594]"
    : "text-[#B47B38] dark:text-[#F2C594]";

  if (variant === "kicker") {
    return (
      <div
        className={`inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white dark:bg-[#131316] border border-black/[0.08] dark:border-white/[0.08] dark:border-t-white/15 shadow-xs dark:shadow-none ${className}`}
      >
        <SpeechBubblesIcon
          className="w-3.5 h-3.5 shrink-0"
          forceDarkSurface={forceDarkSurface}
        />
        <span
          className={`font-sans text-[11px] font-medium uppercase tracking-[0.22em] leading-none ${baseText}`}
        >
          GREAT <span className={goldAccent}>COMMUNICATION</span> BEGINS WITH{" "}
          <span className={goldAccent}>CONNECTION</span>
        </span>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={`space-y-2.5 ${className}`}>
        <SpeechBubblesIcon
          className="w-5 h-5"
          forceDarkSurface={forceDarkSurface}
        />
        <p
          className={`font-sans text-[11px] font-medium uppercase tracking-[0.22em] leading-relaxed ${baseText}`}
        >
          GREAT <span className={goldAccent}>COMMUNICATION</span>
          <br />
          BEGINS WITH <span className={goldAccent}>CONNECTION</span>
        </p>
      </div>
    );
  }

  // "stacked" variant inspired directly by reference poster
  return (
    <div className={`space-y-3 ${className}`}>
      <SpeechBubblesIcon
        className="w-6 h-6"
        forceDarkSurface={forceDarkSurface}
      />
      <div
        className={`font-sans text-[11px] font-medium uppercase tracking-[0.22em] leading-[1.85] ${baseText}`}
      >
        <div>GREAT</div>
        <div className={goldAccent}>COMMUNICATION</div>
        <div>BEGINS</div>
        <div>WITH</div>
        <div className={goldAccent}>CONNECTION</div>
      </div>
    </div>
  );
}
