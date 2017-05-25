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
let contactRelation = require('./../../models').contactRelation;
let logger = require("./../../helpers/logger");
let helper = require('./../../helpers/helper');

class utils {
    static sendMail(req, callback){
        console.log("Test 6 : ", req.body.contactemail);
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
            to: req.body.contactemail,
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
            console.log("Mail sent : ", err);
            done(err);
        });

    }

    static generateToken(req) {
        console.log("generated token before exec", req.body.contactemail);
        return function (done) {
            crypto.randomBytes(20, function(err, buf) {
                let token = buf.toString('hex');
                console.log("New token from generateToken func is : ", token);
                done(err, req, token);
            })
        }
    }

    static insertContact(req, subscriber, callback){
        console.log('insertContact');
        console.log("Test 6 : ", req.body.contactemail);
        async.waterfall([
            this.insertFirstContact(req, subscriber),
            this.insertSecondContact,
            this.contactPropagation
        ], function (err, success) {
            if(err) return callback(err);
            console.log("Test 7 : ", success);
            callback(null, success)
        });
    }

    static insertFirstContact(req, subscriber){
        console.log('insertFirstContact');
        return function (done) {
            let newContact = new contactModel();
            if(subscriber){
                console.log('subscriber : ', subscriber.email);
                console.log('subscriber : ', subscriber.email);
                newContact.user = subscriber._id;
                newContact.contactEmail =  req.body.contactemail || subscriber.email;
                newContact.nickname = req.body.nickname || subscriber.username || '';
                newContact.isBlocked = false;
                newContact.relationId = null;
                console.log("insertFirstContact : ", newContact);
            }
            else {
                newContact.user = null;
                newContact.contactEmail =  req.body.contactemail;
                newContact.nickname = req.body.nickname || '';
                newContact.isBlocked = false;
                newContact.relationId = null;
                console.log("insertFirstContact : ", newContact);
            }
            newContact.save(function onSave(err, contact) {
                if (err) done(err);
                else {
                    console.log("TEST contact", contact);
                    done(null, req, contact);
                }
            });
        };
    }

    static insertSecondContact(req, firstCContact ,done){
        console.log('insertSecondContact');
        console.log('Inner userModel.findById : ', req.payload.email);
        let newContact = new contactModel();
        newContact.user = req.payload._id;
        newContact.contactEmail = req.payload.email;
        newContact.nickname = req.payload.username || '';
        newContact.isBlocked = false;
        newContact.relationId = null;
        console.log("insertSecondContact  : ", newContact);
        newContact.save(function OnSave(err, secondContact) {
            if(err) console.log('Here : ', err);
            else{
                console.log('Here 2 ', req.payload.email);
                done(null, firstCContact, secondContact);
            }
        });
    }

    static contactPropagation(firstCContact, secondContact, done) {
        console.log('insertSecondContact');
        console.log("secondContact.contactEmail; : " + secondContact.contactEmail);
        console.log("firstContact.contactEmail; : " + firstCContact.contactEmail);
        let relation = new contactRelation();
        relation.user = firstCContact._id;
        relation.userContact = secondContact._id;
        relation.isPending = true;
        relation.userEmail = secondContact.contactEmail;
        relation.userContactEmail = firstCContact.contactEmail;
        relation.token = '';
        relation.save(function OnSave(err, contactRelation) {
            if(err) console.log('Here : ', err);
            else{
                console.log('ContactRelation :  ' + contactRelation);
                contactModel.findByIdAndUpdate(firstCContact._id, { $set: { relationId: contactRelation._id }}, function (err, saveOk) {
                    if(err) done(err, saveOk);
                    console.log('firstCContact saveOk : ' + saveOk);
                });
                contactModel.findByIdAndUpdate(secondContact._id, { $set: { relationId: contactRelation._id }}, function (err, saveOk) {
                    if(err) done(err, saveOk);
                    console.log('secondCContact saveOk : ' + saveOk);
                });
                done(null, contactRelation);
            }
        });

    }
};

module.exports = utils;
