module.exports = function(router, app){
	router.get('/help', function(req, res, next) {
	    res.render('help', {title: 'Watson Twitter Communication', page_name: 'help', name: 'HSmith', loggedIn: true});

	});
}