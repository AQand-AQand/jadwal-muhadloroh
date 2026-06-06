const CACHE_NAME = 'muhadloroh-v1';

// Daftar file dan aset luar yang wajib disimpan agar bisa dibuka tanpa kuota
const urlsToCache = [
    './',
    './index.html',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
    'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Amiri:wght@400;700&display=swap'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(urlsToCache);
        })
    );
});

// Otomatis menyimpan aset lain (seperti file font lanjutan) saat pertama kali dimuat
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            if (response) return response;
            
            return fetch(event.request).then(fetchRes => {
                // Jangan simpan respon yang gagal atau bermasalah
                if (!fetchRes || fetchRes.status !== 200 || fetchRes.type !== 'basic' && fetchRes.type !== 'cors') {
                    return fetchRes;
                }
                
                // Simpan aset baru ke dalam cache
                const responseToCache = fetchRes.clone();
                caches.open(CACHE_NAME).then(cache => {
                    if (event.request.url.startsWith('http')) {
                        cache.put(event.request, responseToCache);
                    }
                });
                
                return fetchRes;
            });
        }).catch(() => {
            // Jika benar-benar offline dan tidak ada di cache, arahkan ke index
            if (event.request.mode === 'navigate') {
                return caches.match('./index.html');
            }
        })
    );
});