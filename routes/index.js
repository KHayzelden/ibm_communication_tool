var express = require('express');
var router = express.Router();
var app = require('../app.js');
var bodyParser= require("body-parser");

router.get('/', function(req, res, next) {
    var names = [];
    if(!app.db) {
        console.log(names);
        res.render('index', {title: 'Watson Twitter Communication',user: names});
        return;
    }
    app.db.list({ include_docs: true }, function(err, body) {
        if (!err) {
            body.rows.forEach(function(row) {
                if(row.doc.name)
                    names.push(row.doc.name);
            });
            console.log(names);
            res.render('index', {title: 'Watson Twitter Communication', user: names});
        }
    });
});

router.get('/search', function(req, res, next) {
    var searchResults = [];
    var bookmarks1a = [];
    var bookmarks2a = [];

    var searchJson = [{"searchRTest": ["Result 1"]}, 
               {"searchRTest": ["Result 2"]}, 
               {"searchRTest": ["Result 3"]},
               {"searchRTest": ["Result 4"]},
               {"searchRTest": ["Result 5"]},
               {"searchRTest": ["Result 6"]},
               {"searchRTest": ["Result 7"]},
               {"searchRTest": ["Result 8"]},
               {"searchRTest": ["Result 9"]},
               {"searchRTest": ["Result 10"]}];

    for(var i = 0; i < searchJson.length; i++){
       var searchArray = searchJson[i].searchRTest;

       for(var j = 0; j < searchArray.length; j++){
        searchResults.push(searchArray[j]);
       
       }
    }

    var bookmarks1Json = [{"bookmarks1": ["Bookmark 1"]}, 
               {"bookmarks1": ["Bookmark 2"]}, 
               {"bookmarks1": ["Bookmark 3"]},
               {"bookmarks1": ["Bookmark 4"]},
               {"bookmarks1": ["Bookmark 5"]}];

    for(var i = 0; i < bookmarks1Json.length; i++){
       var books1Array = bookmarks1Json[i].bookmarks1;

       for(var j = 0; j < books1Array.length; j++){
        bookmarks1a.push(books1Array[j]);
       
       }
    }

    var bookmarks2Json = [{"bookmarks2": ["Bookmark 1"]}, 
               {"bookmarks2": ["Bookmark 2"]}, 
               {"bookmarks2": ["Bookmark 3"]},
               {"bookmarks2": ["Bookmark 4"]},
               {"bookmarks2": ["Bookmark 5"]},
               {"bookmarks2": ["Bookmark 6"]},
               {"bookmarks2": ["Bookmark 7"]},
               {"bookmarks2": ["Bookmark 8"]},
               {"bookmarks2": ["Bookmark 9"]},
               {"bookmarks2": ["Bookmark 10"]}];

    for(var i = 0; i < bookmarks2Json.length; i++){
       var books2Array = bookmarks2Json[i].bookmarks2;

       for(var j = 0; j < books2Array.length; j++){
        bookmarks2a.push(books2Array[j]);

       }
    }

    if(!app.db) {
        res.render('search', {title: 'Watson Twitter Communication', page_name: 'search', name: 'HSmith', results: searchResults, bookmarks1: bookmarks1a, bookmarks2: 
        bookmarks2a, loggedIn: true});
        return;
    }
});

router.get('/navbar', function(req, res, next) {
    res.render('navbar', {title: 'Watson Twitter Communication', name: 'HSmith', loggedIn: true});

});

router.get('/search_history', function(req, res, next) {
    res.render('search_history', {title: 'Watson Twitter Communication', page_name: 'search_history', name: 'HSmith', loggedIn: true});

});

router.get('/bookmarks', function(req, res, next) {
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

router.get('/account', function(req, res, next) {
    res.render('account', {title: 'Watson Twitter Communication', page_name: 'account', name: 'HSmith', fname: 'Harry', sname: 'Smith', email: 'hsmith@gmail.com', loggedIn: true});

});

router.get('/settings', function(req, res, next) {
    res.render('settings', {title: 'Watson Twitter Communication', page_name: 'settings', name: 'HSmith', loggedIn: true});

});

router.post('/add_name', function (req, res, next)  {
    if(req.body == null) {
        console.log("Body is empty");
        res.render('index', {title: 'Watson Twitter Communication'});
        return;
    }
    var userName = req.body.name;
    var doc = { "name" : userName };
    if(!app.db) {
        console.log("No database.");
        res.render('index', {title: 'Watson Twitter Communication'});
        return;
    }

    app.db.insert(doc, function(err, body, header) {
        if (err) {
            console.log('[mydb.insert] ', err.message);
            res.send("Error");
        }
        doc._id = body.id;
        res.redirect("/");
    });
});

module.exports = router;