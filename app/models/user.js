/**
 * Created by TBS on 13/02/2017.
 */
var mongoose = require('mongoose');
var validate = require('mongoose-validator');
var bcrypt = require('bcrypt-nodejs');
let helper = require('./../helpers/helper');

var Schema = mongoose.Schema;
var SALT_WORK_FACTOR = 10;

// var emailValidator = [
//     validate({
//         validator: 'matches',
//         arguments: /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i
//     })
// ];

var userSchema = new Schema(
    {
        firstName: String,
        lastName: String,
        email: {
            type: String
            //validate: emailValidator
        },
        username: {
            type: String
        },
        password: {
            type: String
        },
        groups: [{
            type: Schema.Types.ObjectId,
            ref: 'Group'
        }],
        contacts: [{
            type: Schema.Types.ObjectId,
            ref: 'User'
        }],
        invitedGroups: [{
            type: Schema.Types.ObjectId,
            ref: 'Group'
        }],
        status: {
            type: Schema.Types.ObjectId,
            ref: 'Status'
        },
        setting: {
            type: Schema.Types.ObjectId,
            ref: 'Setting'
        },
        isModerator : Boolean
    }, {timestamps: true} );

userSchema.methods.isRealPassword = function isRealPassword(passwordToCompare, callback){
    return bcrypt.compare(passwordToCompare, this.password, function onCompare(err, isMatch){
        if(err) return callback(err);
        return callback(null, isMatch);
    });
};

userSchema.pre('save', function onSave(next){
    var user = this;
    if(user.isModified('password') || user.isNew){
        //sinon on hash
        console.log("test" + user.password)
        user.password = helper.hashPassword(user.password, next);
        console.log("toto" + helper.hashPassword(user.password, next))
        next();
    }
    else{
        return next();
    }
});

var User = mongoose.model('User', userSchema);
module.exports = User;
