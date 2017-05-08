/**
 * Created by Housseini  Maiga on 5/5/2017.
 */
let userModel = require('./../models').user;
let contactModel = require('./../models').contact;

let utils = {
    isContactExist : function (user_id) {
        userModel.findById(user_id, function(err, contact){
            if(err || !contact) return false;
            return true;
        })
    },
    sendEmail : function (contact) {
        
    }
    
};

module.exports = utils;
