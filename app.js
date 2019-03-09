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
const appID = require("ibmcloud-appid");


const helmet = require("helmet");
const express_enforces_ssl = require("express-enforces-ssl");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");

const WebAppStrategy = appID.WebAppStrategy;
const userProfileManager = appID.UserProfileManager;
const UnauthorizedException = appID.UnauthorizedException;

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

// create a new express server
var app = express();
var bodyParser = require('body-parser');
var path = require('path');

const CALLBACK_URL = "/ibm/cloud/appid/callback";
const LOGIN_URL = "/ibm/bluemix/appid/login";

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
configureSecurity();
app.use(flash());

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

app.use(function(req, res, next){
    res.locals.title = 'Watson Twitter Communication';
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.errors = req.flash('error');
    next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Configure express application to use passportjs
app.use(passport.initialize());
app.use(passport.session());

let webAppStrategy = new WebAppStrategy(config);
passport.use(webAppStrategy);

// Initialize the user attribute Manager
userProfileManager.init(config);

// Configure passportjs with user serialization/deserialization. This is required
// for authenticated session persistence accross HTTP requests.
passport.serializeUser(function(user, cb) {
    cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
    cb(null, obj);
});

// Explicit login endpoint. Will always redirect browser to login widget due to {forceLogin: true}.
// If forceLogin is set to false redirect to login widget will not occur of already authenticated users.
app.get(LOGIN_URL, passport.authenticate(WebAppStrategy.STRATEGY_NAME, {
    successRedirect: "/search"
}));

function storeRefreshTokenInCookie(req, res, next) {
    if (req.session[WebAppStrategy.AUTH_CONTEXT] && req.session[WebAppStrategy.AUTH_CONTEXT].refreshToken) {
        const refreshToken = req.session[WebAppStrategy.AUTH_CONTEXT].refreshToken;
        /* An example of storing user's refresh-token in a cookie with expiration of a month */
        res.cookie('refreshToken', refreshToken, {maxAge: 1000 * 60 * 60 * 24 * 30 /* 30 days */});
    }
    next();
}

function isLoggedIn(req) {
    return req.session[WebAppStrategy.AUTH_CONTEXT];
}

// Callback to finish the authorization process. Will retrieve access and identity tokens/
// from AppID service and redirect to either (in below order)
// 1. the original URL of the request that triggered authentication, as persisted in HTTP session under WebAppStrategy.ORIGINAL_URL key.
// 2. successRedirect as specified in passport.authenticate(name, {successRedirect: "...."}) invocation
// 3. application root ("/")
app.get(CALLBACK_URL, passport.authenticate(WebAppStrategy.STRATEGY_NAME));

// app.get('/protected', passport.authenticate(WebAppStrategy.STRATEGY_NAME), function(req, res) {
//     console.log("profile");
//     res.setHeader('Content-Type', 'application/json');
//     res.json(req.user);
// });

// Protected area. If current user is not authenticated - redirect to the login widget will be returned.
// In case user is authenticated - a page with current user information will be returned.
app.get("/protected", function tryToRefreshTokensIfNotLoggedIn(req, res, next) {
    if (isLoggedIn(req)) {
        return next();
    }

    webAppStrategy.refreshTokens(req, req.cookies.refreshToken).finally(function() {
        next();
    });
}, passport.authenticate(WebAppStrategy.STRATEGY_NAME), storeRefreshTokenInCookie, function (req, res, next) {
    var accessToken = req.session[WebAppStrategy.AUTH_CONTEXT].accessToken;
    console.log(accessToken);
    var isGuest = req.user.amr[0] === "appid_anon";
    var isCD = req.user.amr[0] === "cloud_directory";
    var preference = {font: "10", view: "complex"};
    var firstLogin;
    // get the attributes for the current user:
    userProfileManager.getAllAttributes(accessToken).then(function (attributes) {
        var toggledItem = req.query.foodItem;
        preference = attributes.preference ? JSON.parse(attributes.preference) : [];
        firstLogin = !isGuest && !attributes.points;
        if (!toggledItem) {
            return;
        }
        // var selectedItemIndex = preference.indexOf(toggledItem);
        // if (selectedItemIndex >= 0) {
        //     preference.splice(selectedItemIndex, 1);
        // } else {
        //     preference.push(toggledItem);
        // }
        // update the user's selection
        return userProfileManager.setAttribute(accessToken, "preference", JSON.stringify(preference));
    }).then(function () {
        renderProfile(req, res, preference, isGuest, isCD, firstLogin);
    }).catch(function (e) {
        next(e);
    });
});

// Protected area. If current user is not authenticated - an anonymous login process will trigger.
// In case user is authenticated - a page with current user information will be returned.
app.get("/anon_login", passport.authenticate(WebAppStrategy.STRATEGY_NAME, {allowAnonymousLogin: true, successRedirect : '/protected', forceLogin: true}));

// Protected area. If current user is not authenticated - redirect to the login widget will be returned.
// In case user is authenticated - a page with current user information will be returned.
app.get("/login", passport.authenticate(WebAppStrategy.STRATEGY_NAME, {successRedirect : '/search'}));

app.get("/logout", function(req, res, next) {
    WebAppStrategy.logout(req);
    // If you chose to store your refresh-token, don't forgot to clear it also in logout:
    res.clearCookie("refreshToken");
    res.redirect("/");
});

app.get("/token", function(req, res){
    //return the token data
    res.setHeader('Content-Type', 'application/json');
    res.send({tokens: (JSON.stringify(req.session[WebAppStrategy.AUTH_CONTEXT]))});
});

app.get("/userInfo", passport.authenticate(WebAppStrategy.STRATEGY_NAME), function(req, res) {
    //return the user info data
    userProfileManager.getUserInfo(req.session[WebAppStrategy.AUTH_CONTEXT].accessToken).then(function (userInfo) {
        res.setHeader('Content-Type', 'application/json');
        res.send(userInfo);
    }).catch(function() {
        res.setHeader('Content-Type', 'application/json');
        res.send({infoError: 'infoError'});
    })
});

app.get("/change_password", passport.authenticate(WebAppStrategy.STRATEGY_NAME, {
    successRedirect: '/protected',
    show: WebAppStrategy.CHANGE_PASSWORD
}));

app.get("/change_details", passport.authenticate(WebAppStrategy.STRATEGY_NAME, {
    successRedirect: '/protected',
    show: WebAppStrategy.CHANGE_DETAILS
}));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);


// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});

function renderProfile(req, res, preferences, isGuest, isCD, firstLogin) {
    //return the protected page with user info
    var hintText;
    if (isGuest) {
        hintText = "Guest User";
    } else {
        if (firstLogin) {
            hintText = "First Login";
        } else {
            hintText = "Returning User";
        }
    }
    var email = req.user.email;
    if(req.user.email !== undefined && req.user.email.indexOf('@') > -1)
        email = req.user.email.substr(0,req.user.email.indexOf('@'));
    var renderOptions = {
        name: req.user.name || email || "Guest",
        // picture: req.user.picture || "fa profile",
        preferences: JSON.stringify(preferences),
        topHintText: isGuest ? "Login to get access to all features" : "",
        topHintClickAction : isGuest ? ' window.location.href = "/login";' : ";",
        hintText,
        isGuest,
        isCD
    };

    if (firstLogin) {
        userProfileManager.setAttribute(req.session[WebAppStrategy.AUTH_CONTEXT].accessToken, "points", "150").then(function (attributes) {
            res.send(renderOptions);
        });
    } else {
        res.send(renderOptions);
    }
}
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

function configureSecurity() {
    app.use(helmet());
    app.use(cookieParser());
    app.use(helmet.noCache());
    app.enable("trust proxy");
    if (!isLocal) {
        app.use(express_enforces_ssl());
    }
}
