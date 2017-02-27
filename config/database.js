var infra = require('./infraType');
var uri = require('mongodb-uri');

var mongodb = infra['soc-storage'].mongodb;

module.exports = {
    uri: uri.format(mongodb),
    options: {
        server: {
            socketOptions: {
                keepAlive: 300000,
                connectTimeoutMS: 30000
            }
        },
        replset: {
            connectWithNoPrimary: true,
            socketOptions: {
                keepAlive: 300000,
                connectTimeoutMS: 30000
            }
        },
        auto_reconnect: true
    }
};
