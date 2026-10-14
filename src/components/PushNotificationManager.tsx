"use client";

import React, { useState, useEffect } from "react";
import { Bell, BellRing, Check, Send, Smartphone, AlertCircle, Loader2 } from "lucide-react";
import { savePushSubscription, removePushSubscription, testPushNotification } from "@/app/actions";
import { sounds } from "@/lib/sounds";

interface PushNotificationManagerProps {
  currentUserId: string;
  userName: string;
}

// Convertidor de base64url a Uint8Array requerido por PushManager
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushNotificationManager({
  currentUserId,
  userName,
}: PushNotificationManagerProps) {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(true);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [testing, setTesting] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const hasSW = "serviceWorker" in navigator;
    const hasPush = "PushManager" in window;
    const hasNotification = "Notification" in window;

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isAppleDevice);

    const isInStandaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(isInStandaloneMode);

    if (hasSW && hasPush && hasNotification) {
      setIsSupported(true);
      setPermission(Notification.permission);

      // Registrar Service Worker y verificar suscripción existente
      navigator.serviceWorker
        .register("/sw.js")
        .then(async (registration) => {
          const sub = await registration.pushManager.getSubscription();
          if (sub) {
            setIsSubscribed(true);
            // Sincronizar silenciosamente con el usuario actual por si cambió de perfil
            if (currentUserId) {
              const subJson = sub.toJSON();
              if (subJson.endpoint && subJson.keys?.p256dh && subJson.keys?.auth) {
                savePushSubscription(currentUserId, {
                  endpoint: subJson.endpoint,
                  keys: {
                    p256dh: subJson.keys.p256dh,
                    auth: subJson.keys.auth,
                  },
                }).catch(() => {});
              }
            }
          }
        })
        .catch((err) => {
          console.error("Error al registrar Service Worker:", err);
        });
    }
  }, [currentUserId]);

  const handleSubscribe = async () => {
    sounds.playMechanicalClick();
    if (!isSupported) {
      alert("Tu navegador no soporta notificaciones Web Push.");
      return;
    }

    if (isIOS && !isStandalone) {
      alert(
        "En iPhone y iPad, primero debes añadir Paganini a tu pantalla de inicio:\n\n1. Pulsa el botón Compartir (icono de caja con flecha hacia arriba).\n2. Selecciona 'Añadir a la pantalla de inicio'.\n3. Abre la app desde el icono instalado y podrás activar las notificaciones."
      );
      return;
    }

    setLoading(true);
    setStatusMessage(null);

    try {
      const vapidPublicKey =
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
        "BNhsFxI_hV3xvZqmgmOVG1QriC2R7l4302WLM6PFhPG4ToGQPfFghU9Kz_nwy_jM8jYjkrYI2qaJ316OHL1uwSs";
      if (!vapidPublicKey) {
        throw new Error("Clave pública VAPID no configurada");
      }

      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        const convertedKey = urlBase64ToUint8Array(vapidPublicKey);
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedKey,
        });
      }

      setPermission(Notification.permission);

      const subJson = subscription.toJSON();
      if (!subJson.endpoint || !subJson.keys?.p256dh || !subJson.keys?.auth) {
        throw new Error("No se pudo obtener las claves de suscripción del dispositivo");
      }

      await savePushSubscription(
        currentUserId,
        {
          endpoint: subJson.endpoint,
          keys: {
            p256dh: subJson.keys.p256dh,
            auth: subJson.keys.auth,
          },
        },
        navigator.userAgent
      );

      setIsSubscribed(true);
      sounds.playSuccessChime();
      setStatusMessage("¡Notificaciones activadas en este dispositivo!");
    } catch (err: any) {
      console.error("Error al suscribir a push:", err);
      if (Notification.permission === "denied") {
        alert(
          "Las notificaciones están bloqueadas en los ajustes de tu navegador. Ve a la configuración de permisos del sitio y activa las notificaciones."
        );
      } else {
        alert(err.message || "Error al activar las notificaciones push");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    sounds.playMechanicalClick();
    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();
      if (sub) {
        await removePushSubscription(sub.endpoint);
        await sub.unsubscribe();
      }
      setIsSubscribed(false);
      setStatusMessage("Notificaciones desactivadas en este dispositivo");
    } catch (err: any) {
      alert(err.message || "Error al desactivar notificaciones");
    } finally {
      setLoading(false);
    }
  };

  const handleTestNotification = async () => {
    sounds.playMechanicalClick();
    setTesting(true);
    try {
      await testPushNotification(currentUserId);
      sounds.playSuccessChime();
      setStatusMessage("¡Notificación de prueba enviada!");
    } catch (err: any) {
      alert(err.message || "Error al enviar prueba");
    } finally {
      setTesting(false);
    }
  };

  if (!isSupported) {
    return null;
  }

  // Aviso especial para iOS en navegador Safari estándar (fuera de PWA)
  if (isIOS && !isStandalone) {
    return (
      <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-2xl text-xs space-y-2">
        <div className="flex items-center gap-2 font-bold text-blue-900 dark:text-blue-300">
          <Smartphone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>Notificaciones en iPhone / iPad</span>
        </div>
        <p className="text-[11px] text-blue-700 dark:text-blue-300/80 leading-relaxed">
          Para recibir avisos en la pantalla de bloqueo de tu iPhone, pulsa el botón{" "}
          <strong>Compartir</strong> en Safari y elige{" "}
          <strong>«Añadir a la pantalla de inicio»</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="p-3.5 bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-black text-xs text-slate-900 dark:text-white">
          {isSubscribed ? (
            <BellRing className="w-4 h-4 text-emerald-500 animate-pulse" />
          ) : (
            <Bell className="w-4 h-4 text-slate-500" />
          )}
          <span>Avisos Push en este Dispositivo</span>
        </div>

        {isSubscribed && (
          <span className="flex items-center gap-1 text-[10px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
            <Check className="w-3 h-3" />
            Activo
          </span>
        )}
      </div>

      <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
        {isSubscribed
          ? `Recibirás avisos en la pantalla de bloqueo de este móvil cuando se validen tareas, se ajusten puntos o se reclamen premios.`
          : `Activa los avisos para que ${userName} reciba notificaciones en la pantalla de bloqueo cuando los padres validen tareas o se canjeen premios.`}
      </p>

      {statusMessage && (
        <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg animate-fadeIn">
          {statusMessage}
        </div>
      )}

      <div className="flex items-center gap-2 pt-1">
        {!isSubscribed ? (
          <button
            type="button"
            onClick={handleSubscribe}
            disabled={loading}
            className="flex-1 btn-gamified bg-brand-600 hover:bg-brand-500 border-b-brand-800 text-white font-bold text-xs py-2 px-3 rounded-xl shadow-gamified flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Bell className="w-3.5 h-3.5" />
            )}
            <span>Activar Avisos en este Móvil</span>
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={handleTestNotification}
              disabled={testing}
              className="flex-1 btn-gamified bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 border-b-slate-400 dark:border-b-slate-950 text-slate-700 dark:text-slate-200 font-bold text-xs py-2 px-3 rounded-xl shadow-gamified flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {testing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5 text-brand-500" />
              )}
              <span>Probar Notificación</span>
            </button>

            <button
              type="button"
              onClick={handleUnsubscribe}
              disabled={loading}
              className="text-[11px] font-bold text-slate-500 hover:text-rose-500 px-2.5 py-2 transition-colors cursor-pointer"
            >
              Desactivar
            </button>
          </>
        )}
      </div>
    </div>
  );
}
