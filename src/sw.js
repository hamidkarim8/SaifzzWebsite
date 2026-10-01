const CACHE = 'saifzz-__VERSION__';
const PRECACHE = self.__PRECACHE__;

self.addEventListener('install', (e) => {
    e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(keys.filter((k) => k.startsWith('saifzz-') && k !== CACHE).map((k) => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

const timeout = (ms) => new Promise((_, reject) => setTimeout(reject, ms));
const notFound = (path) => (path === '/ms' || path.startsWith('/ms/') ? '/ms/404' : '/404');

self.addEventListener('fetch', (e) => {
    const req = e.request;
    const url = new URL(req.url);
    if (req.method !== 'GET' || url.origin !== location.origin) return;
    if (req.mode === 'navigate') {
        e.respondWith(
            Promise.race([fetch(req), timeout(4000)])
                .then((res) => {
                    if (res.ok && !res.redirected) {
                        const copy = res.clone();
                        caches.open(CACHE).then((c) => c.put(url.pathname, copy));
                    }
                    return res;
                })
                .catch(async () => (await caches.match(url.pathname)) || caches.match(notFound(url.pathname)))
        );
        return;
    }
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req)));
});
