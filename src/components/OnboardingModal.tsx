"use client";

import React, { useEffect, useState, useRef } from "react";
import { X, Play, Sparkles } from "lucide-react";
import { sounds } from "@/lib/sounds";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    } else if (!isOpen && videoRef.current) {
      videoRef.current.pause();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    sounds.playMechanicalClick();
    try {
      localStorage.setItem("paganini-onboarding-v1", "seen");
    } catch (_) {}
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div
        className="fixed inset-0"
        onClick={handleClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[92vh]">
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-amber-400/15 text-amber-400">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white tracking-tight">
                Descubre Paganini en 1 minuto
              </h3>
              <p className="text-[11px] text-slate-400">
                Hábitos, tareas y podio familiar en tiempo real
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Cerrar video"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Reproductor de Video */}
        <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
          <video
            ref={videoRef}
            src="/paganini-demo.mp4"
            poster="/paganini-demo-thumb.jpg"
            controls
            playsInline
            className="w-full h-full object-contain"
          />
        </div>

        {/* Pie con botón de inicio */}
        <div className="p-4 sm:p-5 bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800">
          <span className="text-xs text-slate-400 text-center sm:text-left">
            Diseñado para toda la familia • Compatible con iPhone, iPad, Android y PC
          </span>

          <button
            onClick={handleClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold text-xs sm:text-sm hover:from-emerald-400 hover:to-teal-500 shadow-lg shadow-emerald-500/25 active:scale-98 transition-all cursor-pointer text-center shrink-0"
          >
            ¡Empezar ahora! 🚀
          </button>
        </div>
      </div>
    </div>
  );
}
