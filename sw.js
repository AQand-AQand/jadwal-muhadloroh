const CACHE_NAME = 'muhadloroh-v2-pro'; // <--- VERSI SUDAH DIUPDATE KE V2
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './manifest.json',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Amiri:wght@400;700&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/html-to-image/1.11.11/html-to-image.min.js'
];

// Install Service Worker
self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS_TO_CACHE))
    );
});

// Activate dan Hapus Cache Lama
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys.map(key => {
                if (key !== CACHE_NAME) {
                    console.log('Menghapus cache lama:', key);
                    return caches.delete(key);
                }
            })
        ))
    );
    self.clients.claim();
});

// Fetching Data (Prioritas Cache lalu Network)
self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;
    
    event.respondWith(
        caches.match(event.request).then(cachedRes => {
            const fetchPromise = fetch(event.request).then(networkRes => {
                // Update cache dengan respon terbaru
                if (networkRes && networkRes.status === 200) {
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, networkRes.clone());
                    });
                }
                return networkRes;
            }).catch(() => null);

            return cachedRes || fetchPromise;
        })
    );
});
