// Basic cache-first offline for GET requests
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open('v1').then(cache => cache.add('/')))
})
self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return
  event.respondWith((async () => {
    const cached = await caches.match(req)
    if (cached) return cached
    try {
      const fresh = await fetch(req)
      const cache = await caches.open('v1')
      cache.put(req, fresh.clone())
      return fresh
    } catch (e) {
      return caches.match('/')
    }
  })())
})
