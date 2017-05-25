/**
 * Created by TBS on 26/02/2017.
 */
let helper = require('./../helpers/helper');

var userModel = require('./../models').user;
var contactModel = require('./../models').contact;

var userController = {
    addUser: function addUser(params, callback) {
        console.log("Test Controller : ", params)
        var newUser = new userModel(params)
        return newUser.save(function onSaveUser(err, userSaved) {
            if (err) {
                console.log("ERRRR ctrl")
                return callback(err)
            }
            else {
                console.log("SUCCESS ctrl")
                return callback(null, userSaved)
            }
            
        })
    },
    
    getUsers: function getUsers(params, callback) {
        return userModel.find(params, function onGetUsers(err, arrayUsers) {
            if (err) return callback(err)
            else {
                console.log("callback type : ", typeof callback);
                return callback(null, arrayUsers)
            }
        })
    },

    updateUser: function updateUser(params, callback) {
        userModel.findOne({_id : params._id}, function(err, userFound) {
            console.log("Test ctrl userFound: ", userFound)
            if (err) return callback(err)
            if (!userFound) return callback("Aucun utilisateur n'a été trouvé")
            else {
                for(var key in params) {
                    if (key === '_id') {continue;}
                    console.log(key)
                    if (userFound[key]) {
                        userFound[key] = params[key];
                    }
                }
                return userFound.save(function onSaveUpdateUser(err, user) {
                    if (err) callback(err);
                    else {
                        return callback(null, user)
                    }
                })
            }
        })

    },
    
    // getUserContacts: function (params, callback) {
    //     console.log("Test params ", params);
    //     return userModel.findById( params, function (err, userContacts) {
    //         console.log("TEST getUserContacts ", userContacts);
    //         if(err) return callback(err);
    //         else{
    //             console.log("TEST userContacts.contacts ", userContacts.contacts)
    //             return callback(null, userContacts.contacts)
    //         }
    //     })
    // },
    // getUserContact: function (params, callback) {
    //     console.log("Test params ");
    //     return userModel.findById(params, function (err, userContacts) {
    //         console.log("TEST getUserContacts ");
    //         if(err) return callback(err);
    //         else{
    //             console.log("TEST userContacts.contacts ", userContacts.contacts);
    //             return callback(null, userContacts.contacts);
    //         }
    //     })
    // },
    // updateUserContacts: function (params, callback) {
    //     console.log("TEST userContacts.contacts CTRL ", params._id);
    //     userModel.findById(params._id, function(err, userContacts){
    //         if(err){
    //             console.log("TEST userContacts  Fail");
    //             return callback(err);
    //         }
    //         //if(!userContacts) return callback(err);
    //         else {
    //             console.log("TEST userContacts.contacts before loop ", userContacts);
    //             for(var key in params.contacts) {
    //                 let contacts = params.contacts;
    //                 userContacts.contacts.push(contacts[key]);
    //         }
    //             return userContacts.save(function onSaveUpdateUser(err, user) {
    //                 if (err) callback(err);
    //                 else {
    //                     console.log("TEST userContacts.contacts ", user.contacts);
    //                     return callback(null, user);
    //                 }
    //             })
    //         }
    //     })
    // },

    removeUser: function removeUser(params, callback) {
        return userModel.remove(params, function onRemoveUser(err, deletedUser) {
            if (err) return callback(err)
            else {
                return callback(null, deletedUser)
            }
        })
    },
    /*
    findUserByEmailAndPassword: function (params, callback) {
        return userModel.findOne({email : params.email, password : params.password}, function onGetUserByEmailAndPassword(err, user) {
            if (err) return callback(err)
            if (!user) return callback("Aucun utilisateur n'a été trouvé")
            else {
                return callback(null, user);
            }
        })
    },*/

    findUserByUserIdentifierAndPassword: function (params, callback) {
        if (helper.validateEmail(params.userIdentifier)) {
            return userModel.findOne({
                email: params.userIdentifier
            }, function onGetUserByEmailAndPassword(err, user) {
                if (err) return callback(err);
                if (!user) return callback("Aucun utilisateur n'a été trouvé")
                else {
                    if(user.password !== params.password) {
                        return callback("E-mail and password not match")
                    }
                    return callback(null, user);
                }
            })
        }
        else {
            return userModel.findOne({
                username: params.userIdentifier
            }, function onGetUserByUsernameAndPassword(err, user) {
                if (err) return callback(err);
                if (!user) return callback("Aucun utilisateur n'a été trouvé");
                else {
                    if(user.password !== params.password) {
                        return callback("Username and password not match")
                    }
                    return callback(null, user);
                }
            })
        }
    },

    findUserById : function (id, callback) {
        return userModel.findById(id, function (err, user) {
            if(err) return callback(err);
            if(!user) return callback ('User doesn\'t exist')
            else {
                return callback(null, user);
            }
        })
    },

    getUserProfile : function (userIdentifier,res, callback) {
        let object = {};
        if (helper.validateEmail(userIdentifier)) {
            object.email = userIdentifier;
        }
        else {
            object.username = userIdentifier;
        }
        return userModel.findOne(object, function (err, user) {
            if (err) return callback(err.json());
            if (!user) return callback("Aucun utilisateur n'a été trouvé");
            let userJson = user.toJSON();
            if(!userJson.profilePicture) return callback('User does not have a user profile');
            res.contentType(user.profilePicture.contentType);
            res.send(user.profilePicture.data);
        })
    },

    setUserProfile : function (req, res, done) {

    }
};

module.exports = userController;
