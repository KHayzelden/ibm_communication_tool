const passport = require('passport');
const appID = require("ibmcloud-appid");

const WebAppStrategy = appID.WebAppStrategy;
const userProfileManager = appID.UserProfileManager;
const UnauthorizedException = appID.UnauthorizedException;

module.exports = function(router, app){
	// io.on('connection', (socket) => {
	// 	socket.emit('message');
	// 	// When the client emits 'search history', this listens and executes
	// 	socket.on('search history', (keywords) => {
	// 		console.log("Received keywords!");

	// 		socket.emit('show history', {
	// 			results: history
	// 		});
	// 	});
	// });

	router.get('/search_history', passport.authenticate(WebAppStrategy.STRATEGY_NAME), function(req, res, next) {
	    res.render('search_history', {title: 'Watson Twitter Communication', page_name: 'search_history'});

	});
}