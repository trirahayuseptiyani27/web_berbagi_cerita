export function isServiceWorkerAvailable() {
  return 'serviceWorker' in navigator;
}

export async function registerServiceWorker() {
  if (!isServiceWorkerAvailable()) {
    console.warn('⚠️ Service Worker API tidak didukung oleh browser ini.');
    return;
  }

  try {
    const swUrl = '/sw.bundle.js';

    const registration = await navigator.serviceWorker.register(swUrl);
    console.log('✅ Service Worker berhasil terdaftar:', registration);

    // Jika SW baru ditemukan (update tersedia)
    if (registration.waiting) {
      console.log('🔄 Service Worker baru menunggu untuk diaktifkan.');
    }

    registration.onupdatefound = () => {
      console.log('📦 Service Worker versi baru sedang diunduh...');
      const newWorker = registration.installing;

      if (newWorker) {
        newWorker.onstatechange = () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('✨ Versi baru Service Worker siap digunakan. Silakan refresh.');
          }
        };
      }
    };

  } catch (error) {
    console.error('❌ Gagal mendaftarkan Service Worker:', error);
  }
}
