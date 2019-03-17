// const staticAssets = [
// 	'./',
// 	'./stylesheets/style.css',
// 	'./search',
// 	'./account',
// 	'./bookmarks',
// 	'./search_history',
// 	'./settings'
// ];


// Fill here with your cache name-version.
const CACHE_NAME = 'my-cache-v1'
// This is the list of URLs to be cached by your Progressive Web App URLs.
const CACHED_URLS = [
  // './',
  './stylesheets/style.css',
  './search',
  './account',
  './bookmarks',
  './search_history',
  './settings'
]

let cache = null

// Open cache on install.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(currentCache => {
        // Store a reference to current cache, to be used on fetch event handler.
        cache = currentCache

        cache.addAll(CACHED_URLS)
      })
      .then(self.skipWaiting())
  )
})

// Handle fetch event with snippet stolen from here: https://www.youtube.com/watch?v=TtXvE814SQA
self.addEventListener('fetch', event => {
  const request = event.request

  const networkResponsePromise = fetch(request).catch(ignore => {})
  const cachedResponsePromise = caches.match(request)

  event.respondWith(async function () {
    const cacheResponse = await cachedResponsePromise
    if (cacheResponse) return cacheResponse

    const networkResponse = await networkResponsePromise
    if (networkResponse) return networkResponse.clone()

    throw new Error(`Neither network nor cache had a response for ${request.url}`)
  }())

  event.waitUntil(async function () {
    const networkResponse = await networkResponsePromise

    if (networkResponse) cache.put(request, networkResponse.clone())
  }())
})

// Clean up caches other than current.
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          const deleteThisCache = cacheName !== CACHE_NAME

          return deleteThisCache
        }).map(cacheName => caches.delete(cacheName))
      )
    })
  )
})
/*
------ STALE-WHILE-REVALIDATE --------
*/
// self.addEventListener('fetch', function(event) {
//   event.respondWith(
//     caches.open('watsoncomm-dynamic').then(function(cache) {
//       return cache.match(event.request).then(function(response) {
//         var fetchPromise = fetch(event.request).then(function(networkResponse) {
//           cache.put(event.request, networkResponse.clone());
//           return networkResponse;
//         })
//         return response || fetchPromise;
//       })
//     })
//   );
// });


// self.addEventListener('install', async event =>{
// 	// console.log('install');
// 	const cache = await caches.open('aict-static');
// 	cache.addAll(staticAssets);
// });

// self.addEventListener('fetch', event =>{
// 	//console.log('fetch');

// 	const req = event.request;
// 	const url = new URL(req.url);

// // If we are fetching from our own site
// 	if(url.origin == location.origin){
// 		// cache first strategy
// 		event.respondWith(cacheFirst(req));
// 	} else{
// 		// network first strategy
// 		event.respondWith(networkFirst(req));
// 	}

// });

// async function cacheFirst(req){
// 	const cachedResponse = await caches.match(req);
// 	return cachedResponse || fetch(req);
// }

// async function networkFirst(req){
// 	const cache = await caches.open('aict-dynamic');

// 	try{
// 		const res = await fetch(req);
// 		cache.put(req, res.clone()); // allows us to define the request, add not necessary
// 		return res;
// 	} catch(error){
// 		return await cache.match(req);
// 	}
// }