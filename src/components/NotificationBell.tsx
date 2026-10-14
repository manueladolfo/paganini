"use client";

import React, { useState } from "react";
import { UserDTO, NotificationDTO } from "@/lib/types";
import { Bell, Gift, CheckCircle2, Clock, X, Trash2, ArrowRight } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { sounds } from "@/lib/sounds";
import {
  markUserNotificationsRead,
  deleteUserNotification,
  clearAllUserNotifications,
} from "@/app/actions";

interface NotificationBellProps {
  currentUser: UserDTO;
  notifications: NotificationDTO[];
  onRefresh?: () => void;
}

export function NotificationBell({
  currentUser,
  notifications,
  onRefresh,
}: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Filtrar notificaciones visibles para el usuario actual (excluir las que él mismo borró)
  const visibleNotifications = notifications.filter((n) => {
    const userState = n.userStates?.find((s) => s.userId === currentUser.id);
    return !userState?.isDismissed;
  });

  // Notificaciones no leídas para este usuario específico
  const unreadCount = visibleNotifications.filter((n) => {
    const userState = n.userStates?.find((s) => s.userId === currentUser.id);
    return !userState?.isRead;
  }).length;

  const handleOpen = async () => {
    sounds.playMechanicalClick();
    const nextState = !isOpen;
    setIsOpen(nextState);

    // Al abrir, marcar como leídas inmediatamente para este usuario específico
    if (nextState && unreadCount > 0) {
      try {
        await markUserNotificationsRead(currentUser.id);
        onRefresh?.();
      } catch (err) {
        console.error("Error al marcar notificaciones como leídas:", err);
      }
    }
  };

  const handleDelete = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.playMechanicalClick();
    try {
      await deleteUserNotification(notificationId, currentUser.id);
      onRefresh?.();
    } catch (err) {
      console.error("Error al borrar notificación:", err);
    }
  };

  const handleClearAll = async () => {
    sounds.playMechanicalClick();
    if (!confirm("¿Deseas vaciar tu lista de notificaciones?")) return;
    setLoading(true);
    try {
      await clearAllUserNotifications(currentUser.id);
      onRefresh?.();
    } catch (err) {
      console.error("Error al vaciar notificaciones:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      {/* Botón de la Campanita */}
      <button
        onClick={handleOpen}
        aria-label="Notificaciones familiares"
        className="relative w-9 h-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm flex items-center justify-center text-slate-700 dark:text-slate-300 transition-all hover:scale-105 active:scale-95 cursor-pointer"
        title="Notificaciones en tiempo real"
      >
        <Bell className="w-4 h-4" />
        {/* Puntito rojo que desaparece en tiempo real para este usuario cuando las ve */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center shadow-md animate-bounce">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Modal / Panel Desplegable */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed sm:absolute top-16 sm:top-full left-3 right-3 sm:left-auto sm:right-0 mt-2 sm:w-92 max-w-[calc(100vw-1.5rem)] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-4 z-50 animate-fadeIn backdrop-blur-xl">
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-1.5 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 shrink-0">
                  <Bell className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white truncate">
                    Notificaciones • {currentUser.name}
                  </h3>
                  <p className="text-[10px] text-slate-400 truncate">
                    Sincronización en tiempo real
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {visibleNotifications.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    disabled={loading}
                    className="text-[11px] font-semibold text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 px-1.5 py-0.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                    title="Vaciar todas las notificaciones"
                  >
                    Borrar todas
                  </button>
                )}
                <button
                  onClick={() => {
                    sounds.playMechanicalClick();
                    setIsOpen(false);
                  }}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Listado de notificaciones */}
            <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
              {visibleNotifications.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No tienes notificaciones en tu bandeja.
                </div>
              ) : (
                visibleNotifications.map((n) => {
                  const userState = n.userStates?.find((s) => s.userId === currentUser.id);
                  const isUnread = !userState?.isRead;
                  const isReward = n.type === "REWARD_CLAIMED" || n.type === "REWARD";

                  return (
                    <div
                      key={n.id}
                      className={`group p-2.5 rounded-2xl border transition-all text-left flex items-start justify-between gap-2.5 ${
                        isUnread
                          ? "bg-brand-500/10 border-brand-500/30"
                          : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800"
                      }`}
                    >
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        <div className="relative shrink-0 mt-0.5">
                          <img
                            src={
                              n.actorAvatar ||
                              `https://api.dicebear.com/7.x/adventurer/svg?seed=${n.actorName}`
                            }
                            alt={n.actorName}
                            className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 object-cover"
                          />
                          <div
                            className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px] shadow-xs ${
                              isReward
                                ? "bg-amber-500"
                                : (n.pointsDelta || 0) > 0
                                ? "bg-emerald-500"
                                : "bg-sky-500"
                            }`}
                          >
                            {isReward ? (
                              <Gift className="w-2.5 h-2.5" />
                            ) : (n.pointsDelta || 0) > 0 ? (
                              <CheckCircle2 className="w-2.5 h-2.5" />
                            ) : (
                              <Clock className="w-2.5 h-2.5" />
                            )}
                          </div>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {n.title}
                            </span>
                            <span className="text-[10px] text-slate-400 shrink-0">
                              {formatDate(n.createdAt).split(",")[1] || formatDate(n.createdAt)}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug">
                            {n.description}
                          </p>
                        </div>
                      </div>

                      {/* Botón individual para borrar esta notificación */}
                      <button
                        onClick={(e) => handleDelete(n.id, e)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0 cursor-pointer"
                        title="Borrar notificación"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
