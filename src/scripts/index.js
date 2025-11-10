// CSS imports
import '../styles/styles.css';
import App from './pages/app';
import { registerServiceWorker } from './utils';
import { syncOfflineStories } from './utils/sync.js'; // ⬅️ Tambahkan ini

document.addEventListener('DOMContentLoaded', async () => {
  const app = new App({
    content: document.querySelector('#app'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });

  await registerServiceWorker();
  await app.renderPage();

  // Jalankan sinkronisasi saat pertama kali online
  window.addEventListener('online', async () => {
    console.log('🌐 Koneksi kembali online. Mulai sinkronisasi cerita...');
    await syncOfflineStories();
  });

  window.addEventListener('hashchange', async () => {
    await app.renderPage();
  });
});
