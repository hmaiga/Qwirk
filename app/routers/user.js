/**
 * Created by TBS on 21/02/2017.
 */

let passport = require('passport');

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
    router.route('/reset/:token')
        .post(function (req, res) {
            return restorePassController.forgot(req, res);
        });
};

module.exports = userRouters;