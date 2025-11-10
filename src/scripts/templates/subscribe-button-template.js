export function generateSubscribeButtonTemplate() {
  return `
    <button id="subscribe-button" class="subscribe-btn" aria-label="Berlangganan Notifikasi">
      🔔 Subscribe
    </button>
  `;
}

export function generateUnsubscribeButtonTemplate() {
  return `
    <button id="unsubscribe-button" class="unsubscribe-btn" aria-label="Berhenti Berlangganan Notifikasi">
      🔕 Unsubscribe
    </button>
  `;
}
