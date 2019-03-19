const passport = require('passport');
const appID = require("ibmcloud-appid");

const WebAppStrategy = appID.WebAppStrategy;
const userProfileManager = appID.UserProfileManager;
const UnauthorizedException = appID.UnauthorizedException;

module.exports = function(router, app){

	router.get('/search_history', passport.authenticate(WebAppStrategy.STRATEGY_NAME), function(req, res, next) {
	    res.render('search_history', {title: 'Watson Twitter Communication', page_name: 'search_history'});

	});
}