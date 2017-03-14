/**
 * Created by jngue on 14/03/2017.
 */

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');

let helper = require('./../helpers/helper');

var User = mongoose.model('User');

passport.use(new LocalStrategy({
        usernameField: 'userIdentifier'
    },
    function(userIdentifier, password, done) {
        if (helper.validateEmail(userIdentifier)) {
            User.findOne({email: userIdentifier}, function (err, user) {
                if (err) {
                    return done(err);
                }
                // Return if user not found in database
                if (!user) {
                    return done(null, false, {
                        message: 'User not found'
                    });
                }
                // Return if password is wrong
                if (!user.validPassword(password)) {
                    return done(null, false, {
                        message: 'Password is wrong'
                    });
                }
                // If credentials are correct, return the user object
                return done(null, user);
            });
        } else {
            User.findOne({username: userIdentifier}, function (err, user) {
                if (err) {
                    return done(err);
                }
                // Return if user not found in database
                if (!user) {
                    return done(null, false, {
                        message: 'User not found'
                    });
                }
                // Return if password is wrong
                if (!user.validPassword(password)) {
                    return done(null, false, {
                        message: 'Password is wrong'
                    });
                }
                // If credentials are correct, return the user object
                return done(null, user);
            });
        }
    }
));
