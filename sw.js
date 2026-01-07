const CACHE_NAME = 'picasso-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js',
  'https://cdn.jsdelivr.net/npm/sweetalert2@11',
  'https://cdn.jsdelivr.net/npm/signature_pad@4.0.0/dist/signature_pad.umd.min.js'
];

// 安裝時：下載並快取所有檔案
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// 啟動時：清理舊快取
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.map((key) => {
        if (key !== CACHE_NAME) return caches.delete(key);
      })
    ))
  );
});

// 攔截請求：如果斷網，從快取給檔案 (Network First 策略)
self.addEventListener('fetch', (e) => {
  // 只處理 GET 請求
  if (e.request.method !== 'GET') return;

  e.respondWith(
    fetch(e.request)
      .then((res) => {
        // 只有成功的請求才放入快取 (排除 API 請求，因為 API 我們用 localStorage 處理)
        const isApi = e.request.url.includes('script.google.com');
        if (!isApi && res && res.status === 200) {
           const resClone = res.clone();
           caches.open(CACHE_NAME).then((cache) => cache.put(e.request, resClone));
        }
        return res;
      })
      .catch(() => {
        // 如果斷網，讀取快取
        return caches.match(e.request);
      })
  );
});