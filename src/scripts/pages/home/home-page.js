// src/scripts/pages/home/home-page.js
const HomePage = {
  async render() {
    return `
      <section class="home">
        <div class="hero-section">
          <div class="hero-content">
            <h1 class="hero-title">
              <span class="welcome-emoji">📖</span>
              Selamat Datang di <span class="brand-text">Berbagi Cerita</span>
            </h1>
            <p class="hero-subtitle">
              Bagikan cerita unikmu, tandai lokasinya di peta, dan biarkan dunia mengenal kisahmu.
            </p>
            <div class="hero-features">
              <div class="feature-card">
                <span class="feature-icon">📸</span>
                <h3>Berbagi Foto</h3>
                <p>Abadikan momen spesialmu dengan foto yang memukau</p>
              </div>
              <div class="feature-card">
                <span class="feature-icon">📍</span>
                <h3>Tandai Lokasi</h3>
                <p>Tandai lokasi ceritamu di peta interaktif</p>
              </div>
              <div class="feature-card">
                <span class="feature-icon">✨</span>
                <h3>Cerita Unik</h3>
                <p>Bagikan pengalaman unikmu dengan dunia</p>
              </div>
            </div>
            <div class="hero-cta">
              <a href="#/auth?mode=register" class="cta-button primary">Mulai Berbagi Cerita</a>
              <a href="#/auth?mode=login" class="cta-button secondary">Sudah Punya Akun? Masuk</a>
            </div>
          </div>
          <div class="hero-illustration">
            <div class="floating-cards">
              <div class="story-preview-card">
                <div class="preview-image"></div>
                <div class="preview-content">
                  <h4>Petualangan di Gunung</h4>
                  <p>Menikmati keindahan alam dari ketinggian...</p>
                </div>
              </div>
              <div class="story-preview-card">
                <div class="preview-image"></div>
                <div class="preview-content">
                  <h4>Kuliner Khas Daerah</h4>
                  <p>Mencicipi kelezatan masakan lokal...</p>
                </div>
              </div>
            </div>
            <div class="map-preview">
              <div class="map-marker"></div>
              <div class="map-marker"></div>
              <div class="map-marker"></div>
            </div>
          </div>
        </div>
      </section>
    `;
  },

  async afterRender() {
    // Add staggered animations to elements
    const heroContent = document.querySelector('.hero-content');
    const features = document.querySelectorAll('.feature-card');
    const ctaButtons = document.querySelectorAll('.cta-button');
    const cards = document.querySelectorAll('.story-preview-card');
    const markers = document.querySelectorAll('.map-marker');

    if (heroContent) {
      heroContent.classList.add('fade-slide-in');
    }

    features.forEach((feature, index) => {
      setTimeout(() => {
        feature.classList.add('fade-slide-in');
      }, 200 * (index + 1));
    });

    ctaButtons.forEach((button, index) => {
      setTimeout(() => {
        button.classList.add('fade-slide-in');
      }, 800 + (200 * index));
    });

    cards.forEach((card, index) => {
      setTimeout(() => {
        card.classList.add('fade-slide-in');
      }, 400 * (index + 1));
    });

    markers.forEach((marker, index) => {
      setTimeout(() => {
        marker.classList.add('fade-slide-in');
      }, 1000 + (200 * index));
    });
  },
};

export default HomePage;

