/**
 * Created by TBS on 26/02/2017.
 */
var userModel = require('./../models').user

var userController = {
    addUser: function addUser(params, callback) {
        console.log(params)
        var newUser = new userModel(params)
        console.log("TEST")
        return newUser.save(function onSaveUser(err, userSaved) {
            if (err) {
                return callback(err)
            }
            else {
                return callback(null, userSaved)
            }
            
        })
    },
    
    getUsers: function getUsers(params, callback) {
        return userModel.find(params, function onGetUsers(err, arrayUsers) {
            if (err) return callback(err)
            else {
                return callback(null, arrayUsers)
            }
        })
    },

    updateUser: function updateUser(params, callback) {
        userModel.findOne({id : params.id}, function(err, userFound) {
            if (err) return callback(err)
            if (!userFound) return callback("Aucun utilisateur n'a été trouvé")
            else {
                for(var key in userFound) {
                    if (key === 'id') {continue;}
                    userFound[key] = params[key];
                }

                return userFound.save(function onSaveUpdateUser(err, user) {
                    if (err) callback(err)
                    else {
                        return callback(null, user)
                    }
                })
            }
        })

    },

    removeUser: function removeUser(params, callback) {
        return userModel.remove(params, function onRemoveUser(err, deletedUser) {
            if (err) return callback(err)
            else {
                return callback(null, deletedUser)
            }
        })
    },

    findUserByEmailAndPassword: function (params, callback) {
        return userModel.findOne({email : params.email, password : params.password}, function onGetUserByEmailAndPassword(err, user) {
            if (err) return callback(err)
            if (!user) return callback("Aucun utilisateur n'a été trouvé")
            else {
                return callback(null, user);
            }
        })
    },

    findUserByUsernameAndPassword: function (params, callback) {
        return userModel.findOne({username : params.username, password : params.password}, function onGetUserByUsernameAndPassword(err, user) {
            if (err) return callback(err)
            if (!user) return callback("Aucun utilisateur n'a été trouvé")
            else {
                return callback(null, user);
            }
        })
    }
}

module.exports = userController;
