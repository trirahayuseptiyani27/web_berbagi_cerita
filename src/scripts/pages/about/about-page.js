// src/public/scripts/pages/about/about-page.js
const AboutPage = {
  async render() {
    return `
      <main id="main" tabindex="-1">
        <section class="about-section">
          <h2>Tentang StoryMap</h2>
          
          <article class="about-content">
            <div class="about-card">
              <h3>🎯 Apa itu StoryMap?</h3>
              <p>StoryMap adalah platform berbagi cerita yang memungkinkan pengguna untuk membagikan pengalaman mereka dengan lokasi geografis yang spesifik. Setiap cerita yang dibagikan akan ditampilkan dalam bentuk marker di peta, memungkinkan pengguna untuk melihat di mana cerita tersebut berlangsung.</p>
            </div>

            <div class="about-card">
              <h3>🌟 Kegunaan Aplikasi</h3>
              <ul>
                <li>Berbagi cerita dengan lokasi spesifik</li>
                <li>Melihat cerita-cerita dari berbagai lokasi di peta</li>
                <li>Mengambil foto langsung dari kamera atau mengupload dari galeri</li>
                <li>Membaca cerita-cerita menarik dari pengguna lain</li>
                <li>Eksplorasi lokasi melalui peta interaktif</li>
              </ul>
            </div>

            <div class="about-card">
              <h3>🛠️ Teknologi yang Digunakan</h3>
              <ul>
                <li>Single Page Application (SPA) dengan JavaScript murni</li>
                <li>Webpack untuk bundling dan optimization</li>
                <li>Leaflet.js untuk integrasi peta</li>
                <li>Aksesibilitas yang memenuhi standar WCAG</li>
                <li>Responsive design untuk berbagai ukuran layar</li>
              </ul>
            </div>

            <div class="about-card">
              <h3>👨‍💻 Pengembang</h3>
              <div class="developer-info">
                <p><strong>Nama:</strong> Tri Rahayu Septiyani</p>
                <p><strong>Universitas:</strong> Universitas Mulawarman</p>
                <p><strong>Learning Path:</strong> Front-End Back-end with AI</p>
              </div>
            </div>
          </article>
        </section>
      </main>
    `;
  },
  async afterRender() {
    document.getElementById('main').focus();
  },
};

export default AboutPage;
