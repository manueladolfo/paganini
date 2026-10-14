import webpush from "web-push";
import { prisma } from "./prisma";

// Configuración de VAPID Keys
const publicKey =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
  "BNhsFxI_hV3xvZqmgmOVG1QriC2R7l4302WLM6PFhPG4ToGQPfFghU9Kz_nwy_jM8jYjkrYI2qaJ316OHL1uwSs";
const privateKey =
  process.env.VAPID_PRIVATE_KEY ||
  "8Bp07f5VQ7M0167F4fK8VJfSs_hgZtHosO7rtPOyGQw";
const subject = process.env.VAPID_SUBJECT || "mailto:soporte@paganini.app";

if (publicKey && privateKey) {
  try {
    webpush.setVapidDetails(subject, publicKey, privateKey);
  } catch (err) {
    console.error("Error al configurar VAPID details en web-push:", err);
  }
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}

/**
 * Enviar notificación push a todos los dispositivos registrados de un usuario específico.
 */
export async function sendPushToUser(userId: string, payload: PushPayload) {
  if (!publicKey || !privateKey) {
    console.warn("VAPID keys no configuradas. Omitiendo envío de Web Push.");
    return;
  }

  try {
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId },
    });

    if (subscriptions.length === 0) return;

    const stringifiedPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      url: payload.url || "/",
      tag: payload.tag || "paganini-alert",
    });

    const sendPromises = subscriptions.map(async (sub) => {
      const pushConfig = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      };

      try {
        await webpush.sendNotification(pushConfig, stringifiedPayload);
      } catch (err: any) {
        // Si el endpoint ya no es válido (410 Gone o 404 Not Found), limpiar de la base de datos
        if (err.statusCode === 410 || err.statusCode === 404) {
          await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
        } else {
          console.error("Error al enviar notificación push a endpoint:", sub.endpoint, err.message);
        }
      }
    });

    await Promise.allSettled(sendPromises);
  } catch (error) {
    console.error("Error general en sendPushToUser:", error);
  }
}

/**
 * Enviar notificación push a todos los administradores (Papá y Mamá).
 */
export async function sendPushToAdmins(payload: PushPayload) {
  try {
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN", isActive: true },
      select: { id: true },
    });

    const promises = admins.map((admin) => sendPushToUser(admin.id, payload));
    await Promise.allSettled(promises);
  } catch (error) {
    console.error("Error general en sendPushToAdmins:", error);
  }
}
