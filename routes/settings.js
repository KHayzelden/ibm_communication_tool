module.exports = function(router, app){
	router.get('/settings', function(req, res, next) {
	    res.render('settings', {title: 'Watson Twitter Communication', page_name: 'settings', name: 'HSmith', loggedIn: true});

	});
}