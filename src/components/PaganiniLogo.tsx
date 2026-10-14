"use client";

import React from "react";
import Image from "next/image";

interface PaganiniLogoProps {
  className?: string;
  size?: number;
}

export function PaganiniLogo({ className = "", size = 78 }: PaganiniLogoProps) {
  const borderRadius = Math.round(size * 0.24);

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: `${borderRadius}px`,
      }}
      className={`relative overflow-hidden bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 flex items-center justify-center shadow-lg shadow-blue-500/25 shrink-0 transition-all duration-300 hover:scale-105 border border-white/20 dark:border-white/10 ${className}`}
    >
      <Image
        src="/paganini-logo.png"
        alt="Paganini Logo"
        width={size}
        height={size}
        priority
        className="w-full h-full object-cover select-none pointer-events-none"
      />
    </div>
  );
}

// Re-export for backward compatibility
export { PaganiniLogo as TriboLogo };
