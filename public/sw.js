const staticAssets = [
	'./',
	'./stylesheets/style.css'

];



self.addEventListener('install', async event =>{
	// console.log('install');
	const cache = await caches.open('aict-static');
	cache.addAll(staticAssets);
});

self.addEventListener('fetch', event =>{
	//console.log('fetch');

	// cache first strategy
	const req = event.request;
	event.respondWith(cacheFirst(req));
});

async function cacheFirst(req){
	const cachedResponse = await caches.match(req);
	return cachedResponse || fetch(req);
}