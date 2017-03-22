/**
 * Created by jngue on 06/03/2017.
 */
var bcrypt = require('bcrypt-nodejs');

var SALT_WORK_FACTOR = 10;
let helper  = {
    validateEmail : function (email) {
        let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    },
    hashPassword : function (password, next) {
        bcrypt.genSalt(SALT_WORK_FACTOR, function onGenSalt(err, salt){
            if(err) return next(err);
            console.log('bcrypt');
            //On hash avec le salt
            bcrypt.hash(password, salt, null, function onHashed(err, hash){
                console.log("hash");
                if(err) return next(err);
                password = hash;
                console.log(password);
                return password;
            });
        });
    }
};

module.exports = helper;