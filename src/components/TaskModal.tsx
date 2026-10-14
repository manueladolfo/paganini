"use client";

import React, { useState, useEffect } from "react";
import { UserDTO, TaskDTO } from "@/lib/types";
import { X, PlusCircle, Edit3, Sparkles, Trash2 } from "lucide-react";
import { createTask, updateTask, deleteTask } from "@/app/actions";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: TaskDTO | null; // null si estamos creando una nueva tarea
  users: UserDTO[];
  onSaved?: () => void;
}

export function TaskModal({
  isOpen,
  onClose,
  taskToEdit,
  users,
  onSaved,
}: TaskModalProps) {
  const isEditing = Boolean(taskToEdit);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [points, setPoints] = useState<number>(30);
  const [recurrence, setRecurrence] = useState<"DAILY" | "WEEKLY" | "ONCE">("DAILY");
  const [targetUserId, setTargetUserId] = useState<string>("ALL");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || "");
      setPoints(taskToEdit.points);
      setRecurrence(
        (taskToEdit.recurrence as "DAILY" | "WEEKLY" | "ONCE") || "DAILY"
      );
      setTargetUserId(taskToEdit.targetUserId || "ALL");
    } else {
      setTitle("");
      setDescription("");
      setPoints(30);
      setRecurrence("DAILY");
      setTargetUserId("ALL");
    }
  }, [taskToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || loading) return;

    setLoading(true);
    try {
      if (isEditing && taskToEdit) {
        await updateTask(taskToEdit.id, {
          title,
          description,
          points,
          recurrence,
          targetUserId: targetUserId === "ALL" ? null : targetUserId,
        });
      } else {
        await createTask({
          title,
          description,
          points,
          recurrence,
          targetUserId: targetUserId === "ALL" ? null : targetUserId,
        });
      }
      onSaved?.();
      onClose();
    } catch (err: any) {
      alert(err.message || "Error al procesar tarea");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!taskToEdit) return;
    if (!confirm("¿Deseas eliminar permanentemente esta tarea?")) return;

    setLoading(true);
    try {
      await deleteTask(taskToEdit.id);
      onSaved?.();
      onClose();
    } catch (err: any) {
      alert(err.message || "Error al eliminar tarea");
    } finally {
      setLoading(false);
    }
  };

  const members = users.filter((u) => u.role === "MEMBER");

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
          <div className="p-2.5 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
            {isEditing ? <Edit3 className="w-6 h-6" /> : <PlusCircle className="w-6 h-6" />}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {isEditing ? "Editar Tarea" : "Nueva Tarea Familiar"}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isEditing
                ? "Modifica los requisitos o puntos asignados"
                : "Personal o colectiva para cualquier miembro de la tribu"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Título de la tarea *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Ordenar la habitación o pasear al perro"
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Descripción o instrucciones
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Instrucciones claras para completarla adecuadamente..."
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Puntos (+ o -)
              </label>
              <input
                type="number"
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-bold focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Frecuencia
              </label>
              <select
                value={recurrence}
                onChange={(e) =>
                  setRecurrence(e.target.value as "DAILY" | "WEEKLY" | "ONCE")
                }
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-500 font-medium"
              >
                <option value="DAILY">Diaria</option>
                <option value="WEEKLY">Semanal</option>
                <option value="ONCE">Puntual (Única)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Asignación
            </label>
            <select
              value={targetUserId}
              onChange={(e) => setTargetUserId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-500 font-medium"
            >
              <option value="ALL">👥 Colectiva (Cualquiera puede hacerla)</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  👤 Personal: {m.name} {m.isActive === false ? "(En pausa)" : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2 space-y-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-gamified bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm py-3 px-4 rounded-xl shadow-gamified flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {loading
                  ? "Guardando..."
                  : isEditing
                  ? "Guardar Cambios de la Tarea"
                  : "Crear Tarea"}
              </span>
            </button>

            {isEditing && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Eliminar esta tarea</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
