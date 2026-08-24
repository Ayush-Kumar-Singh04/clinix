"use client";

import React, { useId } from "react";

interface LogoProps {
  size?: number;
  showWordmark?: boolean;
  className?: string;
  wordmarkClassName?: string;
}

export default function Logo({
  size = 32,
  showWordmark = true,
  className = "",
  wordmarkClassName = "",
}: LogoProps) {
  const rawId = useId();
  const gradientId = `clinixGrad_${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <div className={`clinix-logo ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-300 group-hover:scale-105"
      >
        <circle
          cx="16"
          cy="16"
          r="15"
          stroke={`url(#${gradientId})`}
          strokeWidth="2"
        />
        <path
          d="M6 16 H11 L13 10 L17 22 L20 16 H26"
          stroke={`url(#${gradientId})`}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <defs>
          <linearGradient
            id={gradientId}
            x1="0"
            y1="0"
            x2="32"
            y2="32"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#0EA5E9" />
            <stop offset="1" stopColor="#14B8A6" />
          </linearGradient>
        </defs>
      </svg>
      {showWordmark && (
        <span className={`clinix-wordmark ${wordmarkClassName}`}>Clinix</span>
      )}
    </div>
  );
}
