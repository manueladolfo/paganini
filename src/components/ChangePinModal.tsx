"use client";

import React, { useState } from "react";
import { UserDTO } from "@/lib/types";
import { X, KeyRound, Check, Shield } from "lucide-react";
import { updateUserPin } from "@/app/actions";
import { sounds } from "@/lib/sounds";

interface ChangePinModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminUser: UserDTO;
  onSaved?: () => void;
}

export function ChangePinModal({
  isOpen,
  onClose,
  adminUser,
  onSaved,
}: ChangePinModalProps) {
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playMechanicalClick();
    setError("");

    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setError("El nuevo PIN debe contener exactamente 4 dígitos.");
      return;
    }

    if (newPin !== confirmPin) {
      setError("Los códigos PIN no coinciden. Verifícalos.");
      return;
    }

    setLoading(true);
    try {
      await updateUserPin(adminUser.id, newPin);
      sounds.playSuccessChime();
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setNewPin("");
        setConfirmPin("");
        onSaved?.();
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Error al actualizar PIN");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl relative">
        <button
          onClick={() => {
            sounds.playMechanicalClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full bg-slate-100 dark:bg-slate-800/60"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center mb-5 text-center">
          <div className="w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-600 dark:text-brand-400 mb-3 shadow-glow">
            <KeyRound className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Cambiar PIN de {adminUser.name}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Cada padre puede tener su propio código secreto de 4 dígitos
          </p>
        </div>

        {success ? (
          <div className="py-6 text-center animate-fadeIn">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-500 mx-auto flex items-center justify-center mb-2">
              <Check className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              ¡PIN actualizado con éxito!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Nuevo PIN (4 dígitos)
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                required
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
                placeholder="••••"
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-center text-xl font-mono tracking-widest text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Confirmar Nuevo PIN
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                required
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
                placeholder="••••"
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-center text-xl font-mono tracking-widest text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            {error && (
              <p className="text-rose-500 text-xs text-center font-bold animate-shake">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || newPin.length !== 4}
              className="w-full btn-gamified bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs py-3 px-4 rounded-xl shadow-gamified flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Shield className="w-4 h-4" />
              <span>{loading ? "Guardando..." : "Establecer Nuevo PIN"}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
