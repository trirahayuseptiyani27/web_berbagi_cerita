import CONFIG from '../config.js';

// 🔹 Mengecek ketersediaan fitur notifikasi dan service worker
export function isNotificationAvailable() {
  return 'Notification' in window && 'serviceWorker' in navigator;
}

// 🔹 Mengecek apakah izin notifikasi sudah diberikan
export function isNotificationGranted() {
  return Notification.permission === 'granted';
}

// 🔹 Meminta izin notifikasi
export async function requestNotificationPermission() {
  if (!isNotificationAvailable()) {
    alert('Browser tidak mendukung Push Notification.');
    return false;
  }

  const permission = await Notification.requestPermission();
  if (permission === 'granted') {
    console.log('✅ Izin notifikasi diberikan.');
    return true;
  } else {
    alert('❌ Izin notifikasi ditolak atau diabaikan.');
    return false;
  }
}

// 🔹 Mendapatkan objek PushSubscription (jika ada)
export async function getPushSubscription() {
  const registration = await navigator.serviceWorker.getRegistration();
  return await registration?.pushManager.getSubscription();
}

// 🔹 Mengecek apakah saat ini user sudah berlangganan
export async function isCurrentPushSubscriptionAvailable() {
  const subscription = await getPushSubscription();
  return !!subscription;
}

// 🔹 Melakukan proses langganan notifikasi
export async function subscribe() {
  if (!(await requestNotificationPermission())) {
    return;
  }

  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) {
    alert('Service Worker belum terdaftar.');
    return;
  }

  const convertedVapidKey = urlBase64ToUint8Array(CONFIG.VAPID_PUBLIC_KEY);

  try {
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey,
    });

    console.log('✅ Berhasil berlangganan Push Notification');
    console.log('Subscription:', subscription);
    alert('Berhasil berlangganan notifikasi!');
    return subscription;
  } catch (error) {
    console.error('❌ Gagal berlangganan Push Notification', error);
    alert('Gagal berlangganan notifikasi.');
  }
}

// 🔹 Melakukan proses berhenti berlangganan (unsubscribe)
export async function unsubscribe() {
  const failureUnsubscribeMessage = 'Langganan push notification gagal dinonaktifkan.';
  const successUnsubscribeMessage = 'Langganan push notification berhasil dinonaktifkan.';

  try {
    const pushSubscription = await getPushSubscription();
    if (!pushSubscription) {
      alert('Tidak bisa memutus langganan karena belum berlangganan sebelumnya.');
      return;
    }

    const unsubscribed = await pushSubscription.unsubscribe();
    if (!unsubscribed) {
      alert(failureUnsubscribeMessage);
      return;
    }

    console.log('Berhenti berlangganan Push Notification ❌');
    alert(successUnsubscribeMessage);
  } catch (error) {
    alert(failureUnsubscribeMessage);
    console.error('unsubscribe: error:', error);
  }
}

// 🔧 Fungsi bantu untuk konversi key (VAPID)
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
