"use client";

import React, { useState } from "react";
import { UserDTO, TaskDTO, ActivityLogDTO, RewardDTO, RewardRedemptionDTO } from "@/lib/types";
import {
  CheckCircle2,
  XCircle,
  Plus,
  Sliders,
  History,
  ShieldAlert,
  Trash2,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Gift,
  Check,
  Edit2,
  Users,
  UserPlus,
  KeyRound,
  PartyPopper,
  PauseCircle,
  Gamepad2,
  UtensilsCrossed,
  Film,
  Banknote,
  Sparkles,
  Trophy,
  Music,
  IceCream,
  ShoppingBag,
  Heart,
  Star,
  Database,
} from "lucide-react";
import { approveTask, rejectTask, deleteTask, markRewardDelivered, toggleUserActive, deleteReward } from "@/app/actions";
import { TaskModal } from "./TaskModal";
import { ManualPointsModal } from "./ManualPointsModal";
import { EditUserModal } from "./EditUserModal";
import { ChangePinModal } from "./ChangePinModal";
import { RewardModal } from "./RewardModal";
import { BackupModal } from "./BackupModal";
import { formatDate } from "@/lib/utils";
import { sounds } from "@/lib/sounds";

interface AdminViewProps {
  currentAdmin: UserDTO;
  users: UserDTO[];
  tasks: TaskDTO[];
  rewards: RewardDTO[];
  logs: ActivityLogDTO[];
  redemptions: RewardRedemptionDTO[];
  onRefresh: () => void;
  onExitAdmin: () => void;
}

