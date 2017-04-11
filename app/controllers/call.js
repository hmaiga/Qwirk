/**
 * Created by Housseini  Maiga on 5/22/2017.
 */

'use strict';

let async = require('async');
let q = require('q');

let userModel = require('./../models').user;
let helper = require('./../helpers/helper');
let logger = require('./../helpers/logger');


class callController {
    static updateUserPeerId(req, callback){
        userModel.findOneAndUpdate({email : req.email}, {peerId : req.peerId}, function (err, user) {
            console.log("findOneAndUpdate test : ", user.peerId);
            if(err) return callback(err);
            if(!user) return callback('Cannot update an invalid user id');
            else{
                console.log("Test else statement", user);
                return callback(null, user);
            }
        } )
    }
}
module.exports = callController;