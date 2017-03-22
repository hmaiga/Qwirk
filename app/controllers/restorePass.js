/**
 * Created by jngue on 21/03/2017.
 */

let passport = require('passport');
let mongoose = require('mongoose');
let async = require('async');
let crypto = require('crypto');
let nodemailer = require('nodemailer');

let User = mongoose.model('User');

let helper = require('./../helpers/helper');
let logger = require("./../helpers/logger");
let userController = require('./../controllers/index').user;

class restorePass {
    static forgot (req, res, next) {
        async.waterfall([
            function(done) {
                console.log('first');
                crypto.randomBytes(20, function(err, buf) {
                    var token = buf.toString('hex');
                    done(err, token);
                });
            },
            function(token, done) {
                if (helper.validateEmail(req.body.userIdentifier)) {
                    console.log('second');
                    User.findOne({email: req.body.userIdentifier}, function (err, user) {
                        if (!user) {
                            res.status(404).json(err);
                            //req.flash('error', 'No account with that email address exists.');
                            return res.redirect('/forgot');
                        }

                        user.resetPasswordToken = token;
                        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                        userController.updateUser(user, done)
/*
                        user.save(function (err) {
                            done(err, token, user);
                        });*/
                    });
                }
                else {
                    console.log('second-bis');
                    User.findOne({username: req.body.userIdentifier}, function (err, user) {
                        if (!user) {
                            res.status(404).json(err);
                            //req.flash('error', 'No account with that email address exists.');
                            return res.redirect('/forgot');
                        }
                        logger.debug(user.firstName);
                        user.resetPasswordToken = token;
                        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
                        console.log(user);
                        user.save(function (err) {
                            logger.debug(token);
                            done(err, token, user);
                        });
                    });
                }
            },

            function(token, user, done) {
                console.log('third');
                var smtpTransport = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: 'noreplyqwirk@gmail.com',
                        pass: 'Qwirk2017'
                    }
                });
                var mailOptions = {
                    to: user.email,
                    from: 'noreply@qwirk.com',
                    subject: 'Qwirk password Reset',
                    text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                    'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                    'If you did not request this, please ignore this email and your password will remain unchanged.\n'
                };
                smtpTransport.sendMail(mailOptions, function(err) {
                    res.status(200).json(user);
                    //req.flash('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
                    done(err, 'done');
                });
            }
        ], function(err) {
            logger.debug(err);
            if (err) return next(err);
            res.redirect('/forgot');
        });
    }


    checkIfUserExist (userIdentifier) {

    }

    static reset (req, res) {

    }
}

module.exports = restorePass;