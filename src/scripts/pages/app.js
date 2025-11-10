import routes from '../routes/routes.js';
import UrlParser from '../routes/url-parser.js';
import AuthUtils from '../utils/auth-utils.js';
import {
  isCurrentPushSubscriptionAvailable,
  subscribe,
  unsubscribe,
} from '../utils/notification-helper.js';
import {
  generateSubscribeButtonTemplate,
  generateUnsubscribeButtonTemplate,
} from '../templates/subscribe-button-template.js';
import OfflineStories from './offline-stories.js';

class App {
  constructor({ content }) {
    this.content = content;
    this.init();
  }

  // 🔔 Setup Push Notification (subscribe/unsubscribe)
  async #setupPushNotification() {
    const pushTools = document.getElementById('push-notification-tools');
    if (!pushTools) return;

    const isSubscribed = await isCurrentPushSubscriptionAvailable();

    if (isSubscribed) {
      // Jika sudah berlangganan → tampilkan tombol Unsubscribe
      pushTools.innerHTML = generateUnsubscribeButtonTemplate();
      document.getElementById('unsubscribe-button').onclick = async () => {
        await unsubscribe();
        await this.#setupPushNotification(); // refresh tombol
      };
      return;
    }

    // Jika belum berlangganan → tampilkan tombol Subscribe
    pushTools.innerHTML = generateSubscribeButtonTemplate();
    document.getElementById('subscribe-button').onclick = async () => {
      await subscribe();
      await this.#setupPushNotification(); // refresh tombol
    };
  }

  // 🔄 Render halaman utama
  async renderPage() {
    const el = this.content;
    const parsedUrl = UrlParser.parseActiveUrlWithCombiner();
    const page = routes[parsedUrl] || routes['/'];

    const protectedRoutes = ['/add', '/stories', '/map'];
    const { isLoggedIn } = AuthUtils.checkLoginState();
    if (protectedRoutes.includes(parsedUrl) && !isLoggedIn) {
      window.location.hash = '#/auth?mode=login';
      return;
    }

    AuthUtils.initAuthButtons();

    if (document.startViewTransition) {
      document.startViewTransition(async () => {
        el.innerHTML = await page.render();
        if (page.afterRender) await page.afterRender();
        AuthUtils.initAuthButtons();
        await this.#setupPushNotification();
      });
    } else {
      el.innerHTML = await page.render();
      if (page.afterRender) await page.afterRender();
      AuthUtils.initAuthButtons();
      await this.#setupPushNotification();
    }
  }

  init() {
    this.renderPage();
    window.addEventListener('hashchange', () => this.renderPage());
    AuthUtils.initAuthButtons();
  }
}

export default App;
