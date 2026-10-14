"use client";

import React from "react";
import { UserDTO } from "@/lib/types";
import { Trophy, Medal, Flame } from "lucide-react";

interface PodiumRankingProps {
  users: UserDTO[];
  currentUserId?: string;
}

export function PodiumRanking({ users, currentUserId }: PodiumRankingProps) {
  // Filtrar solo miembros participantes activos (excluyendo admins y miembros en pausa)
  const members = users
    .filter((u) => u.role === "MEMBER" && u.isActive !== false)
    .sort((a, b) => b.balance - a.balance);

  const top3 = members.slice(0, 3);
  const rest = members.slice(3);

  // Orden para el podio visual: [2º puesto (izq), 1º puesto (centro alto), 3º puesto (der)]
  const podiumOrder = [
    top3[1] || null, // 2º
    top3[0] || null, // 1º
    top3[2] || null, // 3º
  ];

  return (
    <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xl transition-all">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-amber-500/10 rounded-2xl text-amber-500 border border-amber-500/20">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-lg">Ranking de la Tribu</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Puntos acumulados esta semana</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-brand-500/10 border border-brand-500/20 rounded-full text-brand-600 dark:text-brand-400 text-xs font-bold">
          <Flame className="w-3.5 h-3.5 fill-brand-500" />
          <span>En racha</span>
        </div>
      </div>

      {/* Podio Gamificado Top 3 */}
      <div className="grid grid-cols-3 gap-2 items-end pt-4 pb-2 mb-4 border-b border-slate-100 dark:border-slate-800/80">
        {podiumOrder.map((user, idx) => {
          if (!user) {
            return (
              <div key={idx} className="flex flex-col items-center opacity-30">
                <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800 mb-2" />
                <div className="w-full bg-slate-100 dark:bg-slate-800/40 rounded-t-xl h-14" />
              </div>
            );
          }

          const rank = idx === 1 ? 1 : idx === 0 ? 2 : 3;
          const isCurrentUser = user.id === currentUserId;

          const medalColor =
            rank === 1
              ? "from-amber-400 to-amber-600 text-amber-950 border-amber-300"
              : rank === 2
              ? "from-slate-300 to-slate-400 text-slate-900 border-slate-200"
              : "from-amber-700 to-amber-800 text-amber-100 border-amber-600";

          const pillarHeight = rank === 1 ? "h-28" : rank === 2 ? "h-20" : "h-16";

          return (
            <div
              key={user.id}
              className={`flex flex-col items-center transition-all duration-300 ${
                isCurrentUser ? "scale-[1.03]" : ""
              }`}
            >
              {/* Avatar + Medalla flotante */}
              <div className="relative mb-2">
                <img
                  src={user.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.name}`}
                  alt={user.name}
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-slate-100 dark:bg-slate-800 border-2 object-cover shadow-lg ${
                    rank === 1
                      ? "border-amber-400 ring-4 ring-amber-400/20"
                      : rank === 2
                      ? "border-slate-300 dark:border-slate-500"
                      : "border-amber-700"
                  }`}
                />
                <div
                  className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-tr ${medalColor} flex items-center justify-center text-[11px] font-black shadow-md border`}
                >
                  {rank}
                </div>
              </div>

              {/* Nombre y Puntos */}
              <div className="text-center w-full px-1">
                <span className="block text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  {user.name.split(" ")[0]}
                </span>
                <span className="block text-xs font-black text-amber-500">
                  {user.balance} pts
                </span>
              </div>

              {/* Bloque del Podio */}
              <div
                className={`w-full mt-2 rounded-t-xl bg-gradient-to-b ${
                  rank === 1
                    ? "from-amber-500/20 to-slate-100 dark:to-slate-800/80 border-t-2 border-amber-400"
                    : rank === 2
                    ? "from-slate-200 to-slate-100 dark:from-slate-700/20 dark:to-slate-800/60 border-t-2 border-slate-300 dark:border-slate-500"
                    : "from-amber-800/15 to-slate-100 dark:to-slate-800/60 border-t-2 border-amber-600"
                } ${pillarHeight} flex items-center justify-center shadow-inner`}
              >
                {rank === 1 ? (
                  <Trophy className="w-6 h-6 text-amber-500 animate-pulse" />
                ) : (
                  <Medal className="w-5 h-5 text-slate-400" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Miembros restantes */}
      {rest.length > 0 && (
        <div className="space-y-2 mt-3">
          {rest.map((user, idx) => {
            const isCurrentUser = user.id === currentUserId;
            return (
              <div
                key={user.id}
                className={`flex items-center justify-between p-2.5 rounded-xl border ${
                  isCurrentUser
                    ? "bg-brand-50 dark:bg-brand-500/10 border-brand-300 dark:border-brand-500/30"
                    : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400 w-4 text-center">
                    {idx + 4}
                  </span>
                  <img
                    src={user.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.name}`}
                    alt={user.name}
                    className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 object-cover"
                  />
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {user.name}
                  </span>
                </div>
                <span className="text-sm font-black text-amber-500">
                  {user.balance} pts
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
