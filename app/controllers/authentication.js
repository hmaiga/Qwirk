/**
 * Created by jngue on 14/03/2017.
 */
let passport = require('passport');
let mongoose = require('mongoose');
let fs = require('fs');
let mime = require('mime');
let User = mongoose.model('User');
let Status = mongoose.model('Status');
let async = require('async');

let logger = require("./../helpers/logger");
let statusController = require("../controllers").status;

class authentication {
    static register (req, res) {
        async.waterfall([
            function (done) {
                Status.findOne({name : "Online"}, function (err, status) {
                    console.log(status);
                    done(err, status);
                })
            },
            function (status, done) {
                let user = new User();

                logger.debug(status);
                let imgPath = 'D:/Users/jngue/WebstormProjects/Qwirk/app/assets/img/qwirk.jpg';
                user.firstName = req.body.firstName;
                user.lastName = req.body.lastName;
                user.email = req.body.email;
                user.username = req.body.username;
                user.setPassword(req.body.password);
                user.groups = req.body.groups || [];
                user.contacts = req.body.contacts || [];
                user.invitedGroups = req.body.invitedGroups || [];
                user.status = status._id;
                user.statusData.name = status.name;
                user.statusData.color = status.color;
                user.settings = req.body.settings || [];
                user.isModerator = req.body.isModerator || false;
                user.resetPasswordExpires = null;
                user.resetPasswordToken = null;
                user.profilePicture.data = fs.readFileSync(imgPath);
                user.profilePicture.contentType = mime.lookup(imgPath);

                user.save(function(err) {
                    let token;
                    if (err) {
                        console.log(err);
                        res.status(500).json(err);
                        return;
                    }

                    token = user.generateJwt();
                    res.status(200);
                    res.json({
                        "token" : token
                    });
                });
            }], function (err) {
            if(err) {
                console.log(err.json());
                res.status(500).json(err)
            }
        })
    }
    static login (req, res) {
        passport.authenticate('local', function(err, user, info){
            let token;

            // If Passport throws/catches an error
            if (err) {
                res.status(404).json(err);
                return;
            }

            // If a user is found
            if(user){
                token = user.generateJwt();
                res.status(200);
                res.json({
                    "token" : token
                });
            } else {
                // If user is not found
                res.status(401).json(info);
            }
        })(req, res);
    }
}

module.exports = authentication;