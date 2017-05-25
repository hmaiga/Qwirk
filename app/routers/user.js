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
let contactController = require('./../controllers').contact;
let callController = require('./../controllers').call;



let userRouters = function userRouters(router) {
    router.route('/users')
        .get(function(req, res) {
            params = req.query.filter ? JSON.parse(req.query.filter) : {};
            return userController.getUsers(params, function(err, users) {
                if (err) {
                    return res.status(500).send(err)
                }
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
            //console.log("PUT Test Router params: ", req.body)
            return userController.updateUser(req.body, function(err, updatedUser) {
                //console.log("PUT Test Router params: ", updatedUser)
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

    router.route('/contacts')

     // Use this pattern in order to find all contacts for the authenficated user
     // GET
     // {
     // }
     // PS :Don't forget authentification token before requested
        .get(auth, function (req, res) {
            console.log("1 GET Test Router '/contacts/:user_id' : ", req);
            return contactController.getContacts(req, function (err, contacts) {
                console.log("2 GET Test Router '/contacts/:user_id' : ", contacts);
                if(err) return res.status(500).send(err);
                else {
                    console.log("3 GET Test Router '/contacts/:user_id' : Success");
                    res.status(200).send(contacts);
                }
            })
        });

    router.route('/contact')

     // Use this pattern in order to add a new contact
     // {
     //     "contactemail": "test@xxxx.fr",          => contact email
     //     "nickname" : "h.maiga"                   => contact userId
     // }
     // PS :Don't forget authentification token before requested
        .post(auth, function (req, res) {
            console.log("1 post Test Router '/contact'", req.body);
            return contactController.addContact(req,function (err, userContacts) {
                console.log("2 post Test Router '/contact' : Success", userContacts);
                if(err) return res.status(500).send(err);
                else {
                    console.log("3 post Test Router '/contact' : Success", userContacts);
                    res.status(400).send(userContacts);
                }
            })
        })

         // Use this pattern in order to rename a contact nickname
         // {
         //     "contactemail": "test@xxxx.fr",                                => contact email
         //     "contactUserId" : "T1122465444544444444654"                   => contact userId
         // }
         // PS :Don't forget authentification token before requested
        .delete(auth, function (req, res) {
            return contactController.removeUserContact(req, function (err, userContact) {
                if(err) return res.status(500).send(err);
                else{
                    res.status(200).send(userContact);
                }
            })
        });

    // Use this pattern in order to rename a contact nickname
    // {
    //     "contactemail": "test.xxx@hotmail.fr",   => contact email
    //     "nickname" : "h.maiga"                   => contact nickname
    // }
    // PS :Don't forget authentification token before requested
    router.route('/contact/rename')
        .put(auth, function (req, res) {
            contactController.renameUserContact(req, function (err, userContact) {
                console.log("1 PUT Test Router /contact/rename", userContact);
                if(err) return res.status(500).send(err);
                else{
                    res.status(200).send(userContact);
                }
            })
        });

     // Use this pattern in order to block a contact
     // {
     //     "contactemail": "test.xx@hotmail.fr",     => contact email
     //     "isBlocked" : true                        => set block field to true
     // }
     // PS :Don't forget authentification token before requested
    router.route('/contact/block')
    .put(auth, function (req, res) {
        console.log("1 PUT Test Router /contact/block", req.body);
        contactController.blockContact(req, function (err, contact) {
                //console.log("2 PUT Test Router /contact/block", req.body);
                if(err) return res.status(500).send(err);
                else {
                    res.status(200).send(contact);
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

    router.route('/id/:user_id')
        .get(function (req, res) {
            return userController.findUserById(req.params.user_id, function (err, user) {
                if(err) return res.status(404).send(err);
                else {
                    res.status(200).send(user);
                }
            })
        });

    router.route('/login')
        .post(function(req, res) {
            console.log('login : ', req);
            return authenticationController.login(req, res);
        });

    router.route('/register')
        .post(function (req, res) {
            console.log("Test register route : ", req.body);
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
    router.put('/update', auth, function (req, res) {
        console.log('Receive request : ', req.body);
        return authenticationController.updateUserAccount(req, res, function (err, result) {
            console.log(err, result);
            if(err) res.status(500).send(err);
            res.status(200).send(result);
        })
    });

    router.put('/update/peer', function (req, res) {
        console.log('Receive request : ', req.body);
        return callController.updateUserPeerId(req.body, function (err, user) {
            console.log('user peer id updated : ', user);
            if(err) res.status(500).send(err);
            else {
                console.log('user peer id  is : ', user.peerId);
                res.status(200).send(user.peerId);
            }
        })
    })
};

module.exports = userRouters;