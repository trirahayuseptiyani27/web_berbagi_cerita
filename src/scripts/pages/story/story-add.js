import Api from '../../data/api.js';
import CONFIG from '../../config.js';
import StoryIDB from '../../data/story-idb.js';

const StoryAdd = {
  async render() {
    return `
      <main id="main">
        <h2>Tulis Cerita Baru</h2>
        <form id="storyForm">
          <div>
            <label for="title">Judul Cerita</label>
            <input type="text" id="title" name="title" required />
          </div>
          
          <div>
            <label for="description">Isi Cerita</label>
            <textarea id="description" name="description" required></textarea>
          </div>

          <div>
            <label>Foto Cerita</label>
            <div class="photo-input-group">
              <input type="file" id="photo" name="photo" accept="image/*" style="display:none" />
              <button type="button" id="uploadBtn" class="photo-btn">Pilih File</button>
              <button type="button" id="cameraBtn" class="photo-btn">Buka Kamera</button>
            </div>
            <div id="cameraContainer" style="display:none;margin-top:12px;">
              <video id="cameraPreview" autoplay playsinline style="width:100%;max-width:400px;border-radius:8px;"></video>
              <button type="button" id="captureBtn" class="photo-btn" style="margin-top:8px;">Ambil Foto</button>
              <button type="button" id="retakeBtn" class="photo-btn" style="display:none;margin-top:8px;">Ambil Ulang</button>
            </div>
            <div id="photoPreview" aria-hidden="true" style="margin-top:12px"></div>
            <canvas id="canvas" style="display:none"></canvas>
          </div>

          <div>
            <label for="pickerMap">Pilih Lokasi (klik peta)</label>
            <div id="pickerMap" style="height:280px;border-radius:6px;margin-top:8px"></div>
            <p id="coords" style="font-size:0.95rem;color:#555;margin-top:6px">Belum memilih lokasi</p>
          </div>

          <button type="submit">Bagikan Cerita</button>
        </form>
        <p id="statusMessage"></p>
      </main>
    `;
  },

  async afterRender() {
    const form = document.getElementById('storyForm');
    const statusMessage = document.getElementById('statusMessage');
    const token = localStorage.getItem(CONFIG.TOKEN_KEY);
    const coordsEl = document.getElementById('coords');

    // Elemen kamera & upload
    const photoInput = document.getElementById('photo');
    const photoPreview = document.getElementById('photoPreview');
    const uploadBtn = document.getElementById('uploadBtn');
    const cameraBtn = document.getElementById('cameraBtn');
    const cameraContainer = document.getElementById('cameraContainer');
    const video = document.getElementById('cameraPreview');
    const canvas = document.getElementById('canvas');
    const captureBtn = document.getElementById('captureBtn');
    const retakeBtn = document.getElementById('retakeBtn');

    let pickedLat = null;
    let pickedLon = null;
    let photoBlob = null;
    let stream = null;

    // Stop kamera
    const stopCamera = () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
      }
    };

    // Upload file handler
    uploadBtn.addEventListener('click', () => photoInput.click());

    photoInput.addEventListener('change', () => {
      const file = photoInput.files[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      photoBlob = file;
      photoPreview.innerHTML = `<img src="${url}" alt="Preview foto" style="max-width:100%;border-radius:8px;display:block" />`;
      stopCamera();
      cameraContainer.style.display = 'none';
    });

    // Kamera handler
    cameraBtn.addEventListener('click', async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        video.srcObject = stream;
        cameraContainer.style.display = 'block';
        cameraBtn.style.display = 'none';
        uploadBtn.style.display = 'none';
        photoPreview.innerHTML = '';
      } catch (err) {
        alert('Tidak dapat mengakses kamera. Pastikan memberi izin kamera.');
      }
    });

    captureBtn.addEventListener('click', () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0);
      canvas.toBlob(blob => {
        photoBlob = blob;
        const url = URL.createObjectURL(blob);
        photoPreview.innerHTML = `<img src="${url}" alt="Hasil kamera" style="max-width:100%;border-radius:8px;display:block" />`;
        captureBtn.style.display = 'none';
        retakeBtn.style.display = 'inline-block';
        stopCamera();
      }, 'image/jpeg', 0.8);
    });

    retakeBtn.addEventListener('click', () => {
      photoBlob = null;
      photoPreview.innerHTML = '';
      captureBtn.style.display = 'inline-block';
      retakeBtn.style.display = 'none';
      cameraContainer.style.display = 'block';
    });

    // Map picker
    try {
      const L = (await import('leaflet')).default;
      const { initializeMap } = await import('../../utils/map-utils.js');
      const { map } = initializeMap('pickerMap');
      map.setView([-2, 117], 5);

      const pickerIcon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      let marker;
      map.on('click', (e) => {
        pickedLat = e.latlng.lat;
        pickedLon = e.latlng.lng;

        if (marker) marker.setLatLng([pickedLat, pickedLon]);
        else marker = L.marker([pickedLat, pickedLon], { icon: pickerIcon }).addTo(map);

        coordsEl.textContent = `Lokasi: ${pickedLat.toFixed(5)}, ${pickedLon.toFixed(5)}`;
      });
    } catch (err) {
      console.warn('Map picker gagal dimuat:', err);
    }

    // Fungsi sinkronisasi offline
    const syncOfflineStories = async () => {
      const offlineStories = await StoryIDB.getAllStories();
      if (!offlineStories.length) return;

      for (const story of offlineStories) {
        try {
          const blob = await fetch(story.photo).then(res => res.blob());
          const file = new File([blob], 'offline-photo.jpg', { type: 'image/jpeg' });

          await Api.addStory({
            token,
            description: `${story.title}\n\n${story.description}`,
            photoFile: file,
            lat: story.lat,
            lon: story.lon,
          });

          await StoryIDB.deleteStory(story.id);
          console.log(`✅ Cerita offline "${story.title}" tersinkronisasi`);
        } catch (err) {
          console.error('❌ Gagal sinkronisasi:', err);
        }
      }
    };

    window.addEventListener('online', syncOfflineStories);
    if (navigator.onLine) await syncOfflineStories();

    // Submit form
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const title = document.getElementById('title').value.trim();
      const description = document.getElementById('description').value.trim();

      if (!title || !description) {
        alert('Judul dan isi wajib diisi.');
        return;
      }

      if (!photoBlob) {
        alert('Silakan pilih atau ambil foto terlebih dahulu.');
        return;
      }

      const storyData = {
        title,
        description,
        date: new Date().toISOString(), // ✅ selalu valid
      };

      if (navigator.onLine) {
        try {
          const file = new File([photoBlob], 'upload.jpg', { type: 'image/jpeg' });
          await Api.addStory({ token, description: `${title}\n\n${description}`, photoFile: file, lat: pickedLat, lon: pickedLon });
          alert('✅ Cerita berhasil dikirim!');
          form.reset();
          photoPreview.innerHTML = '';
        } catch (err) {
          console.error('Gagal kirim:', err);
          alert('❌ Gagal mengirim cerita ke server.');
        }
      } else {
        await StoryIDB.putStory(storyData);
        alert('📦 Offline — cerita disimpan di penyimpanan lokal!');
      }
    });
  },
};

export default StoryAdd;
