import React from "react";
import Link from "next/link";

interface FalconLogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  href?: string;
}

export function FalconLogo({
  className = "",
  showText = true,
  size = "md",
  href = "/",
}: FalconLogoProps) {
  const sizeMap = {
    sm: { icon: 28, text: "text-lg", gap: "gap-2" },
    md: { icon: 36, text: "text-2xl", gap: "gap-2.5" },
    lg: { icon: 48, text: "text-3xl", gap: "gap-3" },
    xl: { icon: 64, text: "text-4xl", gap: "gap-4" },
  };

  const { icon, text, gap } = sizeMap[size];

  const LogoContent = (
    <div className={`inline-flex items-center ${gap} ${className} group select-none cursor-pointer`}>
      {/* High-Tech Falcon Isotype */}
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full group-hover:bg-cyan-400/40 transition-all duration-300" />
        <svg
          width={icon}
          height={icon}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative transform transition-transform duration-300 group-hover:scale-105"
        >
          <defs>
            <linearGradient id="falconCyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00f2fe" />
              <stop offset="60%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#0369a1" />
            </linearGradient>
            <linearGradient id="falconWingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="40%" stopColor="#99f6e4" />
              <stop offset="100%" stopColor="#00f2fe" />
            </linearGradient>
            <linearGradient id="falconDarkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
          </defs>

          {/* Aerodynamic Falcon Wing Layer (Left Feather Blade) */}
          <path
            d="M 10 50 C 25 35, 45 25, 75 22 L 58 40 C 45 42, 30 46, 10 50 Z"
            fill="url(#falconCyanGrad)"
            opacity="0.85"
          />

          {/* Upper Aerodynamic Wing Blade (Speed Stream) */}
          <path
            d="M 18 35 C 35 22, 58 15, 88 12 L 68 28 C 52 30, 36 34, 18 35 Z"
            fill="url(#falconWingGrad)"
          />

          {/* Lower Dynamic Wing Blade */}
          <path
            d="M 22 65 C 38 52, 55 45, 80 42 L 62 58 C 48 60, 34 62, 22 65 Z"
            fill="url(#falconCyanGrad)"
          />

          {/* Falcon Head & Beak Profile */}
          <path
            d="M 60 30 C 72 25, 82 28, 92 40 C 95 44, 96 48, 90 52 C 82 56, 75 52, 70 48 L 60 30 Z"
            fill="#ffffff"
          />

          {/* Falcon Cybernetic Eye Point */}
          <circle cx="78" cy="38" r="3.5" fill="#00f2fe" />
          <circle cx="78" cy="38" r="1.5" fill="#0b0f19" />

          {/* Central Body Shield Vector */}
          <path
            d="M 50 42 L 72 40 L 52 78 L 42 62 Z"
            fill="url(#falconDarkGrad)"
            stroke="url(#falconCyanGrad)"
            strokeWidth="1.5"
          />

          {/* Apex Talon / Lower Keel */}
          <path
            d="M 45 68 L 55 65 L 48 88 Z"
            fill="url(#falconWingGrad)"
          />
        </svg>
      </div>

      {/* Logotype Text */}
      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1">
            <span
              className={`font-heading font-black tracking-wider text-white ${text} group-hover:text-cyan-400 transition-colors duration-200`}
            >
              FALKO
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
          </div>
          <span className="text-[9px] uppercase tracking-[0.25em] text-slate-400 font-semibold">
            Marketplace
          </span>
        </div>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{LogoContent}</Link>;
  }

  return LogoContent;
}
