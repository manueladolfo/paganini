"use client";

import React, { useState } from "react";
import { UserDTO } from "@/lib/types";
import { X, Award, AlertTriangle, Sparkles } from "lucide-react";
import { addManualPoints } from "@/app/actions";

interface ManualPointsModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: UserDTO[];
  onUpdated?: () => void;
}

export function ManualPointsModal({
  isOpen,
  onClose,
  users,
  onUpdated,
}: ManualPointsModalProps) {
  const members = users.filter((u) => u.role === "MEMBER");
  const [selectedUserId, setSelectedUserId] = useState<string>(
    members[0]?.id || ""
  );
  const [pointsDelta, setPointsDelta] = useState<number>(25);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const quickButtons = [
    { label: "+10", value: 10, positive: true },
    { label: "+25", value: 25, positive: true },
    { label: "+50", value: 50, positive: true },
    { label: "-15", value: -15, positive: false },
    { label: "-25", value: -25, positive: false },
    { label: "-50", value: -50, positive: false },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !description.trim() || pointsDelta === 0 || loading)
      return;

    setLoading(true);
    try {
      await addManualPoints(
        selectedUserId,
        pointsDelta,
        description.trim(),
        pointsDelta < 0 ? "PENALTY" : "MANUAL"
      );
      setDescription("");
      onUpdated?.();
      onClose();
    } catch (err: any) {
      alert(err.message || "Error al asignar puntos");
    } finally {
      setLoading(false);
    }
  };

  const isPositive = pointsDelta > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full bg-slate-100 dark:bg-slate-800/60"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div
            className={`p-2.5 rounded-2xl border ${
              isPositive
                ? "bg-brand-500/10 text-brand-600 dark:text-brand-400 border-brand-500/20"
                : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
            }`}
          >
            {isPositive ? (
              <Award className="w-6 h-6" />
            ) : (
              <AlertTriangle className="w-6 h-6" />
            )}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Ajuste Manual de Puntos
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Bonificaciones o penalizaciones por comportamiento
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Familiar
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-500 font-medium"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} (Saldo actual: {m.balance} pts)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Puntos a sumar o restar
            </label>
            <div className="grid grid-cols-6 gap-1.5 mb-2.5">
              {quickButtons.map((btn) => (
                <button
                  key={btn.label}
                  type="button"
                  onClick={() => setPointsDelta(btn.value)}
                  className={`py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                    pointsDelta === btn.value
                      ? btn.positive
                        ? "bg-brand-500 text-white border-brand-500 shadow-sm"
                        : "bg-rose-500 text-white border-rose-500 shadow-sm"
                      : btn.positive
                      ? "bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 border-brand-200 dark:border-brand-500/20"
                      : "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20"
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            <input
              type="number"
              value={pointsDelta}
              onChange={(e) => setPointsDelta(Number(e.target.value))}
              placeholder="O escribe cantidad personalizada"
              className={`w-full bg-slate-50 dark:bg-slate-800/80 border rounded-xl px-3.5 py-2.5 text-sm font-black focus:outline-none ${
                isPositive
                  ? "text-brand-600 dark:text-brand-400 border-brand-500/40"
                  : "text-rose-600 dark:text-rose-400 border-rose-500/40"
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Motivo o descripción *
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Excelente actitud ayudando a los abuelos"
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`w-full btn-gamified font-bold text-sm py-3 px-4 rounded-xl shadow-gamified flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                isPositive
                  ? "bg-brand-600 hover:bg-brand-500 text-white border-b-brand-800"
                  : "bg-rose-600 hover:bg-rose-500 text-white border-b-rose-800"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {loading
                  ? "Guardando..."
                  : isPositive
                  ? `Aplicar Bonificación (+${pointsDelta} pts)`
                  : `Aplicar Penalización (${pointsDelta} pts)`}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
