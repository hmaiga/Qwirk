var infra = require('./infra');
var uri = require('mongodb-uri');

var mongodb = infra['qwirk-storage'].mongodb;

module.exports = {
    uri: uri.format(mongodb),
    options: {
        server: {
            socketOptions: {
                keepAlive: 300000,
                connectTimeoutMS: 30000
            }
        },
        auto_reconnect: true
    }
};
