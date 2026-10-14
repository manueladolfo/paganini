"use client";

import React, { useState } from "react";
import {
  X,
  Database,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileJson,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { exportBackupData, restoreBackupData } from "@/app/actions";
import { sounds } from "@/lib/sounds";

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestored?: () => void;
}

export function BackupModal({ isOpen, onClose, onRestored }: BackupModalProps) {
  const [downloading, setDownloading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [restoreUsers, setRestoreUsers] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  if (!isOpen) return null;

  // 1. Descargar copia de seguridad en formato JSON
  const handleExport = async () => {
    sounds.playMechanicalClick();
    setDownloading(true);
    setStatusMessage(null);

    try {
      const data = await exportBackupData();
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      const dateStr = new Date().toISOString().split("T")[0];
      link.href = url;
      link.download = `paganini-backup-${dateStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      sounds.playSuccessChime();
      setStatusMessage({
        type: "success",
        text: `¡Copia descargada con éxito! (${data.counts.tasks} tareas y ${data.counts.rewards} premios respaldados).`,
      });
    } catch (err: any) {
      alert(err.message || "Error al exportar la copia de seguridad");
    } finally {
      setDownloading(false);
    }
  };

  // 2. Manejar selección del archivo a restaurar
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith(".json")) {
        alert("Por favor selecciona un archivo de copia válido (.json)");
        return;
      }
      setRestoreFile(file);
      setStatusMessage(null);
    }
  };

  // 3. Ejecutar restauración desde archivo JSON
  const handleRestore = async () => {
    if (!restoreFile || restoring) return;

    if (
      !confirm(
        "¿Deseas restaurar esta copia de seguridad? Se sincronizarán las tareas y premios en tu base de datos."
      )
    ) {
      return;
    }

    sounds.playMechanicalClick();
    setRestoring(true);
    setStatusMessage(null);

    try {
      const text = await restoreFile.text();
      const payload = JSON.parse(text);

      if (!payload.tasks && !payload.rewards) {
        throw new Error(
          "El archivo seleccionado no parece ser una copia de seguridad válida de Paganini o Tribo."
        );
      }

      await restoreBackupData(payload, { restoreUsers });

      sounds.playSuccessChime();
      setStatusMessage({
        type: "success",
        text: "¡Copia de seguridad restaurada correctamente!",
      });

      onRestored?.();
      setTimeout(() => {
        onClose();
      }, 1400);
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: err.message || "Error al restaurar el archivo de copia.",
      });
    } finally {
      setRestoring(false);
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
          <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
              Copia de Seguridad
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Respalda y restaura tus tareas y catálogo de premios
            </p>
          </div>
        </div>

        {statusMessage && (
          <div
            className={`p-3.5 rounded-2xl mb-4 text-xs font-semibold flex items-center gap-2 ${
              statusMessage.type === "success"
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                : "bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <div className="space-y-4">
          {/* Panel 1: Exportar / Descargar */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
            <div className="flex items-center gap-2 mb-1.5">
              <Download className="w-4 h-4 text-indigo-500" />
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                Exportar Copia de Seguridad
              </h4>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
              Genera y descarga en tu dispositivo un archivo <strong>.json</strong> que incluye todas tus tareas configuradas, catálogo de premios y datos familiares.
            </p>

            <button
              onClick={handleExport}
              disabled={downloading}
              className="w-full btn-gamified bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-xs py-2.5 px-3 rounded-xl shadow-gamified flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>
                {downloading ? "Generando copia..." : "Descargar Archivo JSON"}
              </span>
            </button>
          </div>

          {/* Panel 2: Restaurar / Importar */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
            <div className="flex items-center gap-2 mb-1.5">
              <Upload className="w-4 h-4 text-amber-500" />
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                Restaurar desde Copia
              </h4>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
              Carga un archivo <strong>.json</strong> previamente descargado para recuperar tus tareas y premios en caso de cambio de servidor o reinstalación.
            </p>

            <label className="block mb-3">
              <input
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
                id="restore-file-input"
              />
              <span
                onClick={() => document.getElementById("restore-file-input")?.click()}
                className="w-full border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-amber-500 dark:hover:border-amber-400 rounded-xl p-3 flex items-center justify-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer bg-white dark:bg-slate-900/60 transition-colors"
              >
                <FileJson className="w-4 h-4 text-amber-500" />
                <span className="truncate max-w-[240px]">
                  {restoreFile ? restoreFile.name : "Seleccionar archivo .json..."}
                </span>
              </span>
            </label>

            <div className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                id="restore-users-checkbox"
                checked={restoreUsers}
                onChange={(e) => setRestoreUsers(e.target.checked)}
                className="rounded border-slate-300 text-amber-500 focus:ring-amber-500 cursor-pointer"
              />
              <label
                htmlFor="restore-users-checkbox"
                className="text-[11px] text-slate-600 dark:text-slate-400 cursor-pointer"
              >
                Sincronizar también nombres y perfiles de usuarios
              </label>
            </div>

            <button
              onClick={handleRestore}
              disabled={!restoreFile || restoring}
              className="w-full btn-gamified bg-amber-500 hover:bg-amber-400 active:bg-amber-600 border-b-amber-700 text-amber-950 font-black text-xs py-2.5 px-3 rounded-xl shadow-gamified flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{restoring ? "Restaurando..." : "Restaurar Copia"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
