const passport = require('passport');
const appID = require("ibmcloud-appid");

const WebAppStrategy = appID.WebAppStrategy;
const userProfileManager = appID.UserProfileManager;
const UnauthorizedException = appID.UnauthorizedException;

module.exports = function(router, app){
	router.get('/bookmarks', passport.authenticate(WebAppStrategy.STRATEGY_NAME), function(req, res, next) {
	
	    if(!app.db) {
	        res.render('bookmarks', {title: 'Watson Twitter Communication', page_name: 'bookmarks', name: 'HSmith', bookmarkedSearches: searched, bookmarkedSentences: sentences, loggedIn: true});
	        return;
	    }

	});
}