const passport = require('passport');
const appID = require("ibmcloud-appid");

const WebAppStrategy = appID.WebAppStrategy;
const userProfileManager = appID.UserProfileManager;
const UnauthorizedException = appID.UnauthorizedException;

module.exports = function(router, app){
	router.get('/settings', passport.authenticate(WebAppStrategy.STRATEGY_NAME), function(req, res, next) {
	    res.render('settings', {title: 'Watson Twitter Communication', page_name: 'settings', name: 'HSmith', loggedIn: true});

	});
}