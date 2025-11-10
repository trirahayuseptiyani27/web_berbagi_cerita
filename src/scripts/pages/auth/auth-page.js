// src/scripts/pages/auth/auth-page.js
import Api from '../../data/api.js';
import CONFIG from '../../config.js';


const AuthPage = {
  async render() {
    return `
      <main id="main" tabindex="-1">
        <div class="auth-container">
          <div class="auth-box">
            <div class="auth-tabs">
              <button class="auth-tab active" data-tab="login">Masuk</button>
              <button class="auth-tab" data-tab="register">Daftar</button>
            </div>
            
            <!-- Login Form -->
            <form id="loginForm" class="auth-form active">
              <div class="form-group">
                <label for="loginEmail">Email</label>
                <input 
                  type="email" 
                  id="loginEmail" 
                  name="email" 
                  required 
                  autocomplete="email"
                />
              </div>
              <div class="form-group">
                <label for="loginPassword">Password</label>
                <input 
                  type="password" 
                  id="loginPassword" 
                  name="password" 
                  required 
                  autocomplete="current-password"
                />
              </div>
              <button type="submit" class="auth-submit">Masuk</button>
            </form>

            <!-- Register Form -->
            <form id="registerForm" class="auth-form">
              <div class="form-group">
                <label for="registerName">Nama</label>
                <input 
                  type="text" 
                  id="registerName" 
                  name="name" 
                  required 
                  autocomplete="name"
                />
              </div>
              <div class="form-group">
                <label for="registerEmail">Email</label>
                <input 
                  type="email" 
                  id="registerEmail" 
                  name="email" 
                  required 
                  autocomplete="email"
                />
              </div>
              <div class="form-group">
                <label for="registerPassword">Password</label>
                <input 
                  type="password" 
                  id="registerPassword" 
                  name="password" 
                  required 
                  autocomplete="new-password"
                  minlength="6"
                />
              </div>
              <button type="submit" class="auth-submit">Daftar</button>
            </form>

            <div id="authMessage" class="auth-message" role="alert"></div>
          </div>
        </div>
      </main>
    `;
  },

  async afterRender() {
    const main = document.getElementById('main');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const authMessage = document.getElementById('authMessage');
    const authTabs = document.querySelectorAll('.auth-tab');
    const authForms = document.querySelectorAll('.auth-form');

    main.focus();

    

      // Check URL for mode parameter

        const hash = window.location.hash;
        let mode = 'login';

        // Deteksi baik dari /auth?mode=, /login, atau /register
        if (hash.includes('register')) mode = 'register';
        else if (hash.includes('login')) mode = 'login';
        else if (hash.includes('?mode=register')) mode = 'register';

    
      // Set initial tab based on URL mode
      if (mode === 'register') {
        authTabs[1].classList.add('active');
        authTabs[0].classList.remove('active');
        registerForm.classList.add('active');
        loginForm.classList.remove('active');
      } else {
        authTabs[0].classList.add('active');
        authTabs[1].classList.remove('active');
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
      }

    // Tab switching
    authTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTab = tab.dataset.tab;
        
          // First update the URL
          window.location.hash = `#/auth?mode=${targetTab}`;
        
          // Then update the UI
          authTabs.forEach(t => t.classList.remove('active'));
          authForms.forEach(f => f.classList.remove('active'));
        
          tab.classList.add('active');
          if (targetTab === 'login') {
            loginForm.classList.add('active');
          } else {
            registerForm.classList.add('active');
          }

        // Clear message
        authMessage.textContent = '';
      });
    });

    // Login handler
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Disable submit button and show loading
      const submitBtn = loginForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Masuk...';

      const formData = new FormData(loginForm);
      const email = formData.get('email');
      const password = formData.get('password');

      try {
        const response = await Api.login({ email, password });
        if (response.error) {
          authMessage.textContent = response.message;
          authMessage.style.color = 'red';
          submitBtn.disabled = false;
          submitBtn.textContent = originalBtnText;
          return;
        }

        // Save auth data
        localStorage.setItem(CONFIG.TOKEN_KEY, response.loginResult.token);
        localStorage.setItem(CONFIG.USERNAME_KEY, response.loginResult.name);

        // Show success message
        authMessage.textContent = '✅ Login berhasil! Mengarahkan ke beranda...';
        authMessage.style.color = 'green';

        // Clear form
        loginForm.reset();

        // After 1s, redirect to home
        setTimeout(() => {
          window.location.hash = '#/';
        }, 1000);

        
      } catch (err) {
        console.error('Login error:', err);
        authMessage.textContent = 'Terjadi kesalahan saat login. Silakan coba lagi.';
      }
    });

    // Register handler
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Disable submit button and show loading
      const submitBtn = registerForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Mendaftarkan...';

      const formData = new FormData(registerForm);
      const name = formData.get('name');
      const email = formData.get('email');
      const password = formData.get('password');

      try {
        const response = await Api.register({ name, email, password });
        if (response.error) {
          authMessage.textContent = response.message;
          authMessage.style.color = 'red';
          submitBtn.disabled = false;
          submitBtn.textContent = originalBtnText;
          return;
        }

        // Show success message
        authMessage.textContent = '✅ Registrasi berhasil! Silakan login untuk melanjutkan.';
        authMessage.style.color = 'green';

        // Clear any existing auth data
        localStorage.removeItem(CONFIG.TOKEN_KEY);
        localStorage.removeItem(CONFIG.USERNAME_KEY);

        // Reset form
        registerForm.reset();

        // Pre-fill email in login form
        document.getElementById('loginEmail').value = email;

        // After 1.5s, switch to login tab and focus password field
        setTimeout(() => {
          window.location.hash = '#/auth?mode=login';
          document.getElementById('loginPassword').focus();
        }, 1500);

        
      } catch (err) {
        console.error('Register error:', err);
        authMessage.textContent = 'Terjadi kesalahan saat registrasi. Silakan coba lagi.';
      }
    });
  },
};

export default AuthPage;