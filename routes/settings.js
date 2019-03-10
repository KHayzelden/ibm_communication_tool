module.exports = function(router, app){
	router.get('/settings', function(req, res, next) {
	    res.render('settings', {title: 'Watson Titter Communication', page_name: 'settings', name: 'HSmith', loggedIn: true});

	});
}