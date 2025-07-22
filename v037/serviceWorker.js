// serviceWorker.js
const CACHE_NAME = "tenotsu-v036";
const URLS_TO_CACHE = [
  "./",
  "./index.html",
  "./script.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./characterStyles.js",
  "./random/textset01.json",
  "./random/image.json",
  "./scenarios/000start.json",
  "./css/style.css"
];

// インストール時にキャッシュ
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
});

// フェッチ時にキャッシュを優先
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// アップデート時に古いキャッシュ削除
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
});
