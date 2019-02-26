var express = require('express');
var router = express.Router();
var app = require('../app.js');
var bodyParser= require("body-parser");

router.get('/', function(req, res, next) {
    var names = [];
    if(!app.db) {
        console.log(names);
        res.render('index', {title: 'Watson Titter Communication',user: names});
        return;
    }
    app.db.list({ include_docs: true }, function(err, body) {
        if (!err) {
            body.rows.forEach(function(row) {
                if(row.doc.name)
                    names.push(row.doc.name);
            });
            console.log(names);
            res.render('index', {title: 'Watson Titter Communication', user: names});
        }
    });

});

router.post('/add_name', function (req, res, next)  {
    if(req.body == null) {
        console.log("Body is empty");
        res.render('index', {title: 'Watson Titter Communication'});
        return;
    }
    var userName = req.body.name;
    var doc = { "name" : userName };
    if(!app.db) {
        console.log("No database.");
        res.render('index', {title: 'Watson Titter Communication'});
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