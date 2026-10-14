"use client";

import React, { useState } from "react";
import { UserDTO, TaskDTO, RewardDTO, RewardRedemptionDTO } from "@/lib/types";
import { PodiumRanking } from "./PodiumRanking";
import { TaskCard } from "./TaskCard";
import { RewardCard } from "./RewardCard";
import {
  CheckCircle2,
  Gift,
  ListTodo,
  Award,
  Sparkles,
  PartyPopper,
  Clock,
  Check,
  PauseCircle,
} from "lucide-react";
import { sounds } from "@/lib/sounds";
import { formatDate } from "@/lib/utils";

interface ParticipantViewProps {
  currentUser: UserDTO;
  allUsers: UserDTO[];
  tasks: TaskDTO[];
  rewards: RewardDTO[];
  redemptions: RewardRedemptionDTO[];
  onRefresh: () => void;
}

export function ParticipantView({
  currentUser,
  allUsers,
  tasks,
  rewards,
  redemptions,
  onRefresh,
}: ParticipantViewProps) {
  const [tab, setTab] = useState<"tasks" | "rewards" | "ranking">("tasks");
  const [taskFilter, setTaskFilter] = useState<"all" | "mine" | "collective">("all");
  const [rewardSubTab, setRewardSubTab] = useState<"catalog" | "unlocked">("catalog");

  // Filtrar tareas relevantes para el participante actual
  const relevantTasks = tasks.filter((t) => {
    if (taskFilter === "mine") return t.targetUserId === currentUser.id;
    if (taskFilter === "collective") return !t.targetUserId;
    return t.targetUserId === currentUser.id || !t.targetUserId;
  });

  const pendingReviewCount = tasks.filter(
    (t) => t.status === "IN_REVIEW" && (t.targetUserId === currentUser.id || t.submittedByUserId === currentUser.id)
  ).length;

  // Recompensas canjeadas por este usuario
  const myRedemptions = redemptions.filter((r) => r.userId === currentUser.id);

  const handleTabChange = (newTab: "tasks" | "rewards" | "ranking") => {
    sounds.playMechanicalClick();
    setTab(newTab);
  };

  const handleFilterChange = (filter: "all" | "mine" | "collective") => {
    sounds.playMechanicalClick();
    setTaskFilter(filter);
  };

  const handleRewardSubTabChange = (sub: "catalog" | "unlocked") => {
    sounds.playMechanicalClick();
    setRewardSubTab(sub);
  };

  return (
    <div className="space-y-6 pb-24 animate-fadeIn">
      {/* Banner de Aviso si el perfil está pausado */}
      {currentUser.isActive === false && (
        <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex items-start gap-3 shadow-sm animate-fadeIn">
          <PauseCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold block text-amber-800 dark:text-amber-300">
              Tu perfil está temporalmente en pausa
            </span>
            <span className="text-amber-700/90 dark:text-amber-200/80 leading-relaxed block mt-0.5">
              Tus {currentUser.balance} puntos acumulados siguen guardados. Contacta con tus padres para reactivar tu cuenta desde el modo Administrador.
            </span>
          </div>
        </div>
      )}

      {/* Hero Card del Saldo y Progreso del Participante */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-emerald-800 to-slate-900 text-white border border-brand-500/30 p-6 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-44 h-44 bg-brand-400/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3.5">
            <img
              src={
                currentUser.avatarUrl ||
                `https://api.dicebear.com/7.x/adventurer/svg?seed=${currentUser.name}`
              }
              alt={currentUser.name}
              className="w-14 h-14 rounded-2xl bg-white/10 border-2 border-brand-300 object-cover shadow-glow"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-white">{currentUser.name}</h2>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-brand-100 text-[10px] font-black uppercase tracking-wider border border-white/30">
                  Nivel {Math.floor(currentUser.balance / 100) + 1}
                </span>
              </div>
              <p className="text-xs text-brand-100/80">
                ¡Sigue sumando puntos para canjear tus recompensas!
              </p>
            </div>
          </div>
        </div>

        {/* Balance Display */}
        <div className="flex items-baseline justify-between mt-4 pt-4 border-t border-white/15">
          <div>
            <span className="text-xs font-semibold text-brand-200 uppercase tracking-wider block">
              Balance disponible
            </span>
            <div className="flex items-center gap-2">
              <span className="text-4xl font-black text-amber-300 tracking-tight">
                {currentUser.balance}
              </span>
              <span className="text-sm font-bold text-amber-200/90 uppercase">
                pts
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {myRedemptions.length > 0 && (
              <button
                onClick={() => {
                  setTab("rewards");
                  setRewardSubTab("unlocked");
                }}
                className="px-2.5 py-1.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 border border-amber-300/40 text-amber-200 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <PartyPopper className="w-3.5 h-3.5 text-amber-300" />
                <span>{myRedemptions.length} canjeados</span>
              </button>
            )}

            {pendingReviewCount > 0 && (
              <div className="px-3 py-1.5 rounded-xl bg-amber-400/20 border border-amber-300/40 text-amber-200 text-xs font-bold flex items-center gap-1.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>{pendingReviewCount} en revisión</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navegación por pestañas móvil-first */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-200/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
        <button
          onClick={() => handleTabChange("tasks")}
          className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            tab === "tasks"
              ? "bg-brand-600 text-white shadow-md"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <ListTodo className="w-4 h-4" />
          <span>Tareas</span>
        </button>

        <button
          onClick={() => handleTabChange("rewards")}
          className={`relative flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            tab === "rewards"
              ? "bg-amber-500 text-amber-950 shadow-md"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Gift className="w-4 h-4" />
          <span>Premios</span>
          {myRedemptions.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-500" />
          )}
        </button>

        <button
          onClick={() => handleTabChange("ranking")}
          className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            tab === "ranking"
              ? "bg-sky-600 text-white shadow-md"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Podio</span>
        </button>
      </div>

      {/* Contenido según pestaña */}
      {tab === "tasks" && (
        <div className="space-y-4">
          {/* Subfiltro de tareas */}
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Tareas Pendientes</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border border-slate-300 dark:border-slate-700 font-bold">
                {relevantTasks.length}
              </span>
            </h3>

            <div className="flex gap-1 bg-slate-200/60 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-0.5 rounded-xl text-[11px] font-semibold">
              <button
                onClick={() => handleFilterChange("all")}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  taskFilter === "all"
                    ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => handleFilterChange("mine")}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  taskFilter === "mine"
                    ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                Mías
              </button>
              <button
                onClick={() => handleFilterChange("collective")}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  taskFilter === "collective"
                    ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                Colectivas
              </button>
            </div>
          </div>

          {/* Lista de tarjetas de tareas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {relevantTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                currentUserId={currentUser.id}
                onUpdated={onRefresh}
              />
            ))}
          </div>

          {relevantTasks.length === 0 && (
            <div className="text-center py-12 px-4 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40">
              <CheckCircle2 className="w-12 h-12 text-brand-500 mx-auto mb-3 opacity-60" />
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-300">
                ¡Todo listo por ahora!
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                No tienes tareas pendientes en esta categoría. ¡Buen trabajo!
              </p>
            </div>
          )}
        </div>
      )}

      {tab === "rewards" && (
        <div className="space-y-4">
          {/* Selector de sub-pestaña: Catálogo vs Recompensas Canjeadas */}
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5 p-1 bg-slate-200/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold">
              <button
                onClick={() => handleRewardSubTabChange("catalog")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  rewardSubTab === "catalog"
                    ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-extrabold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Gift className="w-3.5 h-3.5 text-amber-500" />
                <span>Catálogo</span>
              </button>

              <button
                onClick={() => handleRewardSubTabChange("unlocked")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  rewardSubTab === "unlocked"
                    ? "bg-amber-500 text-amber-950 shadow-xs font-extrabold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <PartyPopper className="w-3.5 h-3.5" />
                <span>Desbloqueados ({myRedemptions.length})</span>
              </button>
            </div>

            <div className="flex items-center gap-1 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-600 dark:text-amber-400 text-xs font-black">
              <span>{currentUser.balance} pts</span>
            </div>
          </div>

          {rewardSubTab === "catalog" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {rewards.map((reward) => (
                <RewardCard
                  key={reward.id}
                  reward={reward}
                  userBalance={currentUser.balance}
                  userId={currentUser.id}
                  onRedeemed={onRefresh}
                />
              ))}
            </div>
          )}

          {/* Sección de Recompensas Desbloqueadas por el Usuario */}
          {rewardSubTab === "unlocked" && (
            <div className="space-y-3">
              {myRedemptions.length === 0 ? (
                <div className="text-center py-12 px-4 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40">
                  <Gift className="w-10 h-10 text-amber-500 mx-auto mb-2 opacity-60" />
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-300">
                    Aún no has canjeado recompensas
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                    Completa tareas para acumular puntos y canjear tus premios favoritos del catálogo.
                  </p>
                </div>
              ) : (
                myRedemptions.map((redemption) => {
                  const isDelivered = redemption.status === "DELIVERED";

                  return (
                    <div
                      key={redemption.id}
                      className="bg-white dark:bg-slate-900/80 border border-amber-400/30 dark:border-amber-500/30 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-amber-950 shadow-md">
                          <PartyPopper className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                              Canjeado (-{redemption.costPoints} pts)
                            </span>
                            <span className="text-[11px] text-slate-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDate(redemption.createdAt)}
                            </span>
                          </div>
                          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                            {redemption.title}
                          </h4>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isDelivered ? (
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-xl">
                            <Check className="w-3.5 h-3.5" />
                            <span>Disfrutado</span>
                          </span>
                        ) : (
                          <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400 flex items-center gap-1 bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 rounded-xl animate-pulse">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>¡Listo para pedir a papá/mamá!</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}

      {tab === "ranking" && (
        <div className="space-y-4">
          <PodiumRanking users={allUsers} currentUserId={currentUser.id} />
        </div>
      )}
    </div>
  );
}
