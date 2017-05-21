/**
 * Created by Housseini  Maiga on 5/5/2017.
 */
'use strict';

let GoogleUrl = require( 'google-url' );
let crypto = require('crypto');
let async = require('async');
let nodemailer = require('nodemailer');
let userModel = require('./../../models').user;
let contactModel = require('./../../models').contact;
let logger = require("./../../helpers/logger");
let helper = require('./../../helpers/helper');

class utils {
    static sendMail(req, callback){
        console.log("Test 6 : ", req.body.email);
        async.waterfall([
            this.generateToken(req),
            this.generatedUrl,
            this.mailBuilder
        ], function (err, success) {
            if(err) return callback(err);
            console.log("Test 7 : ", success);
            callback(null, success)
        })
    }

    static generatedUrl(req, token, done) {
        let googleUrl = new GoogleUrl( { key: 'AIzaSyAnA5qIoiO2yl32FTbMTcMnlt7BUjzrEKc' });
        console.log("request hearder is : ", req.headers.host);
        console.log("New token is : ", token);
        let resetUrl = 'http://' + req.headers.host + '/contact/' + token;
        console.log("generated url is : ", resetUrl);
        googleUrl.shorten( resetUrl, function( err, shortUrl ) {
            done(err, req, shortUrl);
        });
    }

    static mailBuilder(req, shortUrl, done) {
        logger.debug('here is shortUrl', shortUrl);
        let smtpTransport = nodemailer.createTransport({
            service: 'SendGrid',
            auth: {
                user: 'qwirk',
                pass: 'Qwirk2017'
            }
        });
        let mailOptions = {
            to: req.body.email,
            from: 'noreply@qwirk.com',
            subject: 'New invitation from a Qwirk user',
            text: 'Invitation test.\n\n' +
            'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
            shortUrl + '\n\n' +
            'Regards.\n'
        };
        logger.debug(mailOptions.text);
        smtpTransport.sendMail(mailOptions, function(err) {
            //req.flash('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
            //console.log('Message %s sent: %s', info.messageId, info.response);
            console.log("Mail sent");
            done(err);
        });

    }

    static generateToken(req) {
        console.log("generated token before exec", req.body.email);
        return function (done) {
            crypto.randomBytes(20, function(err, buf) {
                let token = buf.toString('hex');
                console.log("New token from generateToken func is : ", token);
                done(err, req, token);
            })
        }
    }

    static insertContact(req, callback){
        let newContact = new contactModel();
        newContact.owner = req.body.owner;
        newContact.email = req.body.email;
        newContact.nickname = req.body.nickname.toLowerCase();
        newContact.isPending = req.body.isPending || true;
        newContact.isSentOne = req.body.isSentOne || false;
        newContact.contact = req.body.concat || null;
        newContact.isBlocked = req.body.isBlocked || false;
        console.log("insertContact func : ", newContact);
        return newContact.save(function onSave(err, contact) {
            if (err) callback(err);
            else {
                console.log("TEST contact", contact);
                return callback(null, contact);
            }
        })
    }
};

module.exports = utils;
