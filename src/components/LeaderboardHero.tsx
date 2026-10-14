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
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 text-white shadow-2xl p-5 sm:p-6 transition-all duration-300">
      {/* Luces de fondo dinámicas */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />

      {/* Cabecera del Podio */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white drop-shadow-sm">
              Podio Familiar
            </h2>
            <Trophy className="w-6 h-6 text-amber-300 animate-bounce shrink-0" />
          </div>
          <p className="text-xs text-sky-100/90 font-medium mt-0.5">
            ¿Quién va en cabeza con más puntos esta semana?
          </p>
        </div>

        {/* Resumen flotante de tu propio saldo */}
        <div className="text-right shrink-0 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/20">
          <span className="text-[10px] uppercase font-bold text-sky-100 block tracking-wider">
            Mi Saldo
          </span>
          <span className="text-lg font-black text-amber-300 leading-none flex items-center justify-end gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            {displayedBalance} pts
          </span>
        </div>
      </div>

      {/* Podio Visual con los 3 puestos familiares */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 items-end pt-3 pb-2 my-2">
        {podiumSlots.map(({ rank, user, label, borderColor, badgeBg, scale }) => {
          if (!user) {
            return (
              <div key={rank} className="flex flex-col items-center opacity-40">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/10 mb-2 border-2 border-dashed border-white/20" />
                <span className="text-[11px] font-bold text-sky-200">Disponible</span>
              </div>
            );
          }

          const isMe = user.id === currentUser.id;

          return (
            <div
              key={user.id}
              className={`flex flex-col items-center transition-all duration-500 ease-out ${scale} ${
                isMe ? "relative" : ""
              }`}
            >
              {/* Corona o cartel "TÚ" si es el usuario actual */}
              {isMe && (
                <div className="mb-1 text-[9px] font-black uppercase tracking-wider bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full shadow-md animate-pulse">
                  TÚ
                </div>
              )}

              {/* Avatar + Medalla circular */}
              <div className="relative">
                <img
                  src={
                    user.avatarUrl ||
                    `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.name}`
                  }
                  alt={user.name}
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/10 object-cover shadow-xl border-3 ${borderColor} transition-transform hover:scale-105`}
                />
                <div
                  className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full ${badgeBg} text-white font-black text-[10px] flex items-center justify-center shadow-lg border-2 border-white`}
                >
                  {label}
                </div>
              </div>

              {/* Nombre y Puntuación con animación */}
              <div className="text-center mt-2 w-full px-1">
                <span className="block text-xs sm:text-sm font-extrabold text-white truncate drop-shadow-sm">
                  {user.name}
                </span>
                <span className="inline-block text-xs sm:text-sm font-black text-amber-300 drop-shadow-md">
                  {user.balance} pts
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Barra inferior de estado (premios canjeados + tareas en revisión) */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/15 text-xs">
        <div className="flex items-center gap-1.5 text-sky-100 font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
          <span className="text-[11px]">Sincronización en directo</span>
        </div>

        <div className="flex items-center gap-2">
          {myRedemptionsCount > 0 && (
            <button
              onClick={onViewRewards}
              className="px-2.5 py-1 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 border border-amber-300/40 text-amber-200 text-[11px] font-bold flex items-center gap-1 shadow-sm transition-all cursor-pointer"
            >
              <PartyPopper className="w-3.5 h-3.5 text-amber-300" />
              <span>{myRedemptionsCount} canjes</span>
            </button>
          )}

          {pendingReviewCount > 0 && (
            <div className="px-2.5 py-1 rounded-xl bg-white/15 border border-white/20 text-white text-[11px] font-bold flex items-center gap-1 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse" />
              <span>{pendingReviewCount} en revisión</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
