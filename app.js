/*eslint-env node*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require('express');

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

// create a new express server
var app = express();
var bodyParser = require('body-parser');
var path = require('path');

// requiring routes
var index = require('./routes/index');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);

app.use(function(req, res, next){
    res.locals.title = 'Watson Twitter Communication';
    next();
});

var cloudant, useDb;

// load local VCAP configuration  and service credentials
var vcapLocal;
try {
    vcapLocal = require('./vcap-local.json');
    console.log("Loaded local VCAP", JSON.stringify(vcapLocal));
} catch (e) { }

const appEnvOpts = vcapLocal ? { vcap: vcapLocal} : {};

// get the app environment
const appEnv = cfenv.getAppEnv(appEnvOpts);


// Load the Cloudant library.
var Cloudant = require('@cloudant/cloudant');

if (appEnv.services['cloudantNoSQLDB'] || appEnv.getService(/cloudant/)) {
    console.log('add cloudant');

    // Initialize database with credentials
    if (appEnv.services['cloudantNoSQLDB']) {
        // CF service named 'cloudantNoSQLDB'

        cloudant = Cloudant(appEnv.services['cloudantNoSQLDB'][0].credentials);
        console.log(JSON.stringify(cloudant));
    } else {
        // user-provided service with 'cloudant' in its name
        cloudant = Cloudant(appEnv.getService(/cloudant/).credentials);
    }
} else if (process.env.CLOUDANT_URL){
    cloudant = Cloudant(process.env.CLOUDANT_URL);
}
if(cloudant != null) {
    //database name
    var dbName = 'WatsonCommD';
    console.log('yes',JSON.stringify(cloudant));

    // Create a new "mydb" database.
    cloudant.db.create(dbName, function(err, data) {
        if(!err) //err if database doesn't already exists
            console.log("Created database: " + dbName);
    });

    // Specify the database we are going to use (mydb)...
    useDb = cloudant.db.use(dbName);
}

// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});

module.exports = {
    db: useDb
};