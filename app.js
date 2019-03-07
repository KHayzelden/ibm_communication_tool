/*eslint-env node*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

// This application uses express as its web server
// for more info, see: http://expressjs.com
var exports = module.exports = {};
var express = require('express');
const session = require('express-session');
const passport = require('passport');
const WebAppStrategy = require("ibmcloud-appid").WebAppStrategy;
const CALLBACK_URL = "/ibm/cloud/appid/callback";

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

// create a new express server
var app = express();
var bodyParser = require('body-parser');
var path = require('path');

var cloudant, useDb;



// load local VCAP configuration  and service credentials
var vcapLocal;
try {
    vcapLocal = require('./vcap-local.json');
} catch (e) { }

const appEnvOpts = vcapLocal ? { vcap: vcapLocal} : {};

// get the app environment
const appEnv = cfenv.getAppEnv(appEnvOpts);
const isLocal = appEnv.isLocal;

const config = getLocalConfig();

// Load the Cloudant library.
var Cloudant = require('@cloudant/cloudant');

if (appEnv.services['cloudantNoSQLDB'] || appEnv.getService(/cloudant/)) {

    // Initialize database with credentials
    if (appEnv.services['cloudantNoSQLDB']) {
        // CF service named 'cloudantNoSQLDB'
        cloudant = Cloudant(appEnv.services['cloudantNoSQLDB'][0].credentials);
    } else {
        // user-provided service with 'cloudant' in its name
        cloudant = Cloudant(appEnv.getService(/cloudant/).credentials);
    }
} else if (process.env.CLOUDANT_URL){
    cloudant = Cloudant(process.env.CLOUDANT_URL);
}

if(cloudant != null) {
    //database name
    var dbName = 'watsoncommdb';

    cloudant.db.list(function(err, allDbs) {
        if(! (allDbs.indexOf(dbName) > -1)) {
            // Create a new "mydb" database.
            cloudant.db.create(dbName, function(err, data) {
                if(!err) //err if database doesn't already exists
                    console.log("Created database: " + dbName);
                else
                    console.log(err);

            });
        }
    });
    // Specify the database we are going to use (mydb)...
    exports.useDb = cloudant.db.use(dbName);
    // console.log(useDb);
}

app.enable('trust proxy');

app.use (function (req, res, next) {
    if (req.secure || process.env.BLUEMIX_REGION === undefined) {
        next();
    } else {
        console.log('redirecting to https');
        res.redirect('https://' + req.headers.host + req.url);
    }
});

// requiring routes
var index = require('./routes/index');

app.use(session({
    secret: "123456",
    resave: true,
    saveUninitialized: true
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Configure express application to use passportjs
app.use(passport.initialize());
app.use(passport.session());

// Configure passportjs with user serialization/deserialization. This is required
// for authenticated session persistence accross HTTP requests.
passport.serializeUser(function(user, cb) {
    cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
    cb(null, obj);
});

let webAppStrategy = new WebAppStrategy(config);
passport.use(webAppStrategy);

// Callback to finish the authorization process. Will retrieve access and identity tokens/
// from AppID service and redirect to either (in below order)
// 1. the original URL of the request that triggered authentication, as persisted in HTTP session under WebAppStrategy.ORIGINAL_URL key.
// 2. successRedirect as specified in passport.authenticate(name, {successRedirect: "...."}) invocation
// 3. application root ("/")
app.get(CALLBACK_URL, passport.authenticate(WebAppStrategy.STRATEGY_NAME));


app.get('/protected', passport.authenticate(WebAppStrategy.STRATEGY_NAME), function(req, res) {
    res.json(req.user);
});

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

// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});

function getLocalConfig() {
    if (!isLocal) {
        return {};
    }

    // load localdev configuration and service credentials
    var localdev;
    try {
        localdev = require('./localdev-config.json');
    } catch (e) { }
    let config = {
        tenantId: localdev["tenantId"],
        clientId: localdev["clientId"],
        secret: localdev["secret"],
        oauthServerUrl: localdev["oauthServerUrl"],
        redirectUri: appEnv.url + CALLBACK_URL
    };
    if (localdev.version) {
        config.version = localdev.version;
    }

    if (localdev.appidServiceEndpoint) {
        config.appidServiceEndpoint = localdev.appidServiceEndpoint;
    }
    return config;
}

// console.log(module.exports);

// window.addEventListener('load', e => {
//     if('serviceWorker' in navigator){
//         try{
//             navigator.serviceWorker.register('sw.js');
//             console.log('SW registered');
//         } catch(){
//             console.log('SW failed :(')
//         }
//     }
// });



// const apiKey = '40611f50472445186154e9a1b5901c5'
// async function updateNews(){
//     const res = await fetch(`https://newsapi.org/v2/everything?q=bitcoin&from=2019-02-06&sortBy=publishedAt&apiKey={$apiKey}`);
//     const json = await res.json();

// }

