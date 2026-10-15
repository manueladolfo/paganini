"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import {
  X,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Trophy,
  CheckCircle2,
  Shield,
  Gift,
  Volume2,
  VolumeX,
} from "lucide-react";
import { sounds } from "@/lib/sounds";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TourSlide {
  badge: string;
  badgeColor: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  highlights: { icon: any; title: string; desc: string }[];
}

const slides: TourSlide[] = [
  {
    badge: "1. MOTIVACIÓN FAMILIAR",
    badgeColor: "bg-sky-500/15 text-sky-400 border-sky-500/30",
    title: "Podio Familiar y Puntos",
    subtitle: "¿Quién va en cabeza esta semana?",
    description:
      "Una clasificación interactiva en tiempo real donde los niños ven su esfuerzo reconocido con medallas y puntos acumulables.",
    image: "/tour/01-podio-tareas.png",
    highlights: [
      {
        icon: Trophy,
        title: "Medallas 1º, 2º y 3º",
        desc: "Competencia sana y divertida para motivar el cumplimiento de rutinas.",
      },
      {
        icon: Sparkles,
        title: "Saldo en directo",
        desc: "Cada punto ganado se suma automáticamente a la cuenta del hijo.",
      },
    ],
  },
  {
    badge: "2. HÁBITOS Y AUTONOMÍA",
    badgeColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    title: "Tareas Diarias y Semanales",
    subtitle: "Claridad total sin discusiones",
    description:
      "Organiza las responsabilidades de casa: ordenar la habitación, hacer deporte, deberes o tareas colectivas de la familia.",
    image: "/tour/04-gestion-tareas.png",
    highlights: [
      {
        icon: CheckCircle2,
        title: "Marcar para revisión",
        desc: "Los hijos marcan con un solo toque la tarea que han completado.",
      },
      {
        icon: Sparkles,
        title: "Puntos claros",
        desc: "Cada tarea tiene asignado su valor (+150 pts, +240 pts) por adelantado.",
      },
    ],
  },
  {
    badge: "3. CONTROL PARENTAL SEGURO",
    badgeColor: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    title: "Supervisión con PIN",
    subtitle: "Panel exclusivo para Papá y Mamá",
    description:
      "Acceso protegido con PIN de 4 dígitos para validar las tareas enviadas, añadir nuevas responsabilidades y ver el historial.",
    image: "/tour/03-admin-pin.png",
    highlights: [
      {
        icon: Shield,
        title: "PIN personal",
        desc: "Papá y Mamá tienen su propio código privado de administración.",
      },
      {
        icon: CheckCircle2,
        title: "Aprobación en 1 toque",
        desc: "Valida la tarea y los puntos se transfieren al instante.",
      },
    ],
  },
  {
    badge: "4. RECOMPENSAS MERECIDAS",
    badgeColor: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    title: "Catálogo de Premios",
    subtitle: "El esfuerzo se celebra en familia",
    description:
      "Los puntos acumulados se canjean por planes pactados: tarde de cine, elegir la cena del viernes, videojuegos o salidas familiares.",
    image: "/tour/02-recompensas.png",
    highlights: [
      {
        icon: Gift,
        title: "Canjes con confeti",
        desc: "Al pulsar canjear, se celebra el logro y se notifica a los padres.",
      },
      {
        icon: Sparkles,
        title: "Sincronizado en la nube",
        desc: "Conectado a Supabase en iPhone, iPad, Android y ordenadores a la vez.",
      },
    ],
  },
];

