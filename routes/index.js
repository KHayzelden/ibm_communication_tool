var express = require('express');
var router = express.Router();
var app = require('../app.js');
var bodyParser= require("body-parser");
const flash = require("connect-flash");

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

    

    // var data = '{"searchRTest": "Laborum in proident eu ad laboris incididunt Lorem sit amet ipsum"}';

    // var json = JSON.parse(data);

    // searchResults.push(json.searchRTest);

    bookmarks1a.push('Bookmark 1');
    bookmarks1a.push('Bookmark 2');
    bookmarks1a.push('Bookmark 3');
    bookmarks1a.push('Bookmark 4');
    bookmarks1a.push('Bookmark 5');

    bookmarks2a.push('Bookmark 1');
    bookmarks2a.push('Bookmark 2');
    bookmarks2a.push('Bookmark 3');
    bookmarks2a.push('Bookmark 4');
    bookmarks2a.push('Bookmark 5');
    bookmarks2a.push('Bookmark 6');
    bookmarks2a.push('Bookmark 7');
    bookmarks2a.push('Bookmark 8');
    bookmarks2a.push('Bookmark 9');
    bookmarks2a.push('Bookmark 10');

    if(!app.db) {
        res.render('search', {title: 'Watson Twitter Communication', name: 'Test', results: searchResults, bookmarks1: bookmarks1a, bookmarks2: 
        bookmarks2a});
        return;
    }
});

router.get('/search_history', function(req, res, next) {
    res.render('search_history', {title: 'Watson Twitter Communication', name: 'Test'});

});

router.get('/account', function(req, res, next) {
    res.render('account', {title: 'Watson Twitter Communication', name: 'Test'});

});

router.get('/bookmarks', function(req, res, next) {
    res.render('bookmarks', {title: 'Watson Twitter Communication', name: 'Test'});

});

router.get('/settings', function(req, res, next) {
    res.render('settings', {title: 'Watson Twitter Communication', name: 'Test'});

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

router.get('/error', function(req, res) {
    let errorArray = req.flash('error');
    res.render("error",{title: 'Watson Twitter Communication', errorMessage: errorArray[0]});
});

module.exports = router;