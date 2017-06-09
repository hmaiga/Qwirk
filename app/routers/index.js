/**
 * Created by TBS on 12/02/2017.
 */
let jwt = require('express-jwt');

let config = require('./../../config/');

let PARAM = config.secret;

let auth = jwt({
    secret: config.secret['PARAM'].secret,
    userProperty: 'payload'
});


module.exports = {
    group: require('./group'),
    user: require('./user'),
    bot: require('./bot'),
    message: require('./message'),
    messageStatus: require('./messageStatus'),
    moderator: require('./moderator'),
    setting: require('./setting'),
    status: require('./status'),
    typeMessage: require('./typeMessage'),
    linkUserGroup: require('./linkUserGroup')
}
