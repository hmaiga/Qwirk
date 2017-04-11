/**
 * Created by TBS on 13/02/2017.
 */
var mongoose = require('mongoose');
var validate = require('mongoose-validator');
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');

let helper = require('./../helpers/helper');
let PARAM = require('./../../config/config');

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
        firstName: {
            type: String,
            required: true
        },
        lastName: {
            type: String,
            required: true
        },
        email: {
            type: String,
            unique: true,
            required: true
            //validate: emailValidator
        },
        username: {
            type: String,
            unique: true,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        resetPasswordToken: String,
        resetPasswordExpires: Date,
        hash: String,
        salt: String,
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
        profilePicture: {
            data: Buffer,
            contentType: String
        },
        statusData: {
            name : String,
            color : String
        },
        setting: {
            type: Schema.Types.ObjectId,
            ref: 'Setting'
        },
        isModerator : {
            type: Boolean,
            default : false
        },
        isActivated : {
            type: Boolean,
            default: true

        }
    }, {timestamps: true} );

userSchema.methods.setPassword = function(password){
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
    this.password = this.salt + this.hash;
};

userSchema.methods.setStatus = function (status) {
    this.status = status._id;
    this.statusData.name = status.name;
    this.statusData.color = status.color;
}

userSchema.methods.validPassword = function(password) {
    var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
    return this.hash === hash;
};

userSchema.methods.generateJwt = function() {
    var expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);

    return jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username,
        exp: parseInt(expiry.getTime() / 1000),
    }, PARAM.secret );
};

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
