const staticAssets = [
	'./',
	'./stylesheets/style.css',
	'./search',
	'./account',
	'./bookmarks',
	'./search_history',
	'.settings'
];



self.addEventListener('install', async event =>{
	// console.log('install');
	const cache = await caches.open('aict-static');
	cache.addAll(staticAssets);
});

self.addEventListener('fetch', event =>{
	//console.log('fetch');

	const req = event.request;
	const url = new URL(req.url);

// If we are fetching from our own site
	if(url.origin == location.origin){
		// cache first strategy
		event.respondWith(cacheFirst(req));
	} else{
		// network first strategy
		event.respondWith(networkFirst(req));
	}

});

async function cacheFirst(req){
	const cachedResponse = await caches.match(req);
	return cachedResponse || fetch(req);
}

async function networkFirst(req){
	const cache = await caches.open('aict-dynamic');

	try{
		const res = await fetch(req);
		cache.put(req, res.clone()); // allows us to define the request, add not necessary
		return res;
	} catch(error){
		return await cache.match(req);
	}
}