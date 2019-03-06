var express = require('express');
var router = express.Router();
var app = require('../app');
var bodyParser= require("body-parser");

router.get('/', function(req, res, next) {
    var names = [];
    if(!app.useDb) {
        res.render('index', {title: 'Watson Titter Communication',users: names});
        return;
    }
    app.useDb.list({ include_docs: true }, function(err, body) {
        if (!err) {
            console.log(body);
            body.rows.forEach(function(row) {
                console.log(row.doc);
                if(row.doc.name)
                    names.push(row.doc.name);
            });
            res.render('index', {title: 'Watson Titter Communication', users: names});
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
    var users = { "name" : userName };
    if(!app.useDb) {
        res.render('index', {title: 'Watson Titter Communication'});
        return;
    }

    app.useDb.insert(users, function(err, body, header) {
        if (err) {
            console.log('[watsoncommdb.insert] ', err.message);
            res.send("Error");
        }
        users._id = body.id;
        res.redirect("/");
    });
});

module.exports = router;