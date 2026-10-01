const CACHE = 'saifzz-__VERSION__';
const PRECACHE = self.__PRECACHE__;

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE)
            .then((c) => Promise.all(PRECACHE.map((u) => fetch(u).then((res) => {
                if (!res.ok) throw new Error(`${u} ${res.status}`);
                const body = res.redirected ? new Response(res.body, { status: res.status, headers: res.headers }) : res;
                return c.put(u.endsWith('/') && u.length > 1 ? clean(u) : u, body);
            }))))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(keys.filter((k) => k.startsWith('saifzz-') && k !== CACHE).map((k) => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

const timeout = (ms) => new Promise((_, reject) => setTimeout(reject, ms));
const clean = (p) => {
    const s = p.replace(/\/index\.html$/, '/').replace(/\.html$/, '');
    return s.length > 1 ? s.replace(/\/$/, '') : s;
};
const notFound = (p) => (p === '/ms' || p.startsWith('/ms/') ? '/ms/404' : '/404');
const fresh = (req, key) =>
    Promise.race([fetch(req), timeout(4000)]).then((res) => {
        if (res.ok && !res.redirected) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(key, copy));
        }
        return res;
    });

self.addEventListener('fetch', (e) => {
    const req = e.request;
    const url = new URL(req.url);
    if (req.method !== 'GET' || url.origin !== location.origin) return;
    const path = clean(url.pathname);
    if (req.mode === 'navigate') {
        e.respondWith(fresh(req, path).catch(async () => (await caches.match(path)) || caches.match(notFound(path))));
        return;
    }
    if (/\.(css|js|webmanifest)$/.test(url.pathname) && !url.pathname.startsWith('/_astro/')) {
        e.respondWith(fresh(req, url.pathname).catch(() => caches.match(url.pathname)));
        return;
    }
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req)));
});
