self.addEventListener('install', function (event) {
  console.log('Service Worker installing.');
});

self.addEventListener('fetch', function (event) {
  // Optionally handle caching
});
