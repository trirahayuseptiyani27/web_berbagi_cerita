// src/scripts/utils/sync.js
import StoryIDB from '../data/story-idb.js';
import Api from '../data/api.js';
import CONFIG from '../config.js';

export async function syncOfflineStories() {
  if (!navigator.onLine) return;

  const token = localStorage.getItem(CONFIG.TOKEN_KEY);
  if (!token) return;

  const offlineStories = await StoryIDB.getAllStories();
  if (!offlineStories.length) return;

  console.log(`📦 Sinkronisasi ${offlineStories.length} cerita offline...`);

  for (const story of offlineStories) {
    try {
      let photoBlob = null;

      // 🔄 Jika ada foto base64, ubah ke Blob
      if (story.photoBase64) {
        const res = await fetch(story.photoBase64);
        photoBlob = await res.blob();
      }

      // 🚀 Kirim ke API
      const res = await Api.addStory({
        token,
        description: story.description || story.title,
        photoFile: photoBlob,
        lat: story.lat,
        lon: story.lon,
      });

      if (!res.error) {
        console.log(`✅ Cerita "${story.title}" berhasil diunggah!`);
        await StoryIDB.deleteStory(story.id);
      } else {
        console.error(`❌ Gagal upload "${story.title}": ${res.message}`);
      }
    } catch (err) {
      console.error('💥 Error sinkronisasi:', err);
    }
  }

  // 🧹 Setelah sinkronisasi selesai, refresh halaman daftar cerita
  if (window.location.hash === '#/offline') {
    window.location.hash = '#/map'; // atau '#/' sesuai halaman daftar utama
  } else {
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  }

  console.log('🎉 Sinkronisasi offline → online selesai!');
}

window.addEventListener('online', syncOfflineStories);
