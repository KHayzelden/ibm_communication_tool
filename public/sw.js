// const staticAssets = [
// 	'./',
// 	'./stylesheets/style.css',
// 	'./search',
// 	'./account',
// 	'./bookmarks',
// 	'./search_history',
// 	'./settings'
// ];

'use strict';

// Licensed under a CC0 1.0 Universal (CC0 1.0) Public Domain Dedication
// http://creativecommons.org/publicdomain/zero/1.0/

(function() {

    // Update 'version' if you need to refresh the cache
    var staticCacheName = 'aict-static';
    var version = 'v1::';

    // Store core files in a cache (including a page to display when offline)
    function updateStaticCache() {
      return caches.open(version + staticCacheName)
      .then(function (cache) {
        return cache.addAll([
                      // './',
                      './stylesheets/style.css',
                      './search',
                      './account',
                      './bookmarks',
                      './search_history',
                      './settings'
                      ]);
      });
    };

    self.addEventListener('install', function (event) {
      event.waitUntil(updateStaticCache());
    });

    self.addEventListener('activate', function (event) {
      event.waitUntil(
        caches.keys()
        .then(function (keys) {
                    // Remove caches whose name is no longer valid
                    return Promise.all(keys
                      .filter(function (key) {
                        return key.indexOf(version) !== 0;
                      })
                      .map(function (key) {
                        return caches.delete(key);
                      })
                      );
                  })
        );
    });

    self.addEventListener('fetch', function (event) {
      var request = event.request;
        // Always fetch non-GET requests from the network
        if (request.method !== 'GET') {
          event.respondWith(
            fetch(request)
            .catch(function () {
              return caches.match('/index'); //offline.html
            })
            );
          return;
        }

        // For HTML requests, try the network first, fall back to the cache, finally the offline page
        if (request.headers.get('Accept').indexOf('text/html') !== -1) {
            // Fix for Chrome bug: https://code.google.com/p/chromium/issues/detail?id=573937
            if (request.mode != 'navigate') {
              request = new Request(request.url, {
                method: 'GET',
                headers: request.headers,
                mode: request.mode,
                credentials: request.credentials,
                redirect: request.redirect
              });
            }
            event.respondWith(
              fetch(request)
              .then(function (response) {
                        // Stash a copy of this page in the cache
                        var copy = response.clone();
                        caches.open(version + staticCacheName)
                        .then(function (cache) {
                          cache.put(request, copy);
                        });
                        return response;
                      })
              .catch(function () {
                return caches.match(request)
                .then(function (response) {
                  return response || caches.match('/index');
                })
              })
              );
            return;
          }

        // For non-HTML requests, look in the cache first, fall back to the network
        event.respondWith(
          caches.match(request)
          .then(function (response) {
            return response || fetch(request)
            .catch(function () {
                            // If the request is for an image, show an offline placeholder
                            if (request.headers.get('Accept').indexOf('image') !== -1) {
                              return new Response('<svg width="400" height="300" role="img" aria-labelledby="offline-title" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><title id="offline-title">Offline</title><g fill="none" fill-rule="evenodd"><path fill="#D8D8D8" d="M0 0h400v300H0z"/><text fill="#9B9B9B" font-family="Helvetica Neue,Arial,Helvetica,sans-serif" font-size="72" font-weight="bold"><tspan x="93" y="172">offline</tspan></text></g></svg>', { headers: { 'Content-Type': 'image/svg+xml' }});
                            }
                          });
          })
          );
      });

  })();

// // Fill here with your cache name-version.
// const CACHE_NAME = 'my-cache-v1'
// // This is the list of URLs to be cached by your Progressive Web App URLs.
// const CACHED_URLS = [
// './',
//   './stylesheets/style.css',
//   './search',
//   './account',
//   './bookmarks',
//   './search_history',
//   './settings'
// ]

// let cache = null

// // Open cache on install.
// self.addEventListener('install', event => {
//   event.waitUntil(
//     caches.open(CACHE_NAME)
//       .then(currentCache => {
//         // Store a reference to current cache, to be used on fetch event handler.
//         cache = currentCache

//         cache.addAll(CACHED_URLS)
//       })
//       .then(self.skipWaiting())
//   )
// })

// // Handle fetch event with snippet stolen from here: https://www.youtube.com/watch?v=TtXvE814SQA
// self.addEventListener('fetch', event => {
//   const request = event.request

//   const networkResponsePromise = fetch(request).catch(ignore => {})
//   const cachedResponsePromise = caches.match(request)

//   event.respondWith(async function () {
//     const cacheResponse = await cachedResponsePromise
//     if (cacheResponse) return cacheResponse

//     const networkResponse = await networkResponsePromise
//     if (networkResponse) return networkResponse.clone()

//     throw new Error(`Neither network nor cache had a response for ${request.url}`)
//   }())

//   event.waitUntil(async function () {
//     const networkResponse = await networkResponsePromise

//     if (networkResponse) cache.put(request, networkResponse.clone())
//   }())
// })

// // Clean up caches other than current.
// self.addEventListener('activate', event => {
//   event.waitUntil(
//     caches.keys().then(cacheNames => {
//       return Promise.all(
//         cacheNames.filter(cacheName => {
//           const deleteThisCache = cacheName !== CACHE_NAME

//           return deleteThisCache
//         }).map(cacheName => caches.delete(cacheName))
//       )
//     })
//   )
// })


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