export function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMelodyMuted, setIsMelodyMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCurrentSlide(0);
      // Iniciar suavemente la melodía ambiental
      if (audioRef.current) {
        audioRef.current.volume = 0.25;
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
  }, [isOpen]);

  const toggleMelody = () => {
    if (!audioRef.current) return;
    const nextMuted = !isMelodyMuted;
    setIsMelodyMuted(nextMuted);
    audioRef.current.muted = nextMuted;
  };

  if (!isOpen) return null;

  const current = slides[currentSlide];
  const isLast = currentSlide === slides.length - 1;

  const handleNext = () => {
    sounds.playMechanicalClick();
    if (isLast) {
      handleFinish();
    } else {
      setCurrentSlide((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    sounds.playMechanicalClick();
    setCurrentSlide((prev) => Math.max(0, prev - 1));
  };

  const handleFinish = () => {
    sounds.playSuccessChime();
    try {
      localStorage.setItem("paganini-onboarding-v2", "seen");
    } catch (_) {}
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-fadeIn">
      {/* Audio ambiental relajante para el tour */}
      <audio ref={audioRef} src="/tour/ambient.m4a" loop />

      {/* Backdrop */}
      <div
        className="fixed inset-0"
        onClick={handleFinish}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[92vh]">
        {/* Cabecera del Tour */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-800 bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="p-1.5 rounded-xl bg-amber-400/15 text-amber-400 shrink-0">
              <Sparkles className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-black text-white tracking-tight truncate">
                Tour Guiado de Paganini
              </h3>
              <p className="text-[11px] text-slate-400 truncate">
                Paso {currentSlide + 1} de {slides.length}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleMelody}
              aria-label={isMelodyMuted ? "Activar música suave" : "Silenciar música"}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title={isMelodyMuted ? "Activar música ambiental" : "Silenciar música ambiental"}
            >
              {isMelodyMuted ? (
                <VolumeX className="w-4 h-4 text-slate-500" />
              ) : (
                <Volume2 className="w-4 h-4 text-amber-400 animate-pulse" />
              )}
            </button>

            <button
              onClick={handleFinish}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Cerrar tour"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contenido de la Diapositiva */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-center">
            {/* Imagen real en marco de móvil Retina */}
            <div className="relative aspect-[3/4] max-h-[320px] sm:max-h-[380px] w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-xl flex items-center justify-center p-2 group">
              <img
                src={current.image}
                alt={current.title}
                className="w-full h-full object-contain rounded-xl transition-transform duration-300 group-hover:scale-102"
              />
            </div>

            {/* Texto y Explicaciones de la Diapositiva */}
            <div className="space-y-3">
              <span
                className={`inline-block text-[10px] uppercase font-black px-2 py-0.5 rounded-md border tracking-wider ${current.badgeColor}`}
              >
                {current.badge}
              </span>

              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
                {current.title}
              </h2>

              <p className="text-xs sm:text-sm text-sky-400 font-semibold">
                {current.subtitle}
              </p>

              <p className="text-xs text-slate-300 leading-relaxed">
                {current.description}
              </p>

              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                {current.highlights.map((h, i) => {
                  const Icon = h.icon;
                  return (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-800/40 border border-slate-800"
                    >
                      <Icon className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-white">
                          {h.title}
                        </div>
                        <div className="text-[11px] text-slate-400 leading-snug">
                          {h.desc}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Barra de Navegación Inferior (Dots + Botones) */}
        <div className="px-4 sm:px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
          {/* Indicadores de Puntos (Dots) */}
          <div className="flex items-center gap-1.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  sounds.playMechanicalClick();
                  setCurrentSlide(idx);
                }}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  idx === currentSlide
                    ? "w-6 bg-brand-500"
                    : "w-2 bg-slate-700 hover:bg-slate-600"
                }`}
                aria-label={`Ir a diapositiva ${idx + 1}`}
              />
            ))}
          </div>

          {/* Botones de Control */}
          <div className="flex items-center gap-2">
            {currentSlide > 0 && (
              <button
                onClick={handlePrev}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Anterior</span>
              </button>
            )}

            <button
              onClick={handleNext}
              className={`px-4 sm:px-5 py-2 rounded-xl text-white font-extrabold text-xs sm:text-sm shadow-md active:scale-98 transition-all flex items-center gap-1.5 cursor-pointer ${
                isLast
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 shadow-emerald-500/25"
                  : "bg-brand-600 hover:bg-brand-500 shadow-brand-500/25"
              }`}
            >
              <span>{isLast ? "¡Empezar ahora! 🚀" : "Siguiente"}</span>
              {!isLast && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
