/**
 * Service Worker for Push Notifications
 * Handles background notifications and message passing
 */

const CACHE_NAME = 'swift-tracking-v3-mobile-2026-09-14';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './admin.html',
  './css/style.css',
  './js/app.js',
  './js/notifications.js',
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((error) => {
        console.warn('Cache addAll error (some assets may not exist):', error);
      });
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - network first with fallback to cache
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip API calls - let them fail gracefully
  if (event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone and cache successful responses
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      })
      .catch(() => {
        // Fall back to cache on network error
        return caches.match(event.request).then((cachedResponse) => {
          return cachedResponse || new Response('Offline - page not cached');
        });
      })
  );
});

// Handle incoming messages from the app
self.addEventListener('message', (event) => {
  const { type, title, options } = event.data;

  if (type === 'SHOW_NOTIFICATION') {
    self.registration.showNotification(title, options);
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  const notification = event.notification;
  const tag = notification.tag;

  notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Try to find an existing window with the tracking page
      for (let client of clientList) {
        if (client.url.includes('index.html') || client.url.includes('tracking')) {
          client.focus();
          // Send message to navigate to tracking
          client.postMessage({
            type: 'NAVIGATE_TO_TRACKING',
            trackingNumber: tag,
          });
          return;
        }
      }

      // If no window exists, open a new one
      if (clients.openWindow) {
        return clients.openWindow(`/?track=${tag}`);
      }
    })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event.notification.tag);
});
