module.exports = function(router, app){
	router.get('/search_history', function(req, res, next) {
	    res.render('search_history', {title: 'Watson Twitter Communication', page_name: 'search_history', name: 'HSmith', loggedIn: true});

	});
}