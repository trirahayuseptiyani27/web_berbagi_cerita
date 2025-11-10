import Api from '../../data/api.js';
import CONFIG from '../../config.js';
import UrlParser from '../../routes/url-parser.js';

const StoryDetail = {
  async render() {
    return `
      <main id="main" tabindex="-1">
        <section class="story-detail">
          <div id="storyContainer" aria-live="polite">
            <p>Memuat cerita...</p>
          </div>
          <a href="#/stories" class="back-btn" aria-label="Kembali ke daftar cerita">
            &larr; Kembali
          </a>
        </section>
      </main>
    `;
  },

  async afterRender() {
    document.getElementById('main').focus();
    const container = document.getElementById('storyContainer');
    const token = localStorage.getItem(CONFIG.TOKEN_KEY);

    if (!token) {
      container.innerHTML = '<p>Anda harus login untuk melihat cerita.</p>';
      return;
    }

    try {
      const url = UrlParser.parseActiveUrlWithoutCombiner();
      const id = url.id;

      const res = await Api.getStoryDetail({ token, id });
      if (res.error) {
        container.innerHTML = `<p>Gagal memuat cerita: ${res.message}</p>`;
        return;
      }

      const story = res.story;
      if (!story) {
        container.innerHTML = '<p>Cerita tidak ditemukan.</p>';
        return;
      }

      const lat = story.lat != null ? story.lat.toFixed(6) : '-';
      const lon = story.lon != null ? story.lon.toFixed(6) : '-';
      const hasLocation = story.lat != null && story.lon != null;

      container.innerHTML = `
        <article class="story-detail-card">
          <img src="${story.photoUrl}" alt="Foto cerita: ${story.name}" class="story-photo" />
          <div class="story-content">
            <h2>${story.name}</h2>
            <p class="story-description">${story.description || 'Tidak ada deskripsi'}</p>
            <div class="story-meta">
              <small>Dibagikan pada: ${new Date(story.createdAt).toLocaleString('id-ID')}</small>
              <small>Lokasi: ${lat}, ${lon}</small>
            </div>
            ${hasLocation ? `
              <div id="detailMap" style="height:280px;border-radius:6px;margin-top:1rem"></div>
            ` : ''}
          </div>
        </article>
      `;

      // ====== Tambahkan perbaikan marker di sini ======
      if (hasLocation) {
        try {
          const L = (await import('leaflet')).default;
          const { initializeMap } = await import('../../utils/map-utils.js');
          await import('leaflet/dist/leaflet.css');

          // ===== FIX pasti tampil marker =====
          delete L.Icon.Default.prototype._getIconUrl;
          L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
          });

          // Inisialisasi peta
          const { map } = initializeMap('detailMap');
          map.setView([story.lat, story.lon], 13);

          // Tambahkan marker
          L.marker([story.lat, story.lon])
            .addTo(map)
            .bindPopup(`<b>${story.name}</b><br>${story.description || ''}`)
            .openPopup();
        } catch (err) {
          console.warn('Map tidak dapat dimuat:', err);
        }
      }

      // ====== Selesai perbaikan ======

    } catch (err) {
      container.innerHTML = `<p>Terjadi kesalahan saat memuat cerita.</p>`;
      console.error(err);
    }
  },
};

export default StoryDetail;
