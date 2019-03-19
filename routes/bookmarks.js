const passport = require('passport');
const appID = require("ibmcloud-appid");

const WebAppStrategy = appID.WebAppStrategy;
const userProfileManager = appID.UserProfileManager;
const UnauthorizedException = appID.UnauthorizedException;

module.exports = function(router, app){
	router.get('/bookmarks', passport.authenticate(WebAppStrategy.STRATEGY_NAME), function(req, res, next) {
	    var searched = [];
	    var sentences = [];

	    var searchesSaved = [{"searches": ["Bookmarked Search 1"]}, 
	               {"searches": ["Bookmarked Search 2"]}, 
	               {"searches": ["Bookmarked Search 3"]},
	               {"searches": ["Bookmarked Search 4"]},
	               {"searches": ["Bookmarked Search 5"]}];

	    for(var i = 0; i < searchesSaved.length; i++){
	       var savedSearches = searchesSaved[i].searches;

	       for(var j = 0; j < savedSearches.length; j++){
	        searched.push(savedSearches[j]);
	       
	       }
	    }

	    var sentencesSaved = [{"sentence": ["Bookmarked Sentence 1"]}, 
	               {"sentence": ["Bookmarked Sentence 2"]}, 
	               {"sentence": ["Bookmarked Sentence 3"]},
	               {"sentence": ["Bookmarked Sentence 4"]},
	               {"sentence": ["Bookmarked Sentence 5"]},
	               {"sentence": ["Bookmarked Sentence 6"]},
	               {"sentence": ["Bookmarked Sentence 7"]},
	               {"sentence": ["Bookmarked Sentence 8"]},
	               {"sentence": ["Bookmarked Sentence 9"]},
	               {"sentence": ["Bookmarked Sentence 10"]}];

	    for(var i = 0; i < sentencesSaved.length; i++){
	       var savedSentences = sentencesSaved[i].sentence;

	       for(var j = 0; j < savedSentences.length; j++){
	        sentences.push(savedSentences[j]);
	       
	       }
	    }

	    if(!app.db) {
	        res.render('bookmarks', {title: 'Watson Twitter Communication', page_name: 'bookmarks', name: 'HSmith', bookmarkedSearches: searched, bookmarkedSentences: sentences, loggedIn: true});
	        return;
	    }

	});
}