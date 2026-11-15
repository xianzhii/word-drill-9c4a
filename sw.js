/* ==========================================================================
   考研英语单词背诵 · 离线缓存 Service Worker
   版本：v1.0-r2   （页面内容或题库更新时，请把 CACHE_NAME 末尾版本号 +1）
   策略：安装即预缓存核心文件 → 请求走「缓存优先、未命中回网络并回填」
        → 导航请求一律回退 index.html（断网也能完整打开）
        → 激活时清理本应用的旧缓存
   ========================================================================== */

const CACHE_NAME = 'kaoyan-words-pwa-v1.0-r2';

/* 预缓存清单：页面本身 + manifest + 5 个图标，全部为相对路径（子路径部署安全） */
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/apple-touch-icon-180.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-192-maskable.png',
  './icons/icon-512-maskable.png'
];

/* 安装：把核心文件写进缓存，装完立即接管 */
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(PRECACHE_URLS);
      await self.skipWaiting();
    })()
  );
});

/* 激活：清理旧版本缓存，并立即接管所有页面 */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

/* 取用：缓存优先 → 未命中走网络并回填 → 断网时导航请求回退 index.html */
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      /* 1) 缓存命中直接返回 */
      if (req.mode === 'navigate') {
        const page = await cache.match('./index.html');
        if (page) return page;
      } else {
        const hit = await cache.match(req, { ignoreSearch: true });
        if (hit) return hit;
      }

      /* 2) 缓存未命中再走网络，并顺手写入缓存 */
      try {
        const res = await fetch(req);
        if (res && res.status === 200 && res.type === 'basic') {
          cache.put(req, res.clone()).catch(() => {});
        }
        return res;
      } catch (err) {
        /* 3) 断网兜底：导航请求返回缓存的首页 */
        if (req.mode === 'navigate') {
          const page = await cache.match('./index.html');
          if (page) return page;
        }
        throw err;
      }
    })()
  );
});
