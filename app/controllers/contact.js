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
        // console.log("Test params ", params.payload._id);
        // console.log("Contact email : " + params.payload.email);
        let customContact  = [];
        return ContactRelation.find({$or:[ {userEmail : params.payload.email}, {userContactEmail : params.payload.email}]}).lean().exec(function (err, contacts) {
            // console.log("TEST contacts ", contacts);
            let countOccur = contacts.length;
            if(err) return callback(err);
            else{
               // let contactsDictionnary = [];
                for(var contt in contacts) {
                    let ctt = contacts[contt];
                    // console.log('ctt : ', ctt);
                    for(var key in ctt) {
                        if(key === '_id') {
                            // console.log('ctt key is : ', ctt[key]);
                            let relationId = ctt[key];
                            Contact.find({relationId : relationId}, function (err, contact) {
                                // console.log('uSER : ', contact);
                                if(err) {
                                    console.log('Error in getContacts line : 33');
                                }
                                else{
                                    let rightContact ;
                                    for(var rightOne in contact) {
                                        if(contact[rightOne].contactEmail !== params.payload.email) {
                                            rightContact = contact[rightOne];
                                            // console.log('Right contact : ', rightContact);
                                        }
                                    }
                                    // console.log('Right contact : ', rightContact);
                                    ctt['contactObject'] = rightContact;
                                    for(var u in rightContact) {
                                        if(u == 'user'){
                                            userModel.findById(rightContact.user, function (err, user) {
                                                if(err) {
                                                    console.log('Error in getContacts line : 52');
                                                }
                                                else {
                                                    ctt['userObject'] = user;
                                                    customContact.push(ctt);
                                                    countOccur--;
                                                    if (countOccur === 0) return callback(null, customContact);
                                                }
                                            });
                                        }
                                    }

                                }
                            });
                        }
                    }
                }
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
                        ContactRelation.findOne({$and:[{userEmail : req.payload.email}, {userContactEmail : req.body.contactemail}]}, function (err, relatedContact) {
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
                        ContactRelation.findOne({$and:[ {userEmail : req.payload.email}, {userContactEmail : req.body.contactemail} ]}, function (err, relatedContact){
                            if(err) return callback(err);
                            console.log("Test 5  relatedContact: ", relatedContact);
                            if(relatedContact) {
                                util.sendMail(req, function (err, success) {
                                    console.log("Send mail success : ", success);
                                    console.log("Send mail err : ", err ? ' send mail fired error' : 'send mailexec with success' );
                                    if(err) return callback(err);
                                     callback("Invitation for this contact is already sent, mail resent waiting for user reply");
                                });
                            }
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
                ContactRelation.findOneAndRemove({$and : [{userEmail : req.payload.email}, {userContactEmail : req.body.contactemail}]}, function (err, contact) {
                    console.log("2 DELETE Test  contact'", contact);
                    if(err) return callback(err);
                    if(!contact) return callback("Contact not found");
                    else {
                        let listToRemove = [];
                        for(var key in contact) {
                            // console.log('Index content : ', key === '_id' ? ctt[key] : null;);
                            if (key === 'user' || key === 'userContact') {
                                console.log('Index : ' +  key + ' and content is : ' + contact[key]);
                                listToRemove.push(contact[key]);
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
        ], function (err, success) {
            if(err) {
                console.log(err.json());
                return callback(err);
            }
            callback(null, success);
        });
    }

    static renameUserContact(req, callback) {
        console.log("Test params ", req.payload._id);
        async.waterfall([
            function (done) {
                ContactRelation.findOne({$and : [{userEmail : req.payload.email}, {userContactEmail : req.body.contactemail}]}, function (err, user) {
                    console.log('User to update : ', user);
                    if(err) callback(err);
                    if(!user) return done('Cannot rename an invalid contact');
                    else {
                        console.log('User : ', user.user);
                        done(null, user.user);
                    }
                })
            },
            function (contactId, done) {
                console.log('Canact Id : ' + contactId);
                Contact.findByIdAndUpdate(contactId,  {nickname : req.body.nickname}, function (err, user) {
                    console.log("findOneAndUpdate test ", user);
                    console.log("callback : ");
                    if(!user) return done('Cannot rename an invalid contact');
                    else{
                        console.log("Test else statement", user);
                        return  done(null, user);
                    }
                })
            }
        ], function (err, success) {
            if(err) {
                return callback(err);
            }
            callback(null, success);
        });
    }

    static blockContact(req, callback) {
        console.log("Test 1");
        console.log("Test params ", req.payload._id);
        async.waterfall([
            function (done) {
                ContactRelation.findOne({$and : [{userEmail : req.payload.email}, {userContactEmail : req.body.contactemail}]}, function (err, user) {
                    if(err) callback(err);
                    else {
                        console.log('User : ', user.user);
                        done(null, user.user);
                    }
                })
            },
            function (contactId, done) {
                Contact.findByIdAndUpdate(contactId,  {isBlocked : req.body.isBlocked}, function (err, user) {
                    console.log("findOneAndUpdate test ", user);
                    console.log("callback : ");
                    if(!user) return done('Cannot rename an invalid contact');
                    else{
                        console.log("Test else statement", user);
                        return  done(null, user);
                    }
                })
            }
        ], function (err, success) {
            if(err) {
                console.log(err.json());
                return callback(err);
            }
            callback(null, success);
        });
    }

}

module.exports = contactController;
