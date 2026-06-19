/* Homemade service worker — offline support for bookmarked tutorials.
 *
 * Strategy:
 *   - Cache the lightweight UI shell (favicon, fonts already on the page,
 *     a small offline fallback page) with cache-first.
 *   - Navigations (home / tutorial / category HTML): network-first, with the
 *     cache as an offline-only fallback. Serving cached HTML stale-first broke
 *     across deploys — the old HTML referenced build-hashed JS chunks that
 *     404 after a new build, so React couldn't hydrate and the page flickered
 *     between the stale and fresh design in a reload loop. Network-first keeps
 *     online users on fresh HTML and still serves bookmarked pages offline.
 *   - Master ingredient / tool refs: cache-first, refresh on foreground
 *     (the page already requests them at top of route — SW intercepts).
 *   - Hero images (R2 + transformations): cache-first, no expiry. Cleared
 *     manually via the message channel when the user un-bookmarks.
 *   - Search, admin, API mutations, analytics POSTs: never cached.
 *
 * The client can ask the SW to pre-cache an arbitrary URL set via a
 * postMessage of { type: 'precache', urls: [...] }. Bookmark toggle hooks
 * that in so adding a bookmark proactively warms the cache.
 */

const VERSION = 'homemade-sw-v2'
const SHELL_CACHE = `${VERSION}-shell`
const TUTORIAL_CACHE = `${VERSION}-tutorial`
const IMAGE_CACHE = `${VERSION}-image`
const MASTER_CACHE = `${VERSION}-master`

const SHELL_ASSETS = ['/offline', '/favicon.ico']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) =>
      cache.addAll(SHELL_ASSETS).catch(() => {
        // /offline might 404 on first install before the route is reachable;
        // that's fine, it'll cache on the first 200 response later.
      }),
    ),
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((keys) =>
        Promise.all(
          keys
            .filter((k) => !k.startsWith(VERSION))
            .map((k) => caches.delete(k)),
        ),
      ),
      self.clients.claim(),
    ]),
  )
})

self.addEventListener('message', (event) => {
  const data = event.data
  if (!data || typeof data !== 'object') return
  if (data.type === 'precache' && Array.isArray(data.urls)) {
    event.waitUntil(precacheUrls(data.urls))
  } else if (data.type === 'evict' && Array.isArray(data.urls)) {
    event.waitUntil(evictUrls(data.urls))
  } else if (data.type === 'skipWaiting') {
    self.skipWaiting()
  }
})

async function precacheUrls(urls) {
  const tutorialCache = await caches.open(TUTORIAL_CACHE)
  const imageCache = await caches.open(IMAGE_CACHE)
  await Promise.all(
    urls.map(async (url) => {
      try {
        const req = new Request(url, { credentials: 'include' })
        const res = await fetch(req)
        if (!res.ok) return
        if (isImageUrl(url)) {
          await imageCache.put(req, res.clone())
        } else {
          await tutorialCache.put(req, res.clone())
        }
      } catch {
        /* offline at precache time — ignore */
      }
    }),
  )
}

async function evictUrls(urls) {
  for (const cacheName of [TUTORIAL_CACHE, IMAGE_CACHE]) {
    const cache = await caches.open(cacheName)
    await Promise.all(urls.map((url) => cache.delete(url)))
  }
}

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)

  // Don't cache cross-origin except for hero image transformations on our
  // own domain (Cloudflare worker serves them under /cdn-cgi/image).
  if (url.origin !== self.location.origin && !isImageUrl(url.href)) {
    return
  }

  // Never cache: admin, /api/* mutations, analytics, search, sign-in.
  if (
    url.pathname.startsWith('/admin') ||
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/search') ||
    url.pathname.startsWith('/sign-in') ||
    url.pathname.startsWith('/sign-up') ||
    url.pathname.startsWith('/unlock')
  ) {
    return
  }

  // Hero images / R2 image transformations: cache-first.
  if (isImageUrl(req.url)) {
    event.respondWith(cacheFirst(req, IMAGE_CACHE))
    return
  }

  // Home, tutorial and category pages: network-first. Never serve stale HTML
  // first — it references build-specific JS chunks that 404 after a deploy.
  // The cache is only used when the network is unavailable (offline reading
  // of bookmarked pages, warmed via the precache message channel).
  if (url.pathname === '/' || isTutorialOrCategoryPath(url.pathname)) {
    event.respondWith(networkFirst(req, TUTORIAL_CACHE))
    return
  }

  // Master ingredient / tool reference endpoints: cache-first.
  if (url.pathname.startsWith('/api/refs/')) {
    event.respondWith(cacheFirst(req, MASTER_CACHE))
    return
  }
})

async function cacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName)
  const hit = await cache.match(req)
  if (hit) return hit
  try {
    const res = await fetch(req)
    if (res.ok) cache.put(req, res.clone())
    return res
  } catch {
    return new Response('Offline', { status: 503, statusText: 'Offline' })
  }
}

async function networkFirst(req, cacheName) {
  const cache = await caches.open(cacheName)
  try {
    const res = await fetch(req)
    // Only cache full 200s — never an opaque/redirect/error response, and
    // never a partial. The cached copy is the offline fallback only.
    if (res.ok && res.status === 200) cache.put(req, res.clone())
    return res
  } catch {
    const cached = await cache.match(req)
    if (cached) return cached
    const fallback = await caches.match('/offline')
    return (
      fallback ||
      new Response('Offline', { status: 503, statusText: 'Offline' })
    )
  }
}

function isImageUrl(url) {
  return (
    /\.(?:png|jpg|jpeg|webp|avif|gif|svg)(?:\?|$)/i.test(url) ||
    /\/cdn-cgi\/image\//.test(url) ||
    /imagedelivery\.net/.test(url) ||
    /\.r2\.cloudflarestorage\.com/.test(url)
  )
}

function isTutorialOrCategoryPath(pathname) {
  // /[categorySlug] or /[categorySlug]/[tutorialSlug] — single or double segment
  // of safe slug characters. Excludes /me/* and other known prefixes.
  if (
    pathname.startsWith('/me') ||
    pathname.startsWith('/legal') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api')
  ) {
    return false
  }
  return /^\/[a-z][a-z0-9-]*(?:\/[a-z][a-z0-9-]*)?\/?$/.test(pathname)
}
