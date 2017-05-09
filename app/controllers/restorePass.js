/**
 * Created by jngue on 21/03/2017.
 */

let passport = require('passport');
let mongoose = require('mongoose');
let async = require('async');
let crypto = require('crypto');
let nodemailer = require('nodemailer');
let GoogleUrl = require( 'google-url' );

let User = mongoose.model('User');

let helper = require('./../helpers/helper');
let logger = require("./../helpers/logger");
let userController = require('./../controllers/index').user;

class restorePass {
    static forgot (req, res, next) {
        async.waterfall([
            function(done) {
                crypto.randomBytes(20, function(err, buf) {
                    let token = buf.toString('hex');
                    done(err, token);
                });
            },
            function(token, done) {
                if (helper.validateEmail(req.body.userIdentifier)) {
                    User.findOne({email: req.body.userIdentifier}, function (err, user) {
                        if (!user) {
                            res.status(404).json(err);
                            //req.flash('error', 'No account with that email address exists.');
                            return res.redirect('/forgot');
                        }

                        user.resetPasswordToken = token;
                        user.resetPasswordExpires = Date.now() + (3600000 * 12); // 12 hours

                        //userController.updateUser(user, done)

                        user.save(function (err) {
                            done(err, token, user);
                        });
                    });
                }
                else {
                    User.findOne({username: req.body.userIdentifier}, function (err, user) {
                        if (!user) {
                            res.status(404).json(err);
                            //req.flash('error', 'No account with that email address exists.');
                            return res.redirect('/forgot');
                        }
                        user.resetPasswordToken = token;
                        user.resetPasswordExpires = Date.now() + (3600000 * 12); // 12 hour
                        user.save(function (err) {
                            logger.debug(token);
                            done(err, token, user);
                        });
                    });
                }
            },

            function (token, user, done) {
                let googleUrl = new GoogleUrl( { key: 'AIzaSyAnA5qIoiO2yl32FTbMTcMnlt7BUjzrEKc' });
                let resetUrl = 'http://' + req.headers.host + '/reset/' + token;
                googleUrl.shorten( resetUrl, function( err, shortUrl ) {
                    done(err, token, user, shortUrl);
                });
            },

            function(token, user, shortUrl, done) {
                logger.debug('here', shortUrl);
                let smtpTransport = nodemailer.createTransport({
                    service: 'SendGrid',
                    auth: {
                        user: 'qwirk',
                        pass: 'Qwirk2017'
                    }
                });
                let mailOptions = {
                    to: user.email,
                    from: 'noreply@qwirk.com',
                    subject: 'Qwirk password Reset',
                    text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                    shortUrl + '\n\n' +
                    'If you did not request this, please ignore this email and your password will remain unchanged.\n'
                };
                logger.debug(mailOptions.text);
                smtpTransport.sendMail(mailOptions, function(err) {
                    //req.flash('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
                    done(err, 'done');
                    res.status(200).json(user);
                });
            }
        ], function(err) {
            logger.debug(err);
            if (err) return next(err);
        });
    }


    static changePasswordUser (req, res, next) {
        async.waterfall([
            function (done) {
                User.findOne({ resetPasswordToken: req.body.resetPasswordToken, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
                    if (!user) {
                        res.status(500).json(err);
                    }
                    user.setPassword(req.body.password);
                    user.resetPasswordExpires = undefined;
                    user.resetPasswordToken = undefined;

                    user.save(function (err) {
                        if(err) {
                        }
                        done(err, user);
                        res.status(200).json("Success");
                    });
                })
            },
            function(user, done) {
                let smtpTransport = nodemailer.createTransport({
                    service: 'SendGrid',
                    auth: {
                        user: 'qwirk',
                        pass: 'Qwirk2017'
                    }
                });
                let mailOptions = {
                    to: user.email,
                    from: 'noreply@qwirk.com',
                    subject: 'Your password has been changed',
                    text: 'Hello,\n\n' +
                    'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
                };
                smtpTransport.sendMail(mailOptions, function(err) {
                    done(err);
                });
            }
        ], function(err) {
            logger.debug(err);

            res.status(500).json(err);
            if (err) return next(err);
        });
    }

    static reset (req, res) {
        User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
            logger.debug(!user._id);
            if (!user._id) {
                return res.redirect('http://localhost:3000/login');
            }
            return res.redirect('http://localhost:3000/reset?reset_token=' + req.params.token);
        });
    }
}

module.exports = restorePass;