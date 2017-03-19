    /**
 * Created by jngue on 14/03/2017.
 */
var passport = require('passport');
var mongoose = require('mongoose');
var User = mongoose.model('User');

class authentication {
    static register (req, res) {
        var user = new User();

        user.firstName = req.body.firstName;
        user.lastName = req.body.lastName;
        user.email = req.body.email;
        user.username = req.body.username;
        user.setPassword(req.body.password);
        user.groups = req.body.groups;
        user.contacts = req.body.contacts;
        user.invitedGroups = req.body.invitedGroups;
        user.status = req.body.status;
        user.settings = req.body.settings;
        user.isModerator = req.body.isModerator;
        user.save(function(err) {
            var token;
            token = user.generateJwt();
            res.status(200);
            res.json({
                "token" : token
            });
        });
    }

    static login (req, res) {
        passport.authenticate('local', function(err, user, info){
            var token;

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