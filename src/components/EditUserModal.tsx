"use client";

import React, { useState, useEffect, useRef } from "react";
import { UserDTO } from "@/lib/types";
import { X, UserCheck, Shield, Trash2, Sparkles, Plus, Upload, Camera, CheckCircle2, PauseCircle } from "lucide-react";
import { updateUser, createUser, deleteUser } from "@/app/actions";
import { sounds } from "@/lib/sounds";

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userToEdit: UserDTO | null; // null si estamos creando un nuevo usuario
  onSaved?: () => void;
}

const PRESET_AVATARS = [
  "https://api.dicebear.com/7.x/adventurer/svg?seed=PapaHero",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=MamaGenial",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=SofiaStar",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=LucasGamer",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=MateoFast",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=ElenaHero",
  "https://api.dicebear.com/7.x/bottts/svg?seed=AdminBoss",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Sparky",
];

export function EditUserModal({
  isOpen,
  onClose,
  userToEdit,
  onSaved,
}: EditUserModalProps) {
  const isEditing = Boolean(userToEdit);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [role, setRole] = useState<"ADMIN" | "MEMBER">("MEMBER");
  const [pin, setPin] = useState("1234");
  const [balance, setBalance] = useState(0);
  const [avatarUrl, setAvatarUrl] = useState(PRESET_AVATARS[0]);
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userToEdit) {
      setName(userToEdit.name);
      setRole((userToEdit.role as "ADMIN" | "MEMBER") || "MEMBER");
      setPin(userToEdit.pin || (userToEdit.role === "ADMIN" ? "1234" : "0000"));
      setBalance(userToEdit.balance);
      setIsActive(userToEdit.isActive ?? true);
      setAvatarUrl(
        userToEdit.avatarUrl ||
          `https://api.dicebear.com/7.x/adventurer/svg?seed=${userToEdit.name}`
      );
    } else {
      setName("");
      setRole("MEMBER");
      setPin("1234");
      setBalance(100);
      setIsActive(true);
      setAvatarUrl(PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)]);
    }
  }, [userToEdit, isOpen]);

  if (!isOpen) return null;

  // Manejador para subir foto desde el dispositivo del usuario
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Por favor selecciona un archivo de imagen válido (JPG, PNG, WebP).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setAvatarUrl(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || loading) return;

    sounds.playMechanicalClick();
    setLoading(true);
    try {
      if (isEditing && userToEdit) {
        await updateUser(userToEdit.id, {
          name,
          role,
          pin: role === "ADMIN" ? pin : null,
          balance,
          avatarUrl,
          isActive,
        });
      } else {
        await createUser({
          name,
          role,
          pin: role === "ADMIN" ? pin : null,
          balance,
          avatarUrl,
          isActive,
        });
      }
      onSaved?.();
      onClose();
    } catch (err: any) {
      alert(err.message || "Error al guardar miembro");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!userToEdit) return;
    if (
      !confirm(
        `¿Seguro que deseas eliminar a "${userToEdit.name}" de la tribu? Esta acción no se puede deshacer.`
      )
    )
      return;

    setLoading(true);
    try {
      await deleteUser(userToEdit.id);
      onSaved?.();
      onClose();
    } catch (err: any) {
      alert(err.message || "Error al eliminar miembro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full bg-slate-100 dark:bg-slate-800/60"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
            {isEditing ? (
              <UserCheck className="w-6 h-6" />
            ) : (
              <Plus className="w-6 h-6" />
            )}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {isEditing ? `Editar a ${userToEdit?.name}` : "Nuevo Miembro de la Familia"}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Personaliza el nombre, foto de perfil, rol y saldo
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Foto de Perfil / Avatar con Opción de Subir Archivo */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/80">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-2">
              Foto de Perfil
            </label>

            <div className="flex items-center gap-3.5 mb-3">
              <div className="relative group">
                <img
                  src={avatarUrl}
                  alt="Avatar preview"
                  className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 border-2 border-brand-500 object-cover shadow-md"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/40 text-white rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  title="Cambiar foto"
                >
                  <Camera className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1">
                {/* Botón para subir foto real desde móvil o PC */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-brand-500/10 hover:bg-brand-500/20 text-brand-600 dark:text-brand-400 border border-brand-500/30 text-xs font-bold transition-all cursor-pointer mb-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Subir foto desde tu dispositivo</span>
                </button>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                  Soporta fotos de tu galería o cámara (PNG, JPG, WebP)
                </p>
              </div>
            </div>

            {/* Galería de avatares predefinidos */}
            <span className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              O elige un avatar ilustrado:
            </span>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {PRESET_AVATARS.map((url, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setAvatarUrl(url)}
                  className={`w-9 h-9 rounded-xl overflow-hidden border-2 transition-all p-0.5 bg-white dark:bg-slate-800 ${
                    avatarUrl === url
                      ? "border-brand-500 scale-105 shadow-md"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={url} alt="Preset" className="w-full h-full object-cover rounded-lg" />
                </button>
              ))}
            </div>
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Nombre o Apodo *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Papá, Mamá, Sofía, Lucas..."
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-medium focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* Rol y PIN */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Rol
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as "ADMIN" | "MEMBER")}
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-medium focus:outline-none focus:border-brand-500"
              >
                <option value="MEMBER">👤 Participante (Hijo/a)</option>
                <option value="ADMIN">🛡️ Administrador (Papá/Mamá)</option>
              </select>
            </div>

            {role === "ADMIN" ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-rose-500" />
                  <span>PIN (4 dígitos)</span>
                </label>
                <input
                  type="text"
                  maxLength={4}
                  required
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="1234"
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-mono font-bold tracking-widest text-center focus:outline-none focus:border-rose-500"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Saldo de Puntos
                </label>
                <input
                  type="number"
                  value={balance}
                  onChange={(e) => setBalance(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-black text-amber-500 focus:outline-none focus:border-brand-500"
                />
              </div>
            )}

            {/* Estado del Perfil: Activo o Desactivado */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 transition-colors">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-white">
                    {isActive ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <PauseCircle className="w-4 h-4 text-amber-500 shrink-0" />
                    )}
                    <span>
                      Estado: {isActive ? "Activo" : "Desactivado (En Pausa)"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                    {isActive
                      ? "Participa activamente en tareas, puntos y ranking."
                      : "Pausado temporalmente. Mantiene su historial y puntos acumulados."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    sounds.playMechanicalClick();
                    setIsActive((prev) => !prev);
                  }}
                  className={`relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isActive ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                  }`}
                  role="switch"
                  aria-checked={isActive}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      isActive ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="pt-3 space-y-2">
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
                  ? "Guardar Cambios"
                  : "Crear Miembro"}
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
                <span>Eliminar a este miembro</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
