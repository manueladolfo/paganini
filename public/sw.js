// Service Worker para Notificaciones Web Push de Paganini
// Compatible con iOS 16.4+ (iPhone/iPad), Android y navegadores de escritorio

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Recepción del evento PUSH
self.addEventListener("push", (event) => {
  let data = {
    title: "Paganini",
    body: "Tienes una nueva actualización familiar",
    url: "/",
    tag: "paganini-notification",
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (_) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    vibrate: [120, 60, 120, 60, 200],
    tag: data.tag || "paganini-alert",
    renotify: true,
    data: {
      url: data.url || "/",
      dateOfArrival: Date.now(),
    },
    actions: [
      {
        action: "open",
        title: "Abrir app",
      },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Clic en la notificación (pantalla de bloqueo o tira temporal)
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Si ya hay una ventana abierta de Paganini, enfocarla
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if ("focus" in client) {
            if (client.url.includes(self.location.origin)) {
              return client.focus();
            }
          }
        }
        // Si no hay ventana abierta, abrirla
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});
