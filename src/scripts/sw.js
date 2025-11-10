// ✅ Import Workbox modules
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst, NetworkFirst } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';

// ✅ Precaching untuk App Shell (otomatis diisi oleh Workbox saat build)
precacheAndRoute(self.__WB_MANIFEST || []);

// ======================================================
// 🧱 1️⃣ CACHE HALAMAN (HTML)
// ======================================================
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'pages-cache',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 7 * 24 * 60 * 60, // simpan 7 hari
      }),
    ],
  })
);

// ======================================================
// 🎨 2️⃣ CACHE ASSET STATIS (CSS, JS, FONT, WORKER)
// ======================================================
registerRoute(
  ({ request }) => ['style', 'script', 'worker', 'font'].includes(request.destination),
  new StaleWhileRevalidate({
    cacheName: 'static-assets',
  })
);

// ======================================================
// 🖼️ 3️⃣ CACHE GAMBAR
// ======================================================
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'image-cache',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 hari
      }),
    ],
  })
);

// ======================================================
// 🌐 4️⃣ CACHE DATA API (untuk mode offline sebagian)
// ======================================================
registerRoute(
  // Cache semua permintaan ke API Story Dicoding
  ({ url }) => url.origin === 'https://story-api.dicoding.dev',
  new NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 5, // fallback ke cache jika API lambat
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 10 * 60, // cache 10 menit
      }),
    ],
  })
);

// ======================================================
// 🔔 5️⃣ PUSH NOTIFICATION
// ======================================================
self.addEventListener('push', (event) => {
  console.log('📩 Push event diterima:', event);

  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Notifikasi Baru dari StoryMap!';
  const options = {
    body: data.body || 'Ada pembaruan cerita menarik untuk Anda!',
    icon: '/images/logo.png',
    badge: '/images/logo.png',
    data: {
      url: data.url || '/#/', // arahkan ke beranda jika tidak ada URL
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// ======================================================
// 🖱️ 6️⃣ NOTIFICATION CLICK → buka halaman terkait
// ======================================================
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/#/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Jika tab dengan URL target sudah terbuka → fokus ke tab itu
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }

      // Jika belum terbuka → buka tab baru
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// ======================================================
// 🚀 7️⃣ ACTIVATION (membersihkan cache lama)
// ======================================================
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [
    'pages-cache',
    'static-assets',
    'image-cache',
    'api-cache',
  ];
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log('🧹 Menghapus cache lama:', cacheName);
            return caches.delete(cacheName);
          }
        })
      )
    )
  );
  console.log('✅ Service Worker aktif dan siap!');
});
