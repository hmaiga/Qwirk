/**
 * Created by Housseini  Maiga on 4/15/2017.
 */
'use strict';

let async = require('async');

let userModel = require('./../models').user;
let contactModel = require('./../models').contact;
let utils = require('./../controllers/Utils/contact');
let helper = require('./../helpers/helper');

class contactController {
    static getContacts(params, callback) {
        console.log("Test params ", params.user_id);
        return contactModel.find({owner : params.user_id}, function (err, contacts) {
            console.log("TEST contacts ", contacts);
            if(err) return callback(err);
            else{
                console.log("TEST contacts ", contacts);
                return callback(null, contacts)
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

    static contactHandler(req, callback){
        console.log("test 1: ", req.body);
            console.log("test 2: ", req.body);
            if(helper.validateEmail(req.body.email)){
                console.log("test 3 => email valided: ", req.body.email);
                userModel.findOne({email : req.body.email}, function (err, subscriber) {
                    console.log("Test 3 subscriber Test: ", subscriber);
                    if(err) return callback(err);
                    console.log("Test 3-1 : ", !subscriber);
                    if(subscriber){
                        console.log("Test 4 : ", !subscriber);
                        contactModel.findOne({owner : req.body.user, email : req.body.email}, function (err, relatedContact){
                            console.log("Test contact content 1: ", relatedContact);
                            console.log("Test contact type 1: ", typeof relatedContact);
                            if(err) return callback(err);
                            if(typeof relatedContact !== "undefined" &&  relatedContact !== null)
                                return callback("Cannot add an existing contact, this one is already exists in your contact list");
                            else {
                                // this.insertContact(req, function (err, contact) {
                                //     if(err) return callback(err);
                                //     callback(err, contact);
                                // });
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
                        })
                    }
                    else{
                        console.log("Test 5 : ", req.body.email);
                        utils.sendMail(req, function (err, success) {
                            console.log("Send mail test : ", success);
                            if(err) return done(err);
                            else {
                                console.log("Test 8 : ", req.body);
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
                                });
                                // this.insertContact(req, function (err, contact) {
                                //     if(err) return done(err);
                                //     console.log("insertContact done!", contact);
                                //     done(null, req, contact);
                                // });
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
        contactModel.findOneAndRemove({user : req.user, contact : req.contact}, function (err, contact) {
            console.log("2 DELETE Test  /contacts'", contact);
            if(err) return callback(err);
            if(!contact) return callback("Contact not found");
           else{
                return callback(null, contact);
           }
       })
    }

    static renameUserContact(req, callback) {
        console.log("Test 1");
        contactModel.findOneAndUpdate({user : req.user, contact : req.contact}, {nickName : req.nickname}, function (err, contact) {
            console.log("findOneAndUpdate test ", contact);
            console.log("callback : ", typeof callback);
            if(err) return callback(err);
            //if(!userContact) return callback('User not found');
            else{
                console.log("Test else statement", contact);
                console.log("callback : ", typeof callback);
                    return  callback(null, contact);
            }
        })
    }

    static blockContact(req, callback) {
        console.log("Test 1");
        contactModel.findOneAndUpdate({user : req.user, contact : req.contact}, {isBlocked : req.isBlocked}, function (err, contact) {
            console.log("findOneAndUpdate test ", contact);
            if(err) return callback(err);
            //if(!userContact) return callback('User not found');
            else{
                console.log("Test else statement", contact);
                return callback(null, contact);
            }
        } )
    }


}

module.exports = contactController;
