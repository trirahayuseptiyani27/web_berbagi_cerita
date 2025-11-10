// src/public/scripts/data/api.js
const BASE_URL = 'https://story-api.dicoding.dev/v1';

const Api = {
  async register({ name, email, password }) {
    const res = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    return res.json();
  },

  async login({ email, password }) {
    const res = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },

  async getStories({ token, page = 1, size = 20, location = 0 } = {}) {
    const params = new URLSearchParams();
    params.set('page', page);
    params.set('size', size);
    if (location) params.set('location', 1);
    const res = await fetch(`${BASE_URL}/stories?${params.toString()}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return res.json();
  },

  async getStoryDetail({ token, id }) {
    const res = await fetch(`${BASE_URL}/stories/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return res.json();
  },

    async addStory({ token, description, photoFile, lat, lon }) {
      try {
        const formData = new FormData();
        formData.append('description', description);
        if (lat && lon) {
          formData.append('lat', lat);
          formData.append('lon', lon);
        }
        if (photoFile) {
          formData.append('photo', photoFile); // ✅ harus pakai 'photo'
        }

        const response = await fetch(`${BASE_URL}/stories`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            // ❌ jangan tambahkan Content-Type manual
          },
          body: formData,
        });

        const result = await response.json();

        if (!response.ok) {
          console.error('❌ Gagal upload:', result.message);
        }

        return result;
      } catch (err) {
        console.error('🔥 Error addStory:', err);
        return { error: true, message: err.message };
      }
    },
    };

export default Api;
