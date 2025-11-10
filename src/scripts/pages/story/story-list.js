// src/public/scripts/pages/story/story-list.js
import Api from '../../data/api.js';
import CONFIG from '../../config.js';

const StoryList = {
  async render() {
    return `
      <main id="main" tabindex="-1">
        <h2>Daftar Cerita</h2>
        <div id="storiesContainer" class="stories" aria-live="polite"></div>
        
        <!-- Modal for story detail -->
        <div id="storyDetailModal" class="modal" aria-hidden="true">
          <div class="modal-content" role="dialog" aria-labelledby="modalTitle">
            <button class="modal-close" aria-label="Tutup detail cerita">&times;</button>
            <div id="modalContent">
              <p>Memuat...</p>
            </div>
          </div>
        </div>
      </main>
    `;
  },

  async afterRender() {
    document.getElementById('main').focus();
    const container = document.getElementById('storiesContainer');
    const token = localStorage.getItem(CONFIG.TOKEN_KEY) || null;

    if (!token) {
      container.innerHTML = '<p>Anda harus login untuk melihat cerita.</p>';
      return;
    }

    container.innerHTML = '<p>Memuat cerita...</p>';
    try {
      const res = await Api.getStories({ token, location: 1 });
      if (res.error) {
        container.innerHTML = `<p>Gagal memuat cerita: ${res.message}</p>`;
        return;
      }
      const stories = res.listStory || [];
      if (stories.length === 0) {
        container.innerHTML = `<p>Tidak ada cerita.</p>`;
        return;
      }

      // render cards
  const defaultImg = './images/placeholder.svg';
      container.innerHTML = stories.map((s) => {
        const img = s.photoUrl || defaultImg;
        const lat = s.lat != null ? s.lat.toFixed(4) : '-';
        const lon = s.lon != null ? s.lon.toFixed(4) : '-';

        return `
        <article class="story-card" data-id="${s.id}">
          <button class="story-link" aria-label="Lihat detail cerita: ${s.name}">
            <img src="${img}" alt="Foto cerita: ${s.name}" />
            <div class="story-body">
              <h3>${s.name}</h3>
              <p>${s.description || 'Tidak ada deskripsi'}</p>
              <small>Lokasi: ${lat}, ${lon}</small>
            </div>
          </button>
        </article>
      `;
      }).join('');

      // Modal elements
      const modal = document.getElementById('storyDetailModal');
      const modalContent = document.getElementById('modalContent');
      const modalClose = modal.querySelector('.modal-close');

      // Close modal handler
      modalClose.addEventListener('click', () => {
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      });

      // Close modal on outside click
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.setAttribute('aria-hidden', 'true');
          document.body.style.overflow = '';
        }
      });

      // Close modal on Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') {
          modal.setAttribute('aria-hidden', 'true');
          document.body.style.overflow = '';
        }
      });

      // View detail handler
      container.addEventListener('click', async (e) => {
        const storyLink = e.target.closest('.story-link');
        if (storyLink) {
          const storyCard = storyLink.closest('.story-card');
          const storyId = storyCard.dataset.id;
          
          modal.setAttribute('aria-hidden', 'false');
          document.body.style.overflow = 'hidden';
          modalContent.innerHTML = '<p>Memuat detail cerita...</p>';

          try {
            const res = await Api.getStoryDetail({ token, id: storyId });
            if (res.error) {
              modalContent.innerHTML = `<p>Gagal memuat detail: ${res.message}</p>`;
              return;
            }

            const story = res.story;
            const lat = story.lat != null ? story.lat.toFixed(6) : '-';
            const lon = story.lon != null ? story.lon.toFixed(6) : '-';
            const hasLocation = story.lat != null && story.lon != null;

            // Parse title and description
            const titleMatch = story.description.match(/^(.+?)(?:\n\n|\n|$)/);
            const title = titleMatch ? titleMatch[1].trim() : 'Tanpa Judul';
            const description = titleMatch ? story.description.slice(titleMatch[0].length).trim() : story.description;

            modalContent.innerHTML = `
              <article class="story-detail-card">
                <img src="${story.photoUrl}" alt="Foto cerita: ${title}" class="story-photo" />
                <div class="story-content">
                  <div class="story-header">
                    <h2 id="modalTitle">${title}</h2>
                  </div>
                  <p class="story-description">${description}</p>
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

            // Initialize map if location exists
            if (hasLocation) {
              try {
                const L = (await import('leaflet')).default;
                const map = L.map('detailMap').setView([story.lat, story.lon], 13);
                const mapboxKey = CONFIG.MAPBOX_API_KEY;
                
                if (mapboxKey && mapboxKey !== '<your_mapbox_api_key_here>') {
                  L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=${mapboxKey}', {
                    id: 'mapbox/streets-v11',
                    tileSize: 512,
                    zoomOffset: -1,
                  }).addTo(map);
                } else {
                  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 19,
                  }).addTo(map);
                }

                L.marker([story.lat, story.lon])
                  .addTo(map)
                  .bindPopup(story.name)
                  .openPopup();
              } catch (err) {
                console.warn('Map tidak dapat dimuat:', err);
              }
            }

          } catch (err) {
            modalContent.innerHTML = `<p>Terjadi kesalahan saat memuat detail cerita.</p>`;
            console.error(err);
          }
        }
      });

    } catch (err) {
      container.innerHTML = `<p>Kesalahan memuat cerita.</p>`;
    }
  },
};

export default StoryList;
