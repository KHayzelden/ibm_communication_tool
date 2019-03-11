var express = require('express');
var router = express.Router();
var app = require('../app.js');
var bodyParser= require("body-parser");
require('./search')(router, app);
require('./search_history')(router, app);
require('./bookmarks')(router, app);
require('./account')(router, app);
require('./settings')(router, app);

router.get('/navbar', function(req, res, next) {
    res.render('navbar', {title: 'Watson Twitter Communication', name: 'HSmith', loggedIn: true});

});

router.get('/', function(req, res, next) {
    res.redirect('/search')

});

module.exports = router;