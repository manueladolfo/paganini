"use client";

import React, { useState } from "react";
import { UserDTO } from "@/lib/types";
import { Lock, Delete, X } from "lucide-react";
import { verifyAdminPin } from "@/app/actions";
import { sounds } from "@/lib/sounds";

interface PinModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser?: UserDTO | null;
  onSuccess: () => void;
}

export function PinModal({ isOpen, onClose, targetUser, onSuccess }: PinModalProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleKeyPress = (digit: string) => {
    sounds.playMechanicalClick();
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError(false);
      if (nextPin.length === 4) {
        verify(nextPin);
      }
    }
  };

  const handleDelete = () => {
    sounds.playMechanicalClick();
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  const verify = async (pinToTest: string) => {
    setLoading(true);
    try {
      const isValid = await verifyAdminPin(pinToTest, targetUser?.id);
      if (isValid) {
        sounds.playSuccessChime();
        setPin("");
        setError(false);
        onSuccess();
      } else {
        sounds.playPenaltyTone();
        setError(true);
        setPin("");
      }
    } catch {
      sounds.playPenaltyTone();
      setError(true);
      setPin("");
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

        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-600 dark:text-brand-400 mb-3 shadow-glow">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {targetUser ? `PIN de ${targetUser.name}` : "Acceso Administrador"}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Introduce tu PIN de 4 dígitos ({targetUser?.pin ? "personalizado" : "por defecto: 1234"})
          </p>
        </div>

        {/* 4 dots display */}
        <div className="flex justify-center gap-4 mb-6">
          {[0, 1, 2, 3].map((index) => {
            const isFilled = pin.length > index;
            return (
              <div
                key={index}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  error
                    ? "bg-rose-500 animate-bounce"
                    : isFilled
                    ? "bg-brand-500 scale-125 shadow-glow"
                    : "bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                }`}
              />
            );
          })}
        </div>

        {error && (
          <p className="text-rose-500 text-xs text-center font-bold mb-4 animate-shake">
            PIN incorrecto. Vuelve a intentarlo.
          </p>
        )}

        {/* Teclado numérico táctil */}
        <div className="grid grid-cols-3 gap-3">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
            <button
              key={num}
              type="button"
              disabled={loading}
              onClick={() => handleKeyPress(num)}
              className="h-14 rounded-2xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 active:bg-slate-300 dark:active:bg-slate-600 text-xl font-bold text-slate-900 dark:text-white transition-all shadow-sm border border-slate-200 dark:border-slate-700/60 active:scale-95 flex items-center justify-center cursor-pointer"
            >
              {num}
            </button>
          ))}
          <div />
          <button
            type="button"
            disabled={loading}
            onClick={() => handleKeyPress("0")}
            className="h-14 rounded-2xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 active:bg-slate-300 dark:active:bg-slate-600 text-xl font-bold text-slate-900 dark:text-white transition-all shadow-sm border border-slate-200 dark:border-slate-700/60 active:scale-95 flex items-center justify-center cursor-pointer"
          >
            0
          </button>
          <button
            type="button"
            disabled={loading || pin.length === 0}
            onClick={handleDelete}
            className="h-14 rounded-2xl bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all shadow-sm border border-slate-200 dark:border-slate-700/60 active:scale-95 flex items-center justify-center cursor-pointer"
          >
            <Delete className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