export function AdminView({
  currentAdmin,
  users,
  tasks,
  rewards,
  logs,
  redemptions,
  onRefresh,
  onExitAdmin,
}: AdminViewProps) {
  const [activeTab, setActiveTab] = useState<"pending" | "redemptions" | "tasks" | "family" | "audit">("pending");
  const [redemptionSubTab, setRedemptionSubTab] = useState<"requests" | "catalog">("requests");
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<TaskDTO | null>(null);
  const [manualPointsModalOpen, setManualPointsModalOpen] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<UserDTO | null>(null);
  const [rewardModalOpen, setRewardModalOpen] = useState(false);
  const [rewardToEdit, setRewardToEdit] = useState<RewardDTO | null>(null);
  const [backupModalOpen, setBackupModalOpen] = useState(false);
  const [changePinModalOpen, setChangePinModalOpen] = useState(false);
  const [processingTaskId, setProcessingTaskId] = useState<string | null>(null);

  // Tareas en estado "IN_REVIEW" esperando aprobación
  const pendingTasks = tasks.filter((t) => t.status === "IN_REVIEW");

  // Recompensas pendientes de entregar/disfrutar
  const pendingRedemptions = redemptions.filter((r) => r.status !== "DELIVERED");

  const handleTabClick = (tab: "pending" | "redemptions" | "tasks" | "family" | "audit") => {
    sounds.playMechanicalClick();
    setActiveTab(tab);
  };

  const handleApprove = async (taskId: string) => {
    sounds.playMechanicalClick();
    setProcessingTaskId(taskId);
    try {
      await approveTask(taskId, currentAdmin.name);
      sounds.playSuccessChime();
      onRefresh();
    } catch (err: any) {
      alert(err.message || "Error al validar tarea");
    } finally {
      setProcessingTaskId(null);
    }
  };

  const handleReject = async (taskId: string) => {
    sounds.playMechanicalClick();
    setProcessingTaskId(taskId);
    try {
      await rejectTask(taskId);
      sounds.playPenaltyTone();
      onRefresh();
    } catch (err: any) {
      alert(err.message || "Error al rechazar tarea");
    } finally {
      setProcessingTaskId(null);
    }
  };

  const handleDeliverRedemption = async (redemptionId: string) => {
    sounds.playMechanicalClick();
    try {
      await markRewardDelivered(redemptionId);
      sounds.playSuccessChime();
      onRefresh();
    } catch (err: any) {
      alert(err.message || "Error al actualizar premio");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    sounds.playMechanicalClick();
    if (!confirm("¿Deseas eliminar esta tarea permanentemente?")) return;
    try {
      await deleteTask(taskId);
      sounds.playPenaltyTone();
      onRefresh();
    } catch (err: any) {
      alert(err.message || "Error al eliminar tarea");
    }
  };

  const openCreateTask = () => {
    sounds.playMechanicalClick();
    setTaskToEdit(null);
    setTaskModalOpen(true);
  };

  const openEditTask = (task: TaskDTO) => {
    sounds.playMechanicalClick();
    setTaskToEdit(task);
    setTaskModalOpen(true);
  };

  const openCreateUser = () => {
    sounds.playMechanicalClick();
    setUserToEdit(null);
    setUserModalOpen(true);
  };

  const openEditUser = (user: UserDTO) => {
    sounds.playMechanicalClick();
    setUserToEdit(user);
    setUserModalOpen(true);
  };

  const handleToggleUserActive = async (user: UserDTO) => {
    sounds.playMechanicalClick();
    try {
      await toggleUserActive(user.id);
      onRefresh();
    } catch (err: any) {
      alert(err.message || "Error al cambiar estado del miembro");
    }
  };

  const openCreateReward = () => {
    sounds.playMechanicalClick();
    setRewardToEdit(null);
    setRewardModalOpen(true);
  };

  const openEditReward = (reward: RewardDTO) => {
    sounds.playMechanicalClick();
    setRewardToEdit(reward);
    setRewardModalOpen(true);
  };

  const handleDeleteReward = async (rewardId: string, title: string) => {
    if (!confirm(`¿Seguro que deseas eliminar el premio "${title}" del catálogo?`)) return;
    sounds.playMechanicalClick();
    try {
      await deleteReward(rewardId);
      onRefresh();
    } catch (err: any) {
      alert(err.message || "Error al eliminar el premio");
    }
  };

  return (
    <div className="space-y-6 pb-24 animate-fadeIn">
      {/* Banner de Modo Administrador activo */}
      <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-rose-500/30 p-3.5 sm:p-5 flex items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
          <img
            src={
              currentAdmin.avatarUrl ||
              `https://api.dicebear.com/7.x/adventurer/svg?seed=${currentAdmin.name}`
            }
            alt={currentAdmin.name}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-slate-100 dark:bg-slate-800 object-cover border-2 border-rose-500 shadow-sm shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white truncate">
                Panel de {currentAdmin.name}
              </h2>
              <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 text-[9px] sm:text-[10px] font-black uppercase border border-rose-500/20 shrink-0">
                ADMIN
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5 text-[10px] sm:text-[11px]">
              <button
                onClick={() => {
                  sounds.playMechanicalClick();
                  setChangePinModalOpen(true);
                }}
                className="font-bold text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <KeyRound className="w-3 h-3 shrink-0" />
                <span>PIN {currentAdmin.pin ? "(••••)" : "(1234)"}</span>
              </button>

              <span className="text-slate-300 dark:text-slate-700 text-xs">•</span>

              <button
                onClick={() => {
                  sounds.playMechanicalClick();
                  setBackupModalOpen(true);
                }}
                className="font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 transition-colors cursor-pointer"
                title="Copia de Seguridad y Restauración"
              >
                <Database className="w-3 h-3 text-indigo-500 shrink-0" />
                <span>Copia de Seguridad</span>
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            sounds.playMechanicalClick();
            onExitAdmin();
          }}
          className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all cursor-pointer border border-slate-200 dark:border-slate-700 shrink-0"
        >
          Salir
        </button>
      </div>

      {/* Botones de acción rápida superiores */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={openCreateTask}
          className="btn-gamified bg-brand-600 hover:bg-brand-500 active:bg-brand-700 border-b-brand-800 text-white font-bold text-xs py-3.5 px-4 rounded-2xl shadow-gamified flex items-center justify-center gap-2 cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Añadir Nueva Tarea</span>
        </button>

        <button
          onClick={() => {
            sounds.playMechanicalClick();
            setManualPointsModalOpen(true);
          }}
          className="btn-gamified bg-amber-500 hover:bg-amber-400 active:bg-amber-600 border-b-amber-700 text-amber-950 font-black text-xs py-3.5 px-4 rounded-2xl shadow-gamified flex items-center justify-center gap-2 cursor-pointer transition-all"
        >
          <Sliders className="w-4 h-4" />
          <span>Ajustar Puntos (+ / -)</span>
        </button>
      </div>

      {/* Pestañas de administración */}
      <div className="grid grid-cols-5 gap-1 p-1 bg-slate-200/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-[11px] font-bold">
        <button
          onClick={() => handleTabClick("pending")}
          className={`flex flex-col sm:flex-row items-center justify-center gap-1 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === "pending"
              ? "bg-amber-500 text-amber-950 shadow-md font-extrabold"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Clock className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Validar</span>
          {pendingTasks.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-black flex items-center justify-center">
              {pendingTasks.length}
            </span>
          )}
        </button>

        <button
          onClick={() => handleTabClick("redemptions")}
          className={`relative flex flex-col sm:flex-row items-center justify-center gap-1 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === "redemptions"
              ? "bg-amber-500 text-amber-950 shadow-md font-extrabold"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Gift className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Canjes</span>
          {pendingRedemptions.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-amber-600 text-white text-[9px] font-black flex items-center justify-center">
              {pendingRedemptions.length}
            </span>
          )}
        </button>

        <button
          onClick={() => handleTabClick("tasks")}
          className={`flex flex-col sm:flex-row items-center justify-center gap-1 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === "tasks"
              ? "bg-brand-600 text-white shadow-md font-extrabold"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Tareas</span>
        </button>

        <button
          onClick={() => handleTabClick("family")}
          className={`flex flex-col sm:flex-row items-center justify-center gap-1 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === "family"
              ? "bg-sky-600 text-white shadow-md font-extrabold"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Users className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Familia</span>
        </button>

        <button
          onClick={() => handleTabClick("audit")}
          className={`flex flex-col sm:flex-row items-center justify-center gap-1 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === "audit"
              ? "bg-purple-600 text-white shadow-md font-extrabold"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <History className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Auditoría</span>
        </button>
      </div>

      {/* 1. Sección: Tareas Pendientes de Validación */}
      {activeTab === "pending" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Pendientes de Aprobación</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold">
                {pendingTasks.length}
              </span>
            </h3>
          </div>

          {pendingTasks.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40">
              <Check className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-300">
                ¡Todas las tareas están al día!
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                No hay entregas pendientes de revisión por los participantes.
              </p>
            </div>
          ) : (
            pendingTasks.map((task) => {
              const claimant = users.find(
                (u) => u.id === (task.submittedByUserId || task.targetUserId)
              );

              return (
                <div
                  key={task.id}
                  className="bg-white dark:bg-slate-900/90 border border-amber-500/40 rounded-2xl p-4 shadow-md flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30">
                          {task.recurrence}
                        </span>
                        {claimant && (
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                            <img
                              src={
                                claimant.avatarUrl ||
                                `https://api.dicebear.com/7.x/adventurer/svg?seed=${claimant.name}`
                              }
                              alt={claimant.name}
                              className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 object-cover"
                            />
                            <span>{claimant.name}</span>
                          </div>
                        )}
                      </div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {task.description}
                        </p>
                      )}
                    </div>

                    <span className="text-sm font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/20 shrink-0">
                      +{task.points} pts
                    </span>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => handleApprove(task.id)}
                      disabled={processingTaskId === task.id}
                      className="flex-1 btn-gamified bg-emerald-600 hover:bg-emerald-500 border-b-emerald-800 text-white font-bold text-xs py-2.5 px-3 rounded-xl shadow-gamified flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Aprobar (+{task.points} pts)</span>
                    </button>

                    <button
                      onClick={() => handleReject(task.id)}
                      disabled={processingTaskId === task.id}
                      className="btn-gamified bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 border-b-slate-400 dark:border-b-slate-950 text-slate-700 dark:text-slate-300 font-bold text-xs py-2.5 px-3 rounded-xl shadow-gamified flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4 text-rose-500" />
                      <span>Rechazar</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 2. Sección: Canjes y Catálogo de Premios */}
      {activeTab === "redemptions" && (
        <div className="space-y-4">
          {/* Sub-selector: Solicitudes de Canjes vs Catálogo de Premios */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold">
            <button
              onClick={() => {
                sounds.playMechanicalClick();
                setRedemptionSubTab("requests");
              }}
              className={`flex-1 py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                redemptionSubTab === "requests"
                  ? "bg-amber-500 text-amber-950 font-black shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Solicitudes de Canje</span>
              {pendingRedemptions.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-700 text-white text-[9px] font-black flex items-center justify-center">
                  {pendingRedemptions.length}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                sounds.playMechanicalClick();
                setRedemptionSubTab("catalog");
              }}
              className={`flex-1 py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                redemptionSubTab === "catalog"
                  ? "bg-amber-500 text-amber-950 font-black shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Gift className="w-3.5 h-3.5" />
              <span>Catálogo de Premios</span>
              <span className="text-[10px] opacity-80">({rewards.length})</span>
            </button>
          </div>

          {/* Sub-sección A: Solicitudes de canjes realizadas por los hijos */}
          {redemptionSubTab === "requests" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Premios desbloqueados que los participantes tienen pendientes de disfrutar
                </p>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400">
                  {redemptions.length} canjes
                </span>
              </div>

              {redemptions.length === 0 ? (
                <div className="text-center py-12 px-4 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40">
                  <PartyPopper className="w-10 h-10 text-amber-500 mx-auto mb-2 opacity-60" />
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-300">
                    No hay solicitudes de canjes en este momento
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Cuando los hijos canjeen puntos en el catálogo, aparecerán aquí para que los padres puedan marcarlos como entregados.
                  </p>
                </div>
              ) : (
                redemptions.map((redemption) => {
                  const isDelivered = redemption.status === "DELIVERED";

                  return (
                    <div
                      key={redemption.id}
                      className={`border rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3 transition-all ${
                        isDelivered
                          ? "bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60"
                          : "bg-white dark:bg-slate-900/90 border-amber-400/40 dark:border-amber-500/40 shadow-md"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            redemption.user.avatarUrl ||
                            `https://api.dicebear.com/7.x/adventurer/svg?seed=${redemption.user.name}`
                          }
                          alt={redemption.user.name}
                          className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 object-cover border border-slate-200 dark:border-slate-700 shadow-sm"
                        />
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                              {redemption.user.name}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {formatDate(redemption.createdAt)}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                            {redemption.title}
                          </h4>
                          <span className="text-[11px] font-black text-amber-500">
                            -{redemption.costPoints} puntos
                          </span>
                        </div>
                      </div>

                      <div>
                        {isDelivered ? (
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-3 py-1 rounded-xl">
                            <Check className="w-3.5 h-3.5" />
                            <span>Entregada</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => handleDeliverRedemption(redemption.id)}
                            className="btn-gamified bg-amber-500 hover:bg-amber-400 active:bg-amber-600 border-b-amber-700 text-amber-950 font-bold text-xs py-2 px-3 rounded-xl shadow-gamified flex items-center gap-1 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Marcar Entregada</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Sub-sección B: Gestión del Catálogo de Premios */}
          {redemptionSubTab === "catalog" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Catálogo de Premios de la Familia ({rewards.length})
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Añade o edita los premios disponibles y los puntos necesarios
                  </p>
                </div>
                <button
                  onClick={openCreateReward}
                  className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-amber-950 shadow-sm transition-all cursor-pointer font-black"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nuevo Premio</span>
                </button>
              </div>

              {rewards.length === 0 ? (
                <div className="text-center py-12 px-4 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40">
                  <Gift className="w-10 h-10 text-amber-500 mx-auto mb-2 opacity-60" />
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-300">
                    El catálogo está vacío
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Crea recompensas motivadoras para que los chicos puedan canjear sus puntos acumulados.
                  </p>
                  <button
                    onClick={openCreateReward}
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-amber-500 text-amber-950 shadow-sm transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Crear Primer Premio</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2.5">
                  {rewards.map((reward) => {
                    const iconName = reward.icon || "Gift";
                    const IconComp =
                      (iconName === "Gamepad2" && Gamepad2) ||
                      (iconName === "UtensilsCrossed" && UtensilsCrossed) ||
                      (iconName === "Film" && Film) ||
                      (iconName === "Banknote" && Banknote) ||
                      (iconName === "Sparkles" && Sparkles) ||
                      (iconName === "Trophy" && Trophy) ||
                      (iconName === "Music" && Music) ||
                      (iconName === "IceCream" && IceCream) ||
                      (iconName === "ShoppingBag" && ShoppingBag) ||
                      (iconName === "Heart" && Heart) ||
                      (iconName === "Star" && Star) ||
                      Gift;

                    return (
                      <div
                        key={reward.id}
                        className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                            <IconComp className="w-6 h-6" />
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                                {reward.title}
                              </h4>
                              <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                                {reward.costPoints} pts
                              </span>
                            </div>

                            {reward.description && (
                              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                                {reward.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => openEditReward(reward)}
                            className="p-2 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Editar premio"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteReward(reward.id, reward.title)}
                            className="p-2 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Eliminar premio"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 3. Sección: Catálogo y Edición de Tareas */}
      {activeTab === "tasks" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Todas las Tareas ({tasks.length})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Añade, edita o elimina tareas del hogar
              </p>
            </div>
            <button
              onClick={openCreateTask}
              className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl bg-brand-500 text-white hover:bg-brand-600 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Añadir</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                      {task.recurrence}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {task.targetUserId
                        ? `👤 ${task.targetUser?.name}`
                        : "👥 Colectiva"}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                    {task.title}
                  </h4>
                  {task.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                      {task.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={`text-xs font-black px-2 py-1 rounded-xl ${
                      task.points >= 0
                        ? "text-brand-600 dark:text-brand-400 bg-brand-500/10"
                        : "text-rose-600 dark:text-rose-400 bg-rose-500/10"
                    }`}
                  >
                    {task.points > 0 ? `+${task.points}` : task.points} pts
                  </span>

                  <button
                    onClick={() => openEditTask(task)}
                    className="p-2 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Editar tarea"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-2 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Eliminar tarea"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Sección: Gestión de Miembros de la Familia */}
      {activeTab === "family" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Miembros de la Tribu ({users.length})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configura fotos de perfil, roles y saldos
              </p>
            </div>
            <button
              onClick={openCreateUser}
              className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl bg-sky-600 text-white hover:bg-sky-500 shadow-sm transition-all cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Nuevo Miembro</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {users.map((user) => {
              const isAdmin = user.role === "ADMIN";
              const isActive = user.isActive ?? true;

              return (
                <div
                  key={user.id}
                  className={`border rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-sm transition-all ${
                    isActive
                      ? "bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                      : "bg-slate-100/70 dark:bg-slate-900/40 border-dashed border-amber-300/80 dark:border-amber-800/60 opacity-80"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={
                          user.avatarUrl ||
                          `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.name}`
                        }
                        alt={user.name}
                        className={`w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 object-cover border border-slate-200 dark:border-slate-700 shadow-sm ${
                          !isActive ? "grayscale contrast-125 opacity-70" : ""
                        }`}
                      />
                      {!isActive && (
                        <span className="absolute -bottom-1 -right-1 p-0.5 bg-amber-500 text-amber-950 rounded-full shadow-sm" title="Usuario pausado">
                          <PauseCircle className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className={`text-sm font-extrabold ${isActive ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400"}`}>
                          {user.name}
                        </h4>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                            isAdmin
                              ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                              : "bg-brand-500/15 text-brand-600 dark:text-brand-400"
                          }`}
                        >
                          {isAdmin ? "ADMIN" : "MIEMBRO"}
                        </span>

                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                            isActive
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                              : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                          }`}
                        >
                          {isActive ? "Activo" : "En pausa"}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-amber-500 mt-0.5">
                        {!isAdmin ? `${user.balance} puntos acumulados` : "Rol Administrador (sin saldo de puntos)"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleToggleUserActive(user)}
                      className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? "text-slate-500 hover:text-amber-600 bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-amber-400"
                          : "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20"
                      }`}
                      title={isActive ? "Pausar/Desactivar perfil" : "Reactivar perfil"}
                    >
                      {isActive ? (
                        <PauseCircle className="w-4 h-4 text-amber-500" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      )}
                    </button>

                    <button
                      onClick={() => openEditUser(user)}
                      className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Sección: Auditoría del Historial */}
      {activeTab === "audit" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Historial de Auditoría en Tiempo Real
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Movimientos recientes
            </span>
          </div>

          <div className="space-y-2">
            {logs.map((log) => {
              const isPositive = log.pointsDelta > 0;
              const isReward = log.type === "REWARD";

              return (
                <div
                  key={log.id}
                  className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 flex items-center justify-between gap-3 text-xs shadow-sm"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`p-2 rounded-xl shrink-0 ${
                        isReward
                          ? "bg-amber-500/10 text-amber-500"
                          : isPositive
                          ? "bg-brand-500/10 text-brand-600 dark:text-brand-400"
                          : "bg-rose-500/10 text-rose-500"
                      }`}
                    >
                      {isReward ? (
                        <Gift className="w-4 h-4" />
                      ) : isPositive ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownLeft className="w-4 h-4" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {log.user.name}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {formatDate(log.createdAt)}
                        </span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 leading-snug">
                        {log.description}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`font-black shrink-0 px-2 py-0.5 rounded-lg ${
                      isPositive
                        ? "text-brand-600 dark:text-brand-400 bg-brand-500/10"
                        : "text-rose-600 dark:text-rose-400 bg-rose-500/10"
                    }`}
                  >
                    {isPositive ? `+${log.pointsDelta}` : log.pointsDelta} pts
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modales */}
      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => {
          setTaskModalOpen(false);
          setTaskToEdit(null);
        }}
        taskToEdit={taskToEdit}
        users={users}
        onSaved={onRefresh}
      />

      <ManualPointsModal
        isOpen={manualPointsModalOpen}
        onClose={() => setManualPointsModalOpen(false)}
        users={users}
        onUpdated={onRefresh}
      />

      <EditUserModal
        isOpen={userModalOpen}
        onClose={() => {
          setUserModalOpen(false);
          setUserToEdit(null);
        }}
        userToEdit={userToEdit}
        onSaved={onRefresh}
      />

      <ChangePinModal
        isOpen={changePinModalOpen}
        onClose={() => setChangePinModalOpen(false)}
        adminUser={currentAdmin}
        onSaved={onRefresh}
      />

      <RewardModal
        isOpen={rewardModalOpen}
        onClose={() => {
          setRewardModalOpen(false);
          setRewardToEdit(null);
        }}
        rewardToEdit={rewardToEdit}
        onSaved={onRefresh}
      />

      <BackupModal
        isOpen={backupModalOpen}
        onClose={() => setBackupModalOpen(false)}
        onRestored={onRefresh}
      />
    </div>
  );
}
