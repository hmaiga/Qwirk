/**
 * Created by TBS on 21/02/2017.
 */

let passport = require('passport');

let jwt = require('express-jwt');

let config = require('./../../config/');

let PARAM = config.secret;
let auth = jwt({
    secret: config.secret['PARAM'].secret,
    userProperty: 'payload'
});

let userController = require('./../controllers').user;
let authenticationController = require('./../controllers').authentication;
let restorePassController = require('./../controllers').restorePass;



let userRouters = function userRouters(router) {
    router.route('/users')
        .get(function(req, res) {
            params = req.query.filter ? JSON.parse(req.query.filter) : {};
            return userController.getUsers(params, function(err, users) {
                if (err) return res.status(500).send(err)
                else {
                    res.status(200).send(users)
                }
            })
        })

        .post(function(req, res) {
            console.log(req.body);
            return userController.addUser(req.body, function(err, newUser) {
                console.log("AAAA");
                if (err) {
                    console.log("ERRRR");
                    return res.status(500).send(err);
                }
                else {
                    console.log("success");
                    res.status(200).send(newUser);
                }
            })
        })

        .put(function(req, res) {
            return userController.updateUser(req.body, function(err, updatedUser) {
                if (err) return res.status(500).send(err);
                else {
                    res.status(200).send(updatedUser);
                }
            })
        });

    router.route('/removeuser')
        .post(function(req, res) {
            return userController.removeUser(req, function(err, users) {
                if (err) return res.status(500).send(err)
                else {
                    res.status(200).send(users);
                }
            })
        });
    router.route('/user/:userIdentifier')
        .get(function (req, res) {
            return userController.getUserProfile(req.params.userIdentifier, res, function (err, user) {
                if(err) return res.status(500).send(err);
                if(typeof user === "string") return res.status(500).send(user);
                res.status(200).send("Success");
            })
        });
    router.route('/user/:username')
        .post(function (req, res) {
            console.log(req.form);
            req.form.complete(function(err, fields, files){
                if (err) {
                    next(err);
                } else {
                    console.log('\nuploaded %s to %s'
                        ,  files.image.filename
                        , files.image.path);
                }
            });

            /*
             return userController.getUserProfile(req.params.username, res, function (err, user) {
             if(err) return res.status(500).send(err);
             if(typeof user === "string") return res.status(500).send(user);
             res.status(200).send("Success");
             })*/
        });
    router.route('/user')
        .post(function(req, res) {
            return userController.findUserByUserIdentifierAndPassword(params, function (err, user) {
                if (err) return res.status(500).send(err)
                else {
                    res.status(200).send(user);
                }
            });
        });
    router.route('/login')
        .post(function(req, res) {
            return authenticationController.login(req, res);
        });

    router.route('/register')
        .post(function (req, res) {
            return authenticationController.register(req, res);
        });

    router.route('/forgot')
        .post(function (req, res, next) {
            return restorePassController.forgot(req, res, next);
        });
    router.route('/reset')
        .post(function (req, res) {
            return restorePassController.changePasswordUser(req, res);
        });
    router.route('/reset/:token')
        .get(function (req, res) {
            return restorePassController.reset(req, res);
        });
    router.get('/profile', auth, function (req, res) {
        return authenticationController.profile(req, res, function (err, user) {
            if(err) res.status(500).send(err);
            res.status(200).send(user);
        })
    });
    router.get('/delete', auth, function (req, res) {
        return authenticationController.desactivateUserAccount(req, res, function (err, result) {
            if(err) res.status(500).send(err);
            res.status(200).send(result);
        })
    });
};

module.exports = userRouters;