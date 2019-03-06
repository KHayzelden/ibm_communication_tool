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
	console.log('fetch');
});