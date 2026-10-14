"use client";

import React, { useState, useEffect } from "react";
import useSWR from "swr";
import { UserDTO, FamilyAppData } from "@/lib/types";
import { ParticipantView } from "@/components/ParticipantView";
import { AdminView } from "@/components/AdminView";
import { UserSwitcher } from "@/components/UserSwitcher";
import { TriboLogo } from "@/components/TriboLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationBell } from "@/components/NotificationBell";
import { Wifi, Sparkles, Volume2, VolumeX } from "lucide-react";
import { sounds } from "@/lib/sounds";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Home() {
  // SWR para sincronización en tiempo real en la red local
  const { data, mutate, isLoading } = useSWR<FamilyAppData>("/api/data", fetcher, {
    refreshInterval: 2500, // Revalida periódicamente para reflejar cambios entre móviles en red local
    revalidateOnFocus: true,
  });

  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [adminUserId, setAdminUserId] = useState<string>("");
  const [isMuted, setIsMuted] = useState<boolean>(false);

  useEffect(() => {
    setIsMuted(sounds.getMuted());
  }, []);

  const toggleSound = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    sounds.setMuted(nextMuted);
    if (!nextMuted) {
      sounds.playMechanicalClick();
    }
  };

  // Inicializar usuario por defecto (primer participante de la familia)
  useEffect(() => {
    if (data?.users && !currentUserId) {
      const firstMember = data.users.find((u) => u.role === "MEMBER") || data.users[0];
      if (firstMember) {
        setCurrentUserId(firstMember.id);
      }
    }
  }, [data, currentUserId]);

  const usersList = Array.isArray(data?.users) ? data.users : [];
  const currentUser = usersList.find((u) => u.id === currentUserId) || usersList[0];
  const currentAdmin = usersList.find((u) => u.id === adminUserId) || usersList.find((u) => u.role === "ADMIN") || currentUser;

  if (isLoading || !data || !currentUser || usersList.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="mb-4 animate-pulse">
          <TriboLogo size={88} />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Tribo</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Conectando a la red local...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col items-center transition-colors duration-200">
      {/* Contenedor central adaptado a Mobile-First (max-w-md / max-w-lg en tablet) */}
      <div className="w-full max-w-lg min-h-screen flex flex-col px-3 sm:px-4 pt-3 sm:pt-6">
        {/* Cabecera Principal */}
        <header className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 dark:border-slate-800/80">
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <TriboLogo size={52} className="sm:hidden" />
            <TriboLogo size={62} className="hidden sm:flex" />
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white">
                  Tribo
                </h1>
                {data.dbMode === "SUPABASE" ? (
                  <span className="text-[10px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded-md font-extrabold uppercase tracking-wide">
                    Nube
                  </span>
                ) : (
                  <span className="text-[10px] bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30 px-1.5 py-0.5 rounded-md font-extrabold uppercase tracking-wide">
                    Local
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="truncate">
                  {data.dbMode === "SUPABASE" ? "Supabase Online" : "Red Local"}
                </span>
              </div>
            </div>
          </div>

          {/* Acciones de Cabecera: Sonido + Notificaciones + Selector de Tema + Switcher de Usuario */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <button
              onClick={toggleSound}
              aria-label={isMuted ? "Activar efectos de sonido" : "Silenciar efectos de sonido"}
              className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm flex items-center justify-center text-slate-600 dark:text-slate-300 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              title={isMuted ? "Activar sonidos hápticos" : "Silenciar sonidos"}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-slate-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              )}
            </button>

            <NotificationBell
              currentUser={currentUser}
              notifications={data.notifications || []}
              onRefresh={() => mutate()}
            />

            <ThemeToggle />

            <UserSwitcher
              users={data.users}
              currentUser={currentUser}
              onSelectUser={(u) => {
                setCurrentUserId(u.id);
                if (u.role === "ADMIN") {
                  setAdminUserId(u.id);
                  setIsAdminMode(true);
                } else {
                  setIsAdminMode(false);
                }
              }}
              isAdminMode={isAdminMode}
              onEnterAdmin={(admin) => {
                if (admin) setAdminUserId(admin.id);
                setIsAdminMode(true);
              }}
              onExitAdmin={() => {
                setIsAdminMode(false);
                const firstMember = data.users.find((u) => u.role === "MEMBER");
                if (firstMember) setCurrentUserId(firstMember.id);
              }}
            />
          </div>
        </header>

        {/* Cuerpo de la Aplicación según Rol/Modo */}
        {isAdminMode && currentAdmin ? (
          <AdminView
            currentAdmin={currentAdmin}
            users={data.users}
            tasks={data.tasks}
            rewards={data.rewards}
            logs={data.logs}
            redemptions={data.redemptions || []}
            submissions={data.submissions || []}
            onRefresh={() => mutate()}
            onExitAdmin={() => {
              setIsAdminMode(false);
              const firstMember = data.users.find((u) => u.role === "MEMBER");
              if (firstMember) setCurrentUserId(firstMember.id);
            }}
          />
        ) : (
          <ParticipantView
            currentUser={currentUser}
            allUsers={data.users}
            tasks={data.tasks}
            rewards={data.rewards}
            redemptions={data.redemptions || []}
            onRefresh={() => mutate()}
          />
        )}
      </div>
    </main>
  );
}
