/**
 * Created by TBS on 12/02/2017.
 */

/*********************************************
 *              Modules import               *
 *********************************************/

let http = require('http');
let express = require('express');
let session = require('express-session');
let cors = require('cors');
let mongoose = require('mongoose');
let winston = require('winston');
let bodyParser = require('body-parser');
let cookieParser = require('cookie-parser');
let passport = require('passport');
let LocalStrategy = require('passport-local').Strategy;
let RememberMeStrategy = require('passport-remember-me').Strategy;

let debug = require('debug')('app');
let debug_w = require('debug')('worker');
let MongoStore = require('connect-mongo')(session);

let router = express.Router();

let initRouters = require('./app/routers');
let logger = require("./app/helpers/logger");

let config = require('./config');
let configDB = config.database;

let apiPort = config.infra['qwirk-api'].port;
let NotificationHandler = require('./app/controllers/Utils/notificationGroupHandler');
let MessageHandler = require('./app/controllers/Utils/messageHandler');


/*********************************************
 *              Db connection                *
 *********************************************/

let sessionStore = new MongoStore({
    url: configDB.uri,
    collection: 'sessions'
});

mongoose.connect(configDB.uri, configDB.options);

let conn = mongoose.connection;

conn.on('error', function onError(err){
    debug('Error with DB connection', err);
});

conn.once('open', function onOpen(){
    debug('Mongoose connected');
});

/************************************************
 *                   Passport                   *
 ************************************************/

require('./app/config/passport');

/* Fake, in-memory database of remember me tokens */

let tokens = {}

function consumeRememberMeToken(token, fn) {
    let uid = tokens[token];
    // invalidate the single-use token
    delete tokens[token];
    return fn(null, uid);
}

function saveRememberMeToken(token, uid, fn) {
    tokens[token] = uid;
    return fn();
}



// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    findById(id, function (err, user) {
        done(err, user);
    });
});

/************************************************
 *                    Express                   *
 ************************************************/

let app = express();

for (let route in initRouters) {
    initRouters[route](router);
}

let server = http.createServer(app);
let io = require('socket.io')(server);

app.use(cors());
logger.debug("Overriding 'Express' logger");
app.use(require('morgan')("default", { "stream": logger.stream }));
app.use(function setResponseHeader(req, res, next){
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    return next();
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(passport.initialize());

// let io = require('socket.io').listen(server);

// Quand un client se connecte, on le note dans la console
io.sockets.on('connection', function (socket) {
    console.log('Un client est connecté !');
});

app.use(router);

// error handlers
// Catch unauthorised errors
app.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        res.status(401);
        res.json({"message" : err.name + ": " + err.message});
    }
});

let notificationGroupHandler = new NotificationHandler(io);
notificationGroupHandler.init();

let messageHandler = new MessageHandler(io);
messageHandler.init();

server.listen(apiPort, function listening(){
    debug_w('Express server listening on port ' + apiPort);
});



module.exports = server;

