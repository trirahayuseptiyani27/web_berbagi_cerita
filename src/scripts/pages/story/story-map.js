// src/scripts/pages/story/story-map.js
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Api from '../../data/api.js';
import CONFIG from '../../config.js';
import StoryIDB from '../../data/story-idb.js';

const StoryMap = {
  async render() {
    return `
      <main id="main" tabindex="-1" class="view-enter">
        <section aria-labelledby="map-title">
          <h2 id="map-title">Peta Cerita</h2>
          <p>Menampilkan lokasi cerita yang telah dibagikan oleh pengguna lain, termasuk yang disimpan offline.</p>
          <div id="map" style="height:520px;border-radius:10px;overflow:hidden;"></div>
          <div id="mapControls" class="map-controls">
            <button id="zoomInBtn" class="map-control-btn" aria-label="Perbesar peta">+</button>
            <button id="zoomOutBtn" class="map-control-btn" aria-label="Perkecil peta">-</button>
            <button id="centerBtn" class="map-control-btn" aria-label="Kembali ke tengah peta">⌖</button>
          </div>
        </section>
      </main>
    `;
  },

  async afterRender() {
    const main = document.getElementById('main');
    main.focus();

    const token = localStorage.getItem(CONFIG.TOKEN_KEY);
    if (!token) {
      alert('Silakan login terlebih dahulu untuk melihat peta cerita.');
      window.location.hash = '#/login';
      return;
    }

    // --- Inisialisasi peta ---
    const map = L.map('map').setView([-2, 117], 5);

    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    const satellite = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 19, attribution: 'Source: Esri, Maxar, Earthstar Geographics' }
    );

    const terrain = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      maxZoom: 17,
      attribution: '© OpenTopoMap contributors',
    });

    L.control.layers({ OpenStreetMap: osm, Satellite: satellite, Terrain: terrain }).addTo(map);

    document.getElementById('zoomInBtn').addEventListener('click', () => map.zoomIn());
    document.getElementById('zoomOutBtn').addEventListener('click', () => map.zoomOut());
    document.getElementById('centerBtn').addEventListener('click', () => map.setView([-2, 117], 5));

    // --- Fungsi render marker ---
    const renderMarkers = (stories) => {
      map.eachLayer((layer) => {
        if (layer instanceof L.Marker) map.removeLayer(layer);
      });

      const markers = [];
      stories.forEach((story) => {
        if (!story.lat || !story.lon) return;

        // 🔹 Marker untuk offline stories = warna abu-abu
        const isOffline = story.isOffline === true;
        const iconUrl = isOffline
          ? 'https://maps.gstatic.com/mapfiles/ms2/micons/grey-dot.png'
          : 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png';

        const customIcon = L.icon({
          iconUrl,
          iconRetinaUrl: iconUrl,
          shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        });

        const marker = L.marker([story.lat, story.lon], { icon: customIcon }).addTo(map);
        marker.bindPopup(`
          <article style="max-width:220px">
            <img src="${story.photoUrl || '/images/placeholder.svg'}" 
                 alt="Foto oleh ${story.name || 'Offline User'}"
                 style="width:100%;height:auto;border-radius:6px;margin-bottom:4px"/>
            <h3 style="margin:0">${story.name || 'Offline User'}</h3>
            <p style="margin:0;font-size:14px">${story.description || 'Tidak ada deskripsi.'}</p>
          </article>
        `);

        marker.storyId = story.id;
        markers.push(marker);
      });

      if (markers.length > 0) {
        const group = L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.5));
      }
    };

    // --- Gabungkan data online & offline ---
    const loadStories = async () => {
      try {
        const res = await Api.getStories({ token, location: 1 });
        const onlineStories = res.listStory || [];

        const offlineStories = (await StoryIDB.getAllStories()) || [];
        const formattedOffline = offlineStories.map((s) => ({
          ...s,
          name: 'Offline User',
          isOffline: true,
          photoUrl: s.photo ? URL.createObjectURL(s.photo) : '/images/offline-placeholder.png',
        }));

        const combined = [...onlineStories];
        formattedOffline.forEach((off) => {
          if (!combined.some((on) => on.description === off.description)) {
            combined.push(off);
          }
        });

        renderMarkers(combined);
      } catch (err) {
        console.error('❌ Gagal memuat peta:', err);
        alert('Terjadi kesalahan saat memuat data cerita.');
      }
    };

    await loadStories();

    // --- Refresh otomatis saat online kembali ---
    window.addEventListener('online', async () => {
      console.log('🌐 Online kembali — sinkronisasi dan refresh peta...');
      await loadStories();
    });

    // --- Animasi transisi halaman ---
    setTimeout(() => {
      main.classList.add('view-enter-active');
    }, 10);
  },
};

export default StoryMap;
