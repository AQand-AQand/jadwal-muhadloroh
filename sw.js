const CACHE_NAME = 'muhadloroh-cache-v5';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './logo.svg',
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Amiri:wght@400;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/html-to-image/1.11.11/html-to-image.min.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).then(response => {
      const responseClone = response.clone();
      caches.open(CACHE_NAME).then(cache => {
        cache.put(event.request, responseClone);
      });
      return response;
    }).catch(() => {
      return caches.match(event.request);
    })
  );
});

self.addEventListener('activate', event => {
  const cacheAllowlist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheAllowlist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// === MENDENGARKAN EVENT PUSH PEMBERITAHUAN DARI SERVER ===
self.addEventListener('push', event => {
  let data = { 
    title: 'Muhadloroh BU Daltim', 
    body: 'Waktu KBM mengajar ustadz akan dimulai!',
    targetTab: 'hari'
  };
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: './logo.svg',
    badge: './logo.svg',
    vibrate: [500, 110, 500, 110, 450, 110, 200, 110, 170, 40],
    sound: 'default',
    requireInteraction: true,
    data: {
      url: data.targetTab ? `./index.html?tab=${data.targetTab}` : './index.html',
      targetTab: data.targetTab
    },
    actions: [
      { action: 'buka_aplikasi', title: 'Buka Aplikasi', icon: './logo.svg' },
      { action: 'tutup_notif', title: 'Abaikan', icon: '' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// === RESPONS KETIKA BANNER / TOMBOL AKSI DIKLIK ===
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'tutup_notif') {
    return;
  }

  let targetUrl = event.notification.data.url;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes('index.html') && 'focus' in client) {
          if (event.notification.data.targetTab) {
            client.postMessage({ action: 'pindahTabNotif', tab: event.notification.data.targetTab });
          }
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});