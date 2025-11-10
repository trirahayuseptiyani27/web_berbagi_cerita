// src/scripts/utils/auth-utils.js
import CONFIG from '../config.js';

const AuthUtils = {
  checkLoginState() {
    const token = localStorage.getItem(CONFIG.TOKEN_KEY);
    const username = localStorage.getItem(CONFIG.USERNAME_KEY);
    return { isLoggedIn: !!token, token, username };
  },

  redirectIfNotLoggedIn() {
    const { isLoggedIn } = this.checkLoginState();
    if (!isLoggedIn) {
      window.location.hash = '#/auth';
      return true;
    }
    return false;
  },

  initAuthButtons() {
    const mainNav = document.getElementById('mainNav');
    const authNav = document.getElementById('authNav');
    const registerButton = document.getElementById('registerButton');
    const loginButton = document.getElementById('loginButton');
    const logoutButton = document.getElementById('logoutButton');
    
    if (!mainNav || !authNav || !registerButton || !loginButton || !logoutButton) return;

    const { isLoggedIn, username } = this.checkLoginState();

    if (isLoggedIn) {
      // Show main navigation and hide auth buttons
      mainNav.style.display = 'flex';
      registerButton.style.display = 'none';
      loginButton.style.display = 'none';
      logoutButton.style.display = 'flex';
      logoutButton.title = `Keluar (${username})`;

      // Only add listener if it hasn't been added before
      if (!logoutButton.hasClickListener) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem(CONFIG.TOKEN_KEY);
            localStorage.removeItem(CONFIG.USERNAME_KEY);
            window.location.hash = '#/'; // kembali ke halaman selamat datang
            this.initAuthButtons();
            });

        logoutButton.hasClickListener = true;
      }
    } else {
      // Hide main navigation and show auth buttons
      mainNav.style.display = 'none';
      registerButton.style.display = 'flex';
      loginButton.style.display = 'flex';
      logoutButton.style.display = 'none';

        // Remove old event listeners if they exist
        if (registerButton.hasClickListener) {
          registerButton.removeEventListener('click', registerButton.clickHandler);
        }
        if (loginButton.hasClickListener) {
          loginButton.removeEventListener('click', loginButton.clickHandler);
        }

        // Add new event listeners
        registerButton.clickHandler = (e) => {
          e.preventDefault();
          window.location.hash = '#/auth?mode=register';
        };
        loginButton.clickHandler = (e) => {
          e.preventDefault();
          window.location.hash = '#/auth?mode=login';
        };

        registerButton.addEventListener('click', registerButton.clickHandler);
        loginButton.addEventListener('click', loginButton.clickHandler);
        registerButton.hasClickListener = true;
        loginButton.hasClickListener = true;
    }
  }
};

export default AuthUtils;