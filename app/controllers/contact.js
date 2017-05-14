/**
 * Created by Housseini  Maiga on 4/15/2017.
 */
'use strict';

let async = require('async');
let q = require('q');

let userModel = require('./../models').user;
let contactModel = require('./../models').contact;
let utils = require('./../controllers/Utils/contactHelper');
let helper = require('./../helpers/helper');
let logger = require('./../helpers/logger');


class contactController {
    static getContacts(params, callback) {
        console.log("Test params ", params.payload._id);
        return contactModel.find({owner : params.payload._id}, function (err, contacts) {
            console.log("TEST contacts ", contacts);
            if(err) return callback(err);
            else{
                console.log("TEST contacts ", contacts);
                return callback(null, contacts);
            }
        })
    }

    static addContact(req, callback) {
        async.waterfall([
            this.findUser(req),
            this.contactHandler
        ],function (err, contact) {
            if(err) return callback(err);
            callback(null, contact);
        });
    }

    static findUser(req){
        console.log("TEST contacts addContacts ", req.body);
        return function(callback){
            userModel.findById(req.body.owner, function (err, user) {
                console.log("Test contact content user type: ", typeof user);
                console.log("Test contact content user: ", user);
                if(!user) return callback("user doesn't exist");
                callback(null, req);
            })
        }
    }

    static contactHandler(req, callback){
        console.log("test 1: ", req.body);
            if(helper.validateEmail(req.body.email)){
                console.log("test 2 => email valided: ", req.body.email);
                userModel.findOne({email : req.body.email}, function (err, subscriber) {
                    console.log("Test 3 subscriber Test: ", subscriber);
                    if(err) return callback(err);
                    console.log("Test 3-1 : ", !subscriber);
                    if(subscriber){
                        console.log("Test 4 : ", !subscriber);
                        contactModel.findOne({owner : req.body.owner, email : req.body.email}, function (err, relatedContact){
                            console.log("Test contact content 1: ", relatedContact);
                            console.log("Test contact type 1: ", !relatedContact);
                            if(err) return callback(err);
                            if(relatedContact)
                                return callback("Cannot add an existing contact, this one is already exists in your contact list");
                            else {
                                utils.insertContact(req, function (err, contact) {
                                    if(err) return callback(err);
                                    callback(null, contact);
                                });
                            }
                        })
                    }
                    else{
                        console.log("Test 5 : ", req.body.email);
                        contactModel.findOne({owner : req.body.owner, email : req.body.email}, function (err, relatedContact) {
                            if(err) return callback(err);
                            console.log("Test 5  relatedContact: ", relatedContact);
                            if(relatedContact && relatedContact.isPending == true)
                                return callback("Invitation for this contact is already sent, waiting for user reply");
                            else {
                                utils.sendMail(req, function (err, success) {
                                    console.log("Send mail test : ", success);
                                    if(err) return done(err);
                                    else {
                                        console.log("Test 8 : ", req.body);
                                        utils.insertContact(req, function (err, contact) {
                                            if(err) return callback(err);
                                            callback(null, contact);
                                        });
                                    }
                                });
                            }
                        });
                    }
                })
            }
            else {
                return callback("Contact email address is invalid, please retry with another one")
            }
    }

    static removeUserContact(req, callback) {
        console.log("1 DELETE Test /contact", req);
        contactModel.findOneAndRemove({owner : req.owner, email : req.email}, function (err, contact) {
            console.log("2 DELETE Test  /contact'", contact);
            if(err) return callback(err);
            if(!contact) return callback("Contact not found");
           else{
                return callback(null, contact);
           }
       })
    }

    static renameUserContact(req, callback) {
        console.log("Test 1");
        contactModel.findOneAndUpdate({owner : req.owner, email : req.email}, {nickname : req.nickname}, function (err, contact) {
            console.log("findOneAndUpdate test ", contact);
            console.log("callback : ", typeof callback);
            if(err) return callback(err);
            if(!contact) return callback('Cannot rename an invalid contact');
            else{
                console.log("Test else statement", contact);
                console.log("callback : ", typeof callback);
                    return  callback(null, contact);
            }
        })
    }

    static blockContact(req, callback) {
        console.log("Test 1");
        contactModel.findOneAndUpdate({owner : req.owner, email : req.email}, {isBlocked : req.isBlocked}, function (err, contact) {
            console.log("findOneAndUpdate test ", contact);
            if(err) return callback(err);
            if(!contact) return callback('Cannot block an invalid contact');
            if(contact.isPending) return callback("Cannot block contact before subscription");
            else{
                console.log("Test else statement", contact);
                return callback(null, contact);
            }
        } )
    }

}

module.exports = contactController;
