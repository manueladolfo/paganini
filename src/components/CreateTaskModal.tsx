"use client";

import React, { useState } from "react";
import { UserDTO } from "@/lib/types";
import { X, PlusCircle, Sparkles } from "lucide-react";
import { createTask } from "@/app/actions";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: UserDTO[];
  onCreated?: () => void;
}

export function CreateTaskModal({
  isOpen,
  onClose,
  users,
  onCreated,
}: CreateTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [points, setPoints] = useState<number>(30);
  const [recurrence, setRecurrence] = useState<"DAILY" | "WEEKLY" | "ONCE">("DAILY");
  const [targetUserId, setTargetUserId] = useState<string>("ALL");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || loading) return;

    setLoading(true);
    try {
      await createTask({
        title,
        description,
        points,
        recurrence,
        targetUserId: targetUserId === "ALL" ? null : targetUserId,
      });
      setTitle("");
      setDescription("");
      setPoints(30);
      onCreated?.();
      onClose();
    } catch (err: any) {
      alert(err.message || "Error al crear tarea");
    } finally {
      setLoading(false);
    }
  };

  const members = users.filter((u) => u.role === "MEMBER");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-2xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
            <PlusCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Nueva Tarea Familiar</h2>
            <p className="text-xs text-slate-400">Personal o colectiva para el hogar</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Título de la tarea *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Recoger la mesa tras cenar"
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Descripción o instrucciones
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Fregar platos y dejar bayeta limpia"
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Puntos (+ o -)
              </label>
              <input
                type="number"
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Frecuencia
              </label>
              <select
                value={recurrence}
                onChange={(e) =>
                  setRecurrence(e.target.value as "DAILY" | "WEEKLY" | "ONCE")
                }
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
              >
                <option value="DAILY">Diaria</option>
                <option value="WEEKLY">Semanal</option>
                <option value="ONCE">Puntual (Única)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Asignación
            </label>
            <select
              value={targetUserId}
              onChange={(e) => setTargetUserId(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
            >
              <option value="ALL">👥 Colectiva (Cualquiera puede hacerla)</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  👤 Personal: {m.name}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-gamified bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm py-3 px-4 rounded-xl shadow-gamified flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? "Creando..." : "Crear Tarea"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
