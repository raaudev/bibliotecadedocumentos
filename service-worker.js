// Service Worker para funcionalidade PWA
const CACHE_NAME = 'biblioteca-digital-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/css/animations.css',
  '/css/print.css',
  '/css/themes.css',
  '/css/reading-mode.css',
  '/js/main.js',
  '/assets/icons/document.svg',
  '/assets/icons/pdf.svg',
  '/assets/icons/add.svg',
  '/assets/icons/download.svg',
  '/assets/icons/search.svg',
  '/assets/icons/share.svg'
];

// Instalação do Service Worker e cache de recursos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Interceptação de requisições para servir do cache quando offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - retorna resposta do cache
        if (response) {
          return response;
        }

        // Clone da requisição
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          response => {
            // Verifica se recebemos uma resposta válida
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone da resposta
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        ).catch(() => {
          // Se falhar ao buscar online e for um documento HTML, PDF ou imagem,
          // retorna uma página offline personalizada
          if (event.request.headers.get('accept').includes('text/html') ||
              event.request.url.endsWith('.pdf')) {
            return caches.match('/offline.html');
          }
        });
      })
  );
});

// Limpeza de caches antigos
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
