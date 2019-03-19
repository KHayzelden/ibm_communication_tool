const passport = require('passport');
const appID = require("ibmcloud-appid");

const WebAppStrategy = appID.WebAppStrategy;
const userProfileManager = appID.UserProfileManager;
const UnauthorizedException = appID.UnauthorizedException;

module.exports = function(router, app){
	router.get('/help', passport.authenticate(WebAppStrategy.STRATEGY_NAME), function(req, res, next) {
	    res.render('help', {title: 'Watson Twitter Communication', page_name: 'help', name: 'HSmith', fname: 'Harry', sname: 'Smith', email: 'hsmith@gmail.com', loggedIn: true});
	});
};