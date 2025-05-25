const CACHE_NAME = 'beisbol-liga-v1';
const urlsToCache = [
  '/',
  'index.html',
  'BEISBOL MANAGER-Partidos.html',
  'BEISBOL MANAGER-jugadores.html',
  'BEISBOL MANAGER-formato.html',
  'BEISBOL MANAGER-jugadas.html',
  'BEISBOL ESTADISTICAS-LOGO.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
  // Agrega aquí todas las rutas a tus archivos CSS, JS y otras imágenes
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});