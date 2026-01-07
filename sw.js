const CACHE_NAME = 'picasso-v2'; // 升級版本號以強制更新
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js',
  'https://cdn.jsdelivr.net/npm/sweetalert2@11',
  'https://cdn.jsdelivr.net/npm/signature_pad@4.0.0/dist/signature_pad.umd.min.js'
];

// 安裝
self.addEventListener('install', (e) => {
  self.skipWaiting(); // 強制立即接管
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

// 啟動
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.map((key) => {
        if (key !== CACHE_NAME) return caches.delete(key);
      })
    ))
  );
  self.clients.claim(); // 立即控制頁面
});

// 請求攔截
self.addEventListener('fetch', (e) => {
  const url = e.request.url;

  // 🔴 關鍵修正：如果是 Google API，直接放行，不要快取！
  if (url.includes('script.google.com')) {
     return; // 直接回傳，讓瀏覽器自己處理 API 連線
  }

  // 其他靜態檔案 (HTML, CSS, JS) 才走快取
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
        return cachedResponse || fetch(e.request);
    })
  );
});
