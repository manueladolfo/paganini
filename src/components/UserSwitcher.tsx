"use client";

import React, { useState } from "react";
import { UserDTO } from "@/lib/types";
import { Shield, ChevronDown, Check, Sparkles } from "lucide-react";
import { PinModal } from "./PinModal";
import { sounds } from "@/lib/sounds";

interface UserSwitcherProps {
  users: UserDTO[];
  currentUser: UserDTO;
  onSelectUser: (user: UserDTO) => void;
  isAdminMode: boolean;
  onEnterAdmin: (adminUser?: UserDTO) => void;
  onExitAdmin: () => void;
}

export function UserSwitcher({
  users,
  currentUser,
  onSelectUser,
  isAdminMode,
  onEnterAdmin,
  onExitAdmin,
}: UserSwitcherProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pendingAdminTarget, setPendingAdminTarget] = useState<UserDTO | null>(null);

  const handleUserClick = (user: UserDTO) => {
    sounds.playMechanicalClick();
    setDropdownOpen(false);
    if (user.role === "ADMIN") {
      setPendingAdminTarget(user);
      setPinModalOpen(true);
    } else {
      if (isAdminMode) {
        onExitAdmin();
      }
      onSelectUser(user);
    }
  };

  const handleAdminAuthSuccess = () => {
    setPinModalOpen(false);
    const target = pendingAdminTarget || users.find((u) => u.role === "ADMIN") || currentUser;
    onSelectUser(target);
    onEnterAdmin(target);
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setDropdownOpen((prev) => !prev)}
          className="flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all text-left shadow-sm active:scale-98 cursor-pointer"
        >
          <img
            src={
              currentUser.avatarUrl ||
              `https://api.dicebear.com/7.x/adventurer/svg?seed=${currentUser.name}`
            }
            alt={currentUser.name}
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 object-cover border border-slate-200 dark:border-slate-700"
          />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1">
              {currentUser.name}
              {currentUser.role === "ADMIN" && (
                <span className="text-[10px] bg-rose-500/15 text-rose-600 dark:text-rose-400 px-1.5 py-0.2 rounded-md font-bold">
                  ADMIN
                </span>
              )}
            </span>
            {currentUser.role !== "ADMIN" ? (
              <span className="text-[11px] text-amber-500 font-extrabold flex items-center gap-0.5">
                <Sparkles className="w-3 h-3 text-amber-500 inline" />
                {currentUser.balance} pts
              </span>
            ) : (
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                Supervisor
              </span>
            )}
          </div>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 ml-1 transition-transform duration-200 ${
              dropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 z-40 animate-fadeIn backdrop-blur-xl">
            <div className="px-3 py-2 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
              Cambiar de perfil familiar
            </div>

            <div className="space-y-1 mt-1.5">
              {users.map((u) => {
                const isSelected = u.id === currentUser.id;
                const isAdmin = u.role === "ADMIN";
                const isActive = u.isActive ?? true;

                return (
                  <button
                    key={u.id}
                    onClick={() => handleUserClick(u)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all cursor-pointer ${
                      isSelected
                        ? "bg-brand-500/15 text-brand-700 dark:text-brand-300 font-bold"
                        : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                    } ${!isActive ? "opacity-60" : ""}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={
                          u.avatarUrl ||
                          `https://api.dicebear.com/7.x/adventurer/svg?seed=${u.name}`
                        }
                        alt={u.name}
                        className={`w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 object-cover ${
                          !isActive ? "grayscale" : ""
                        }`}
                      />
                      <div>
                        <div className="text-xs font-bold flex items-center gap-1.5">
                          <span>{u.name}</span>
                          {isAdmin && (
                            <Shield className="w-3 h-3 text-rose-500 inline" />
                          )}
                          {!isActive && (
                            <span className="text-[9px] bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 px-1 py-0.2 rounded font-extrabold uppercase">
                              Pausado
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-amber-500 font-semibold">
                          {!isAdmin ? `${u.balance} pts` : "Administrador"}
                        </div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-brand-500" />}
                  </button>
                );
              })}
            </div>

            <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              {!isAdminMode ? (
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    setPinModalOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
                >
                  <Shield className="w-4 h-4 text-rose-500" />
                  <span>Modo Administrador (PIN)</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    onExitAdmin();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold transition-all cursor-pointer"
                >
                  <span>Salir del Modo Admin</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <PinModal
        isOpen={pinModalOpen}
        onClose={() => setPinModalOpen(false)}
        targetUser={pendingAdminTarget}
        onSuccess={handleAdminAuthSuccess}
      />
    </>
  );
}
