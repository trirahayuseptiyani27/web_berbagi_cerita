import StoryIDB from '../data/story-idb.js';

const OfflineStories = {
  async render() {
    return `
      <section class="offline-section">
        <h2>📦 Cerita Offline</h2>
        <p>Berikut adalah cerita yang tersimpan saat kamu offline. Cerita ini akan dikirim otomatis saat kamu online.</p>

        <input type="text" id="searchInput" placeholder="Cari berdasarkan judul..." />

        <select id="sortSelect">
          <option value="newest">Terbaru</option>
          <option value="oldest">Terlama</option>
        </select>

        <div id="offlineList"></div>
      </section>
    `;
  },

  async afterRender() {
    const listContainer = document.getElementById('offlineList');
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortSelect');

    let stories = await StoryIDB.getAllStories();

    // Fungsi render daftar cerita
    const renderStories = (filteredStories) => {
      if (!filteredStories.length) {
        listContainer.innerHTML = `<p>Tidak ada cerita offline.</p>`;
        return;
      }

    listContainer.innerHTML = filteredStories.map(story => `
    <div class="offline-story">
        <h3>${story.title}</h3>
        <p>${story.description}</p>
        <small>${story.date ? new Date(story.date).toLocaleString() : 'Tanggal tidak tersedia'}</small>
        <button class="delete-btn" data-id="${story.id}">Hapus</button>
    </div>
    `).join('');

    };

    // Fungsi filter & sort
    const filterAndSort = () => {
      const query = searchInput.value.toLowerCase();
      let filtered = stories.filter(s => s.title.toLowerCase().includes(query));

      // Sorting
      if (sortSelect.value === 'newest') {
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
      } else {
        filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
      }

      renderStories(filtered);
    };

    // Event listener
    searchInput.addEventListener('input', filterAndSort);
    sortSelect.addEventListener('change', filterAndSort);

    listContainer.addEventListener('click', async (e) => {
    if (e.target.classList.contains('delete-btn')) {
        const id = Number(e.target.dataset.id);
        if (!id || isNaN(id)) {
        alert('Gagal menghapus, ID cerita tidak valid.');
        return;
        }

        await StoryIDB.deleteStory(id);
        stories = await StoryIDB.getAllStories();
        filterAndSort();
        alert('Cerita offline berhasil dihapus!');
    }
    });

    filterAndSort();
  },
};

export default OfflineStories;
