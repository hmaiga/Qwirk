/**
 * Created by TBS on 12/02/2017.
 */
var http = require('http');
var express = require('express');
var session = require('express-session');
var router = express.Router();
var cors = require('cors');
var mongoose = require('mongoose');
var winston = require('winston');
var debug = require('debug')('app');
var debug_w = require('debug')('worker');
var initRouters = require('./app/routers')
var bodyParser = require('body-parser');

var MongoStore = require('connect-mongo')(session);

var config = require('./config');
var configDB = config.database;

var apiPort = config.infra['qwirk-api'].port

var app = express();

var sessionStore = new MongoStore({
    url: configDB.uri,
    collection: 'sessions'
});

//app.user(bodyParser.json());
// after the code that uses bodyParser and other cool stuff
var originsWhitelist = [
    'http://localhost:8000',      //this is my front-end url for development

    'http://www.myproductionurl.com'
];
var corsOptions = {
    origin: function(origin, callback){
        var isWhitelisted = originsWhitelist.indexOf(origin) !== -1;
        callback(null, isWhitelisted);
    },
    credentials:true
}

mongoose.connect(configDB.uri, configDB.options);

var conn = mongoose.connection;

conn.on('error', function onError(err){
    debug('Error with DB connection', err);
});

conn.once('open', function onOpen(){
    debug('Mongoose connected');
});

initRouters.group(router);
initRouters.user(router);
initRouters.bot(router);
initRouters.message(router);
initRouters.messageStatus(router);
initRouters.moderator(router);
initRouters.setting(router);
initRouters.status(router);
initRouters.typeMessage(router);

var server = http.createServer(app);
app.use(cors(corsOptions));
app.use(function setResponseHeader(req, res, next){
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    return next();
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(router);



app.listen(apiPort, function listening(){
    debug_w('Express server listening on port ' + apiPort);
});



module.exports = server;

