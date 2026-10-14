"use client";

import React, { useState } from "react";
import { TaskDTO } from "@/lib/types";
import { CheckCircle2, Clock, Users, User as UserIcon } from "lucide-react";
import confetti from "canvas-confetti";
import { markTaskInReview } from "@/app/actions";
import { sounds } from "@/lib/sounds";

interface TaskCardProps {
  task: TaskDTO;
  currentUserId: string;
  onUpdated?: () => void;
}

export function TaskCard({ task, currentUserId, onUpdated }: TaskCardProps) {
  const [loading, setLoading] = useState(false);

  const isAssignedToMe = task.targetUserId === currentUserId;
  const isCollective = !task.targetUserId;
  // Comprobar si este usuario ya completó o envió la tarea hoy (para tareas diarias)
  const todayStr = new Date().toDateString();
  const submissionTodayByMe = task.submissions?.find((s) => {
    return s.userId === currentUserId && new Date(s.createdAt).toDateString() === todayStr;
  });

  const isDoneToday = Boolean(submissionTodayByMe);
  const isPunctual = task.recurrence === "ONCE";
  const isPenalty = task.points < 0;

  const handleMarkReview = async () => {
    sounds.playMechanicalClick();
    if (loading) return;
    setLoading(true);

    try {
      await markTaskInReview(task.id, currentUserId);
      sounds.playSuccessChime();
      // Gamification confetti effect
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ["#22c55e", "#3b82f6", "#eab308"],
      });
      onUpdated?.();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const recurrenceLabel = {
    DAILY: "Diaria",
    WEEKLY: "Semanal",
    ONCE: "Puntual / Por Encargo",
  }[task.recurrence] || task.recurrence;

  return (
    <div
      className={`relative rounded-2xl border transition-all duration-200 p-4 shadow-sm ${
        isDoneToday
          ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-500/30"
          : isPenalty
          ? "bg-rose-50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-500/30"
          : "bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md"
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        {/* Badges de Tarea */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
              task.recurrence === "DAILY"
                ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20"
                : task.recurrence === "WEEKLY"
                ? "bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-500/20"
                : "bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-500/20"
            }`}
          >
            {recurrenceLabel}
          </span>

          {isCollective ? (
            <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              <Users className="w-3 h-3 text-brand-600 dark:text-brand-400" />
              Colectiva
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              <UserIcon className="w-3 h-3 text-sky-600 dark:text-sky-400" />
              {task.targetUser?.name || "Personal"}
            </span>
          )}
        </div>

        {/* Puntos de la tarea */}
        <div
          className={`px-2.5 py-1 rounded-xl text-xs font-black shadow-sm flex items-center gap-1 ${
            isPenalty
              ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30"
              : "bg-brand-500/15 text-brand-700 dark:text-brand-400 border border-brand-500/30"
          }`}
        >
          {task.points > 0 ? `+${task.points}` : task.points} pts
        </div>
      </div>

      {/* Título y descripción */}
      <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug mb-1">
        {task.title}
      </h4>
      {task.description && (
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
          {task.description}
        </p>
      )}

      {/* Botón de acción según el estado */}
      <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60 mt-3">
        {isDoneToday && task.recurrence === "DAILY" ? (
          <div className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Completada hoy (Se reinicia a las 00:00)</span>
          </div>
        ) : isDoneToday && submissionTodayByMe?.status === "PENDING" ? (
          <div className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-semibold">
            <Clock className="w-4 h-4 text-amber-500" />
            <span>Enviada a revisión (Acumulada para validar)</span>
          </div>
        ) : (
          <button
            onClick={handleMarkReview}
            disabled={loading}
            className="w-full btn-gamified bg-brand-600 hover:bg-brand-500 active:bg-brand-700 border-b-brand-800 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-gamified flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{loading ? "Enviando..." : isPunctual ? "Realizada (Enviar a revisión)" : "Marcar para revisión"}</span>
          </button>
        )}
      </div>
    </div>
  );
}
