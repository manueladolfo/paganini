"use client";

import React, { useEffect, useState } from "react";
import { UserDTO } from "@/lib/types";
import { Trophy, Sparkles, PartyPopper } from "lucide-react";

interface LeaderboardHeroProps {
  currentUser: UserDTO;
  allUsers: UserDTO[];
  myRedemptionsCount: number;
  pendingReviewCount: number;
  onViewRewards?: () => void;
}

export function LeaderboardHero({
  currentUser,
  allUsers,
  myRedemptionsCount,
  pendingReviewCount,
  onViewRewards,
}: LeaderboardHeroProps) {
  // Solo miembros activos participantes
  const activeMembers = allUsers
    .filter((u) => u.role === "MEMBER" && u.isActive !== false)
    .sort((a, b) => b.balance - a.balance);

  // Animar los números de balance suavemente
  const [displayedBalance, setDisplayedBalance] = useState(currentUser.balance);

  useEffect(() => {
    let start = displayedBalance;
    const end = currentUser.balance;
    if (start === end) return;

    const duration = 500;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutQuad
      const eased = 1 - (1 - progress) * (1 - progress);
      const currentVal = Math.round(start + (end - start) * eased);
      setDisplayedBalance(currentVal);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [currentUser.balance]);

  // Si hay al menos un miembro, armar los puestos del podio: [2º (izq), 1º (centro), 3º (der)]
  const top1 = activeMembers[0] || null;
  const top2 = activeMembers[1] || null;
  const top3 = activeMembers[2] || null;

  const podiumSlots = [
    { rank: 2, user: top2, label: "2º", borderColor: "border-sky-300 dark:border-sky-400", badgeBg: "bg-sky-500", scale: "scale-90" },
    { rank: 1, user: top1, label: "1º", borderColor: "border-amber-400 ring-4 ring-amber-400/30", badgeBg: "bg-amber-500", scale: "scale-105" },
    { rank: 3, user: top3, label: "3º", borderColor: "border-orange-400", badgeBg: "bg-orange-500", scale: "scale-90" },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 text-white shadow-xl p-3.5 sm:p-5 transition-all duration-300">
      {/* Luces de fondo dinámicas */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/15 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />

      {/* Cabecera del Podio: Título y Saldo en una sola línea compacta */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 animate-bounce shrink-0" />
          <h2 className="text-sm sm:text-base font-black tracking-tight text-white drop-shadow-sm truncate">
            Podio Familiar
          </h2>
        </div>

        {/* Resumen flotante de tu propio saldo en píldora compacta */}
        <div className="flex items-center gap-1.5 shrink-0 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/20">
          <span className="text-[9px] sm:text-[10px] uppercase font-bold text-sky-100 tracking-wider">
            Mi Saldo
          </span>
          <span className="text-xs sm:text-sm font-black text-amber-300 leading-none flex items-center gap-0.5">
            <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
            {displayedBalance} pts
          </span>
        </div>
      </div>

      {/* Podio Visual con los 3 puestos familiares compacto */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 items-end pt-1 pb-1 my-1">
        {podiumSlots.map(({ rank, user, label, borderColor, badgeBg, scale }) => {
          if (!user) {
            return (
              <div key={rank} className="flex flex-col items-center opacity-40">
                <div className="w-10 h-10 sm:w-13 sm:h-13 rounded-full bg-white/10 mb-1 border-2 border-dashed border-white/20" />
                <span className="text-[10px] font-bold text-sky-200">Disponible</span>
              </div>
            );
          }

          const isMe = user.id === currentUser.id;
          const isFirst = rank === 1;

          return (
            <div
              key={user.id}
              className={`flex flex-col items-center transition-all duration-500 ease-out ${scale} ${
                isMe ? "relative" : ""
              }`}
            >
              {/* Avatar + Medalla circular + Badge "TÚ" superpuesto */}
              <div className="relative">
                {isMe && (
                  <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-[8px] font-black uppercase tracking-wider bg-amber-400 text-amber-950 px-1.5 py-0.2 rounded-full shadow-md z-10 animate-pulse">
                    TÚ
                  </span>
                )}
                <img
                  src={
                    user.avatarUrl ||
                    `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.name}`
                  }
                  alt={user.name}
                  className={`${
                    isFirst ? "w-12 h-12 sm:w-15 sm:h-15" : "w-10 h-10 sm:w-13 sm:h-13"
                  } rounded-full bg-white/10 object-cover shadow-lg border-2 sm:border-3 ${borderColor} transition-transform hover:scale-105`}
                />
                <div
                  className={`absolute -bottom-1 -right-1 ${
                    isFirst ? "w-5 h-5 text-[9px]" : "w-4.5 h-4.5 text-[8px]"
                  } rounded-full ${badgeBg} text-white font-black flex items-center justify-center shadow-md border border-white`}
                >
                  {label}
                </div>
              </div>

              {/* Nombre y Puntuación ceñidos */}
              <div className="text-center mt-1 w-full px-0.5">
                <span className="block text-[11px] sm:text-xs font-extrabold text-white truncate drop-shadow-sm leading-tight">
                  {user.name}
                </span>
                <span className="inline-block text-[11px] sm:text-xs font-black text-amber-300 drop-shadow-md leading-tight">
                  {user.balance} pts
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Barra inferior de estado (solo si hay canjes o tareas en revisión) */}
      {(myRedemptionsCount > 0 || pendingReviewCount > 0) && (
        <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-white/15 text-xs">
          {myRedemptionsCount > 0 && (
            <button
              onClick={onViewRewards}
              className="px-2 py-0.5 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 border border-amber-300/40 text-amber-200 text-[10px] sm:text-[11px] font-bold flex items-center gap-1 shadow-sm transition-all cursor-pointer"
            >
              <PartyPopper className="w-3 h-3 text-amber-300" />
              <span>{myRedemptionsCount} canjes</span>
            </button>
          )}

          {pendingReviewCount > 0 && (
            <div className="px-2 py-0.5 rounded-lg bg-white/15 border border-white/20 text-white text-[10px] sm:text-[11px] font-bold flex items-center gap-1 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse" />
              <span>{pendingReviewCount} en revisión</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
