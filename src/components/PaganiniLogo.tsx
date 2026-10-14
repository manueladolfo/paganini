"use client";

import React, { useState } from "react";
import Image from "next/image";
import { sounds } from "@/lib/sounds";

interface PaganiniLogoProps {
  className?: string;
  size?: number;
  interactive?: boolean;
}

export function PaganiniLogo({
  className = "",
  size = 78,
  interactive = true,
}: PaganiniLogoProps) {
  const borderRadius = Math.round(size * 0.24);
  const [isCrying, setIsCrying] = useState(false);

  const handleClick = () => {
    if (!interactive) return;
    sounds.playCartoonCry();
    setIsCrying(true);
    setTimeout(() => {
      setIsCrying(false);
    }, 1400);
  };

  return (
    <div className="relative inline-flex items-center justify-center select-none">
      {/* Botón táctil del icono */}
      <button
        type="button"
        onClick={handleClick}
        title={interactive ? "¡Tócame para escuchar el lamento de Paganini! 💸" : undefined}
        style={{
          width: size,
          height: size,
          borderRadius: `${borderRadius}px`,
        }}
        className={`relative overflow-hidden flex items-center justify-center shadow-lg shadow-blue-500/25 shrink-0 border border-white/25 dark:border-white/10 transition-transform active:scale-90 ${
          isCrying ? "animate-paganini-cry ring-4 ring-amber-400/60" : "hover:scale-105"
        } ${className}`}
      >
        <Image
          src="/paganini-logo.png"
          alt="Paganini Logo"
          width={size}
          height={size}
          priority
          className="w-full h-full object-cover pointer-events-none"
        />
      </button>

      {/* Bocadillo cómico flotante durante el llanto */}
      {isCrying && (
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 z-50 whitespace-nowrap bg-slate-900/95 dark:bg-slate-800/95 text-amber-300 border border-amber-400/40 text-[11px] font-black px-2 py-0.5 rounded-full shadow-xl pointer-events-none animate-bounce">
          💸 ¡UGH! 😭
        </div>
      )}
    </div>
  );
}

// Re-export for backward compatibility
export { PaganiniLogo as TriboLogo };
