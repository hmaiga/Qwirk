/**
 * Created by Housseini  Maiga on 4/15/2017.
 */
'use strict';

let async = require('async');
let q = require('q');

let userModel = require('./../models').user;
let Contact = require('./../models').contact;
let ContactRelation = require('./../models').contactRelation;
let util = require('./../controllers/Utils/contactHandler');
let helper = require('./../helpers/helper');
let logger = require('./../helpers/logger');


class contactController {
    static getContacts(params, callback) {
        console.log("Test params ", params.payload._id);
        return Contact.find({$or:[ {user : params.payload._id}, {contactEmail : params.payload._id} ]}, function (err, contacts) {
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
            userModel.findById(req.payload._id, function (err, user) {
                console.log("Test contact content user type: ", typeof user);
                console.log("Test contact content user: ", user);
                if(!user) return callback("user doesn't exist");
                callback(null, req);
            })
        }
    }

    static contactHandler(req, callback){
        console.log("test 1: ", req.payload.email);
            if(helper.validateEmail(req.body.contactemail)){
                console.log("test 2 => email valided: ", req.body.contactemail);
                //Check if contact already exist in data base
                userModel.findOne({email : req.body.contactemail}, function (err, subscriber) {
                    console.log("Test 3 subscriber Test: ", subscriber);
                    if(err) return callback(err);
                    console.log("Test 3-1 : ", !subscriber);
                    if(subscriber){
                        Contact.findOne(
                            {$or:[
                                {$and:[ {user : req.payload._id}, {contactEmail : req.body.contactemail} ]},
                                {$and:[ {user : subscriber._id}, {contactEmail : req.payload.email} ]}
                            ]},
                            function (err, relatedContact){
                            console.log("Test contact content 1: ", relatedContact);
                            console.log("Test contact type 1: ", !relatedContact);
                            if(err) return callback(err);
                            if(relatedContact)
                                return callback("Cannot add an existing contact, this one is already exists in your contact list");
                            else {
                                console.log('insertContact  1 : '),
                                util.insertContact(req, subscriber, function (err, contact) {
                                    if(err) return callback(err);
                                    console.log('insertContact  1  ok : ');
                                    callback(null, contact);
                                });
                            }
                        })
                    }
                    else{
                        console.log("Test 5 : ", req.body.contactemail);
                        Contact.findOne({$and:[ {user : req.payload._id}, {contactEmail : req.body.contactemail} ]}, function (err, relatedContact){
                            if(err) return callback(err);
                            console.log("Test 5  relatedContact: ", relatedContact);
                            if(relatedContact)
                                return callback("Invitation for this contact is already sent, waiting for user reply");
                            else {
                                util.sendMail(req, function (err, success) {
                                    console.log("Send mail success : ", success);
                                    console.log("Send mail err : ", err ? 'erreur' : 'pas derreur' );
                                    if(err) return callback(err);
                                    else {
                                        //console.log("Test 8 : ", req.body);
                                        console.log('insertContact  2 : ');
                                        util.insertContact(req, null, function (err, contact) {
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
        async.waterfall([
            function (done) {
                Contact.find({
                    $or: [
                        {$and : [{user : req.payload._id}, {contactEmail : req.body.contactemail}]},
                        {$and : [{user : req.body.contactUserId}, {contactEmail : req.payload.email}]},
                    ]
                }, function (err, contacts) {
                    console.log("2 DELETE Test  contact'", contacts);
                    if(err) return callback(err);
                    if(!contacts) return callback("Contact not found");
                    else {
                        let listToRemove = [];
                        for(var contact in contacts) {
                            //console.log('KEY content: ', contacts[contact]);
                            let ctt = contacts[contact];
                            for(var key in ctt) {
                                // console.log('Index content : ', key === '_id' ? ctt[key] : null;);
                                if (key === '_id') {
                                    console.log('Index : ' +  key + ' and content is : ' + ctt[key]);
                                    listToRemove.push(ctt[key]);
                                }
                            }
                        }
                        console.log('listToRemove : ', listToRemove);
                        done(err, listToRemove);
                    }
                })
            },
            function (listToRemove, done) {
                Contact.remove({_id : {$in : listToRemove}}, function (err, success) {
                    if(err) done(err);
                    console.log('Contact > Remove success : ', success.result);
                    return done(err, listToRemove);
                });
            },
            function (listToRemove, done) {
                ContactRelation.remove( {$or: [{user : {$in : listToRemove}}, {userContact : {$in : listToRemove}}]}, function (err, success) {
                    if(err) done(err);
                    console.log('ContactRelation > Remove success : ', success.result);
                    return done(null, success);
                });
            }
        ], function (err, success) {
            if(err) {
                console.log(err.json());
                res.status(500).json(err)
            }
            callback(null, success);
        });
    }

    static renameUserContact(req, callback) {
        console.log("Test params ", req.payload._id);
        Contact.findOneAndUpdate({user : req.payload._id, contactEmail : req.body.contactemail}, {nickname : req.body.nickname}, function (err, contact) {
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
        Contact.findOneAndUpdate({user : req.payload._id, contactEmail : req.body.contactemail}, {isBlocked : req.body.isBlocked}, function (err, contact) {
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
