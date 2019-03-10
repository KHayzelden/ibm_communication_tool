module.exports = function(router, app){
	router.get('/account', function(req, res, next) {
	    res.render('account', {title: 'Watson Twitter Communication', page_name: 'account', name: 'HSmith', fname: 'Harry', sname: 'Smith', email: 'hsmith@gmail.com', loggedIn: true});

	});
}