"use client";

import React, { useState, useEffect } from "react";
import { RewardDTO } from "@/lib/types";
import {
  X,
  Gift,
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
  Trash2,
} from "lucide-react";
import { createReward, updateReward, deleteReward } from "@/app/actions";
import { sounds } from "@/lib/sounds";

interface RewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  rewardToEdit?: RewardDTO | null; // null si es nuevo premio
  onSaved?: () => void;
}

const AVAILABLE_ICONS = [
  { name: "Gift", label: "Regalo", icon: Gift },
  { name: "Gamepad2", label: "Videojuegos", icon: Gamepad2 },
  { name: "UtensilsCrossed", label: "Comida", icon: UtensilsCrossed },
  { name: "Film", label: "Cine", icon: Film },
  { name: "Banknote", label: "Dinero", icon: Banknote },
  { name: "Sparkles", label: "Especial", icon: Sparkles },
  { name: "Trophy", label: "Trofeo", icon: Trophy },
  { name: "Music", label: "Música", icon: Music },
  { name: "IceCream", label: "Helado/Postre", icon: IceCream },
  { name: "ShoppingBag", label: "Compras", icon: ShoppingBag },
  { name: "Heart", label: "Favorito", icon: Heart },
  { name: "Star", label: "Estrella", icon: Star },
];

export function RewardModal({
  isOpen,
  onClose,
  rewardToEdit,
  onSaved,
}: RewardModalProps) {
  const isEditing = Boolean(rewardToEdit);

  const [title, setTitle] = useState("");
  const [costPoints, setCostPoints] = useState<number>(150);
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("Gift");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (rewardToEdit) {
      setTitle(rewardToEdit.title);
      setCostPoints(rewardToEdit.costPoints);
      setDescription(rewardToEdit.description || "");
      setIcon(rewardToEdit.icon || "Gift");
    } else {
      setTitle("");
      setCostPoints(150);
      setDescription("");
      setIcon("Gift");
    }
  }, [rewardToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || costPoints <= 0 || loading) return;

    sounds.playMechanicalClick();
    setLoading(true);

    try {
      if (isEditing && rewardToEdit) {
        await updateReward(rewardToEdit.id, {
          title,
          costPoints,
          description,
          icon,
        });
      } else {
        await createReward({
          title,
          costPoints,
          description,
          icon,
        });
      }
      onSaved?.();
      onClose();
    } catch (err: any) {
      alert(err.message || "Error al guardar el premio");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!rewardToEdit) return;
    if (
      !confirm(
        `¿Seguro que deseas eliminar el premio "${rewardToEdit.title}" del catálogo?`
      )
    )
      return;

    sounds.playMechanicalClick();
    setLoading(true);

    try {
      await deleteReward(rewardToEdit.id);
      onSaved?.();
      onClose();
    } catch (err: any) {
      alert(err.message || "Error al eliminar el premio");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => {
            sounds.playMechanicalClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full bg-slate-100 dark:bg-slate-800/60 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Gift className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
              {isEditing ? "Editar Premio del Catálogo" : "Nuevo Premio en el Catálogo"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Define los puntos y detalles de la recompensa
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Título del Premio *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: 1 hora extra de videojuegos, Tarde de cine..."
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Coste en Puntos para Canjear *
            </label>
            <div className="relative">
              <input
                type="number"
                required
                min={5}
                step={5}
                value={costPoints}
                onChange={(e) => setCostPoints(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-amber-500 dark:text-amber-400 font-black focus:outline-none focus:border-amber-500"
              />
              <span className="absolute right-3.5 top-2.5 text-xs font-bold text-slate-400">
                Puntos
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Icono Representativo
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {AVAILABLE_ICONS.map((item) => {
                const IconComponent = item.icon;
                const isSelected = icon === item.name;

                return (
                  <button
                    type="button"
                    key={item.name}
                    onClick={() => {
                      sounds.playMechanicalClick();
                      setIcon(item.name);
                    }}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-amber-500 text-amber-950 border-amber-600 shadow-md font-bold scale-105"
                        : "bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-400"
                    }`}
                    title={item.label}
                  >
                    <IconComponent className="w-5 h-5 mb-1" />
                    <span className="text-[9px] truncate w-full text-center">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Descripción / Condiciones (Opcional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Válido para el fin de semana tras terminar los deberes..."
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="pt-2 space-y-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-gamified bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-amber-950 font-black text-sm py-3 px-4 rounded-xl shadow-gamified flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {loading
                  ? "Guardando..."
                  : isEditing
                  ? "Guardar Cambios"
                  : "Añadir al Catálogo"}
              </span>
            </button>

            {isEditing && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Eliminar este premio</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
