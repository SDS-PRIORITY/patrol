// Service Worker – מאפשר לסורק להיפתח גם בלי קליטה (אחרי טעינה ראשונה)
const CACHE = 'patrol-v1';
const ASSETS = ['./', './index.html', './config.js', './manifest.json', './icon.svg',
  'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// קודם רשת, ואם אין – מהמטמון. בקשות ל-Apps Script לא נשמרות במטמון.
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.hostname.includes('script.google')) return;
  e.respondWith(
    fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return res;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
