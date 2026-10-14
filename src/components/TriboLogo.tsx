"use client";

import React from "react";

interface TriboLogoProps {
  className?: string;
  size?: number;
}

export function TriboLogo({ className = "", size = 78 }: TriboLogoProps) {
  const borderRadius = Math.round(size * 0.26);
  const padding = Math.round(size * 0.17);

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: `${borderRadius}px`,
        padding: `${padding}px`,
      }}
      className={`relative bg-gradient-to-tr from-brand-600 via-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-xl shadow-brand-500/30 shrink-0 transition-transform hover:scale-105 ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-full h-full text-white drop-shadow-md"
      >
        {/* Silueta de casa/hogar acogedor */}
        <path d="M3 10.5L12 3l9 7.5v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        {/* Símbolo central de tribu y equipo */}
        <path
          d="M12 9v6m-3-3h6"
          strokeWidth="2.4"
          className="opacity-95"
        />
        <circle cx="12" cy="12" r="2.4" fill="currentColor" stroke="none" />
      </svg>
    </div>
  );
}
