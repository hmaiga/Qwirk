/**
 * Created by TBS on 21/02/2017.
 */
var userController = require('./../controllers').user

var userRouters = function userRouters(router) {
    router.route('/users')
        .get(function(req, res) {
            params = req.query.filter ? JSON.parse(req.query.filter) : {}
            return userController.getUsers(params, function(err, users) {
                if (err) return res.status(500).send(err)
                else {
                    res.status(200).send(users)
                }
            })
        })

        .post(function(req, res) {
            console.log(req.body)
            return userController.addUser(req.body, function(err, newUser) {
                console.log("AAAA")
                if (err) {
                    console.log("ERRRR")
                    return res.status(500).send(err);
                }
                else {
                    console.log("success")
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
                    res.status(200).send(users)
                }
            })
        })
}

module.exports = userRouters;