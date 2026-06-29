/* ===========================
   ZOOM TECHNOLOGIE — SW.JS
   Service Worker PWA
   Cache-first pour assets statiques
   Network-first pour données
   =========================== */

const CACHE_NAME    = 'zoom-tech-v1';
const OFFLINE_URL   = '/offline.html';

// ── Assets à mettre en cache au premier chargement ──
const PRECACHE = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/css/style.css',
  '/css/cart.css',
  '/css/filters.css',
  '/css/chat.css',
  '/css/i18n.css',
  '/css/zoom-image.css',
  '/js/products.js',
  '/js/app.js',
  '/js/cookies.js',
  '/js/cart.js',
  '/js/filters.js',
  '/js/chat.js',
  '/js/i18n.js',
  '/js/zoom-image.js',
  '/icons/icon-192x192.svg',
  '/icons/icon-512x512.svg',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css',
];

// ════════════════════════════
// INSTALL — précache des assets
// ════════════════════════════
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Precache en mode no-cors pour les CDN externes
      const localAssets   = PRECACHE.filter(u => !u.startsWith('http'));
      const externalAssets= PRECACHE.filter(u =>  u.startsWith('http'));
      return Promise.all([
        cache.addAll(localAssets).catch(e => console.warn('[SW] Local precache partial:', e)),
        ...externalAssets.map(url =>
          cache.add(new Request(url, { mode: 'no-cors' }))
               .catch(e => console.warn('[SW] External CDN cache skip:', url))
        ),
      ]);
    })
  );
  self.skipWaiting();
});

// ════════════════════════════
// ACTIVATE — nettoyage anciens caches
// ════════════════════════════
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ════════════════════════════
// FETCH — stratégie hybride
// ════════════════════════════
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer : non-GET, extensions browser, admin
  if(request.method !== 'GET') return;
  if(url.pathname.startsWith('/admin')) return;
  if(request.url.includes('chrome-extension')) return;
  if(request.url.includes('analytics') || request.url.includes('gtag')) return;

  // Stratégie : images produits → cache-first (vite)
  if(url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)){
    event.respondWith(cacheFirst(request));
    return;
  }

  // Stratégie : CSS / JS / fonts → stale-while-revalidate
  if(url.pathname.match(/\.(css|js|woff2?|ttf)$/i) ||
     request.url.includes('fonts.googleapis') ||
     request.url.includes('cdnjs.cloudflare')){
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // Stratégie : HTML / navigation → network-first avec fallback offline
  if(request.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname === '/'){
    event.respondWith(networkFirstWithOffline(request));
    return;
  }

  // Par défaut : network-first
  event.respondWith(networkFirst(request));
});

// ════════════════════════════
// STRATÉGIES
// ════════════════════════════

// Cache d'abord, réseau si absent
async function cacheFirst(request){
  const cached = await caches.match(request);
  if(cached) return cached;
  try {
    const response = await fetch(request);
    if(response.ok){
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch(e) {
    return new Response('', { status: 408 });
  }
}

// Cache périmé servi immédiatement, revalidation en arrière-plan
async function staleWhileRevalidate(request){
  const cache  = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request).then(response => {
    if(response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => cached);
  return cached || fetchPromise;
}

// Réseau d'abord, cache si offline
async function networkFirst(request){
  try {
    const response = await fetch(request);
    if(response.ok){
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch(e) {
    const cached = await caches.match(request);
    return cached || new Response('Contenu non disponible hors connexion.', { status: 503 });
  }
}

// Network-first + page offline dédiée si navigation
async function networkFirstWithOffline(request){
  try {
    const response = await fetch(request);
    if(response.ok){
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch(e) {
    const cached = await caches.match(request);
    if(cached) return cached;
    const offline = await caches.match(OFFLINE_URL);
    return offline || new Response('<h1>Hors connexion</h1><p>Reconnectez-vous pour accéder à ZOOM Technologie.</p>', {
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

// ════════════════════════════
// MESSAGE — forcer mise à jour + notifications push
// ════════════════════════════
self.addEventListener('message', event => {
  if(event.data && event.data.type === 'SKIP_WAITING'){
    self.skipWaiting();
  }
  if(event.data && event.data.type === 'SHOW_NOTIFICATION'){
    const n = event.data.notif;
    self.registration.showNotification(n.title, {
      body:    n.body,
      icon:    n.icon  || 'icons/icon-192x192.svg',
      badge:   n.badge || 'icons/icon-96x96.svg',
      tag:     n.tag   || 'zoom-notif',
      data:    n.data  || {},
      vibrate: [200, 100, 200],
      actions: [
        { action:'open', title:'Voir les offres' },
        { action:'dismiss', title:'Plus tard' },
      ],
    });
  }
});

// Clic sur notification → ouvrir l'URL
self.addEventListener('notificationclick', event => {
  event.notification.close();
  if(event.action === 'dismiss') return;
  const url = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    clients.matchAll({ type:'window', includeUncontrolled:true }).then(list => {
      for(const client of list){
        if(client.url.includes(self.location.origin) && 'focus' in client){
          client.navigate(url); return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
