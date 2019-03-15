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
var server = require('http').createServer(app);
global.io = require('socket.io').listen(server);

var bodyParser = require('body-parser');
var path = require('path');
const CALLBACK_URL = "/ibm/bluemix/appid/callback";
const LOGIN_URL = "/ibm/bluemix/appid/login";

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


app.use(function(req, res, next){
    res.locals.title = 'Watson Twitter Communication';
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.errors = req.flash('error');
    next();
});
// Explicit login endpoint. Will always redirect browser to login widget due to {forceLogin: true}.
// If forceLogin is set to false redirect to login widget will not occur of already authenticated users.
app.get(LOGIN_URL, passport.authenticate(WebAppStrategy.STRATEGY_NAME, {
    successRedirect: "/search"
}));


exports.storeRefreshTokenInCookie =  function(req, res, next) {
    if (req.session[WebAppStrategy.AUTH_CONTEXT] && req.session[WebAppStrategy.AUTH_CONTEXT].refreshToken) {
        const refreshToken = req.session[WebAppStrategy.AUTH_CONTEXT].refreshToken;
        /* storing user's refresh-token in a cookie with expiration of a year */
        res.cookie('refreshToken', refreshToken, {maxAge: 1000 * 60 * 60 * 24 * 365 /* 365 days */});
    }
    next();
};

exports.isLoggedIn = function(req) {
    return req.session[WebAppStrategy.AUTH_CONTEXT];
};

app.get('/', function(req, res, next) {
    if (!exports.isLoggedIn(req)) {
        webAppStrategy.refreshTokens(req, req.cookies.refreshToken).then(function() {
            res.redirect('/search');
        }).catch(function() {
            next();
        })
    } else {
        res.redirect('/search');
    }
}, function(req,res,next) {
    res.render('index', {title: 'Watson Twitter Communication', page_name: 'search'})
});

// Callback to finish the authorization process. Will retrieve access and identity tokens/
// from AppID service and redirect to either (in below order)
// 1. the original URL of the request that triggered authentication, as persisted in HTTP session under WebAppStrategy.ORIGINAL_URL key.
// 2. successRedirect as specified in passport.authenticate(name, {successRedirect: "...."}) invocation
// 3. application root ("/")
app.get(CALLBACK_URL, passport.authenticate(WebAppStrategy.STRATEGY_NAME));

app.get('/search', function tryToRefreshTokensIfNotLoggedIn(req, res, next) {
    if (exports.isLoggedIn(req)) {
        res.locals.currentUser = req.user;
        return next();
    }
    webAppStrategy.refreshTokens(req, req.cookies.refreshToken).finally(function() {
        next();
    });

}, passport.authenticate(WebAppStrategy.STRATEGY_NAME), exports.storeRefreshTokenInCookie, function (req, res, next) {
    var accessToken = req.session[WebAppStrategy.AUTH_CONTEXT].accessToken;
    res.locals.currentUser = req.user;
    var isGuest = req.user.amr[0] === "appid_anon";
    var isCD = req.user.amr[0] === "cloud_directory";
    var firstLogin;
    // get the attributes for the current user:
    userProfileManager.getAllAttributes(accessToken).then(function (attributes) {
        firstLogin = !isGuest && !attributes.returning;
    }).then(function () {
        var dbName = '';

        if (isCD) {
            //database name
            var name = req.user.email.replace('@','');
            dbName = name.replace(/\./g,'');
            if(cloudant != null) {
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
            }
        } else {
            dbName = "guests";
            if(cloudant != null) {
                cloudant.db.list(function(err, allDbs) {
                    if(! (allDbs.indexOf("guests") > -1)) {
                        // Create a new "mydb" database.
                        cloudant.db.create(dbName, function(err, data) {
                            if(!err) //err if database doesn't already exists
                                console.log("Created database: " + guests);
                            else
                                console.log(err);
                        });
                    }
                });
            }
        }

        // }
        var renderOptions = {
            title: 'Watson Twitter Communication',
            page_name: 'search',
            dbName: dbName,
            isGuest,
            firstLogin,
            isCD
        };
        if (firstLogin) {
            userProfileManager.setAttribute(req.session[WebAppStrategy.AUTH_CONTEXT].accessToken, "returning", "true").then(function (attributes) {
                res.render('search', renderOptions);
            });
        } else {
            res.render('search', renderOptions);
        }
    }).catch(function (e) {
        next(e);
    });
});
// Protected area. If current user is not authenticated - an anonymous login process will trigger.
// In case user is authenticated - a page with current user information will be returned.
app.get("/guest_login", passport.authenticate(WebAppStrategy.STRATEGY_NAME, {allowAnonymousLogin: true, successRedirect : '/search', forceLogin: true}));

// Protected area. If current user is not authenticated - redirect to the login widget will be returned.
// In case user is authenticated - a page with current user information will be returned.
app.get("/login", passport.authenticate(WebAppStrategy.STRATEGY_NAME, {successRedirect : '/search'}));

app.get("/logout", function(req, res) {
    WebAppStrategy.logout(req);
    // If you chose to store your refresh-token, don't forgot to clear it also in logout:
    res.clearCookie("refreshToken");
    res.redirect("/");
});

app.get("/guest_logout", function(req, res) {
    WebAppStrategy.logout(req);
    // If you chose to store your refresh-token, don't forgot to clear it also in logout:
    res.clearCookie("refreshToken");
    res.redirect("/");
});

app.get("/guest_register", function(req, res) {
    WebAppStrategy.logout(req);
    // If you chose to store your refresh-token, don't forgot to clear it also in logout:
    res.clearCookie("refreshToken");
    res.redirect("/register");
});
app.get("/guest_signin", function(req, res) {
    WebAppStrategy.logout(req);
    // If you chose to store your refresh-token, don't forgot to clear it also in logout:
    res.clearCookie("refreshToken");
    res.redirect("/login");
});

app.get("/register", passport.authenticate(WebAppStrategy.STRATEGY_NAME, {successRedirect: "/login", show: WebAppStrategy.SIGN_UP}));

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
    successRedirect: '/search',
    show: WebAppStrategy.CHANGE_PASSWORD
}));

app.get("/change_details", passport.authenticate(WebAppStrategy.STRATEGY_NAME, {
    successRedirect: '/search',
    show: WebAppStrategy.CHANGE_DETAILS
}));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
// app.use('/search', search);


// start server on the specified port and binding host
server.listen(appEnv.port, '0.0.0.0', function() {
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

function configureSecurity() {
    app.use(helmet());
    app.use(cookieParser());
    app.use(helmet.noCache());
    app.enable("trust proxy");
    if (!isLocal) {
        app.use(express_enforces_ssl());
    }
}
module.exports = app;

