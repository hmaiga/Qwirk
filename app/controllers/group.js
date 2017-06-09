/**
 * Created by TBS on 17/02/2017.
 */
var groupModel = require('./../models').group;
var linkUserGroupController = require('./linkUserGroup');
var userController = require('./user');

createChannel: function createChannel(params, callback) {
    var newGroup = new groupModel(params)
    return newGroup.save(function onSaveGroup(err, savedChannel) {
        if (err)  {
            return callback(err)
        }
        else {
            params._id = savedChannel._id
            linkUserGroupController.addLinkToGroup(params, function(err) {
                if (err) return callback(err, null)
                else {
                    return callback(null, savedChannel)
                }
            })

        }
    })
}

createGroup: function createGroup(params, callback) {
    var formerMember = params.members
    params.members = []
    var newGroup = new groupModel(params)
    return newGroup.save(function onSaveGroup(err, savedGroup) {
        if (err)  {
            return callback(err)
        }
        else {
            params.members = formerMember
            params._id = savedGroup._id
            linkUserGroupController.addLinkToGroup(params, function(err) {
                if (err) return callback(err, null)
                else {
                    return callback(null, savedGroup)
                }
            })

        }
    })
}

var groupController = {
    
    addGroup: function addGroup(params, callback) {
        // ici on envoie forcément soit isPublic: false, soit true
        console.log('IN ADD GROUP ')
        let countMembers = 0;
        if (params.members.length !== 0) {

            for(var user in  params.members) {
                console.log('IN ADD GROUP BOUCLE ')
                userController.getUsers({_id: params.members[user]._id}, function (err, foundUser) {
                    if (err) {
                        console.log(countMembers, 'ERR')
                        return callback(err)
                    }
                    if (!foundUser.length) {
                        console.log(countMembers, 'FOUNDUSERS')
                        return callback('Impossible to create group : user : ' +  params.members[user]._id + ' doesn\'t exist' )
                    }
                    else {
                        countMembers++
                        console.log(countMembers)
                        if(countMembers === params.members.length) {
                            console.log('IN EXECUTION')
                            if (params.isPublic === true) {
                                createChannel(params, function (err, savedChannel) {
                                    if (err) return callback(err)
                                    else {
                                        return callback(savedChannel)
                                    }
                                })

                            }

                            if (params.isPublic === false) {
                                createGroup(params, function (err, savedGroup) {
                                    if (err) return callback(err)
                                    else {
                                        return callback(savedGroup)
                                    }
                                })
                            }
                            if (params.isPublic === undefined || typeof params.isPublic === 'string') {
                                return callback('isPublic field doesn\'t exist or has not boolean value');
                            }
                        }
                    }
                })
            }
            
        }
        else {
            if (params.isPublic === true) {
                createChannel(params, function (err, savedChannel) {
                    if (err) return callback(err)
                    else {
                        console.log('TEST', savedChannel)
                        return callback(savedChannel)
                    }
                })

            }

            if (params.isPublic === false) {
                createGroup(params, function (err, savedGroup) {
                    if (err) return callback(err)
                    else {
                        return callback(savedGroup)
                    }
                })
            }
            if (params.isPublic === undefined || typeof params.isPublic === 'string') {
                return callback('isPublic field doesn\'t exist or has not boolean value');
            }
        }
        
        
        //params ici est de la forme :
        // {
        //      name: 'groupName',
        //      description: 'group',
        //      members: [
        //          {
        //              firstName: 'Jean',
        //              lastName: 'Paul2'
        //              etc... voir model user
        //          }
        //      ]
        //      etc... voir model group
        // }
        

    },
    
    

    getGroups: function getGroups(params, callback) {
        //params = {id : '123'} ou {} pour avoir tous les groupes
        
        return groupModel.find({members : {_id: params.user_id}}, function onGetGroups(err, arrayGroups) {
            if (err) return callback(err)
            else {
                return callback(null, arrayGroups)
            }
        }).populate('members')
    },
    
    updateGroup: function updateGroup(params, callback) {
        //params = { _id: '123', name: 'nouveaunom', description: 'nouvelledescription' }
        groupModel.findOne({_id : params._id}, function(err, groupFound) {
            if (err) return callback(err)
            if (!groupFound) return callback("Aucun groupe n'a été trouvé")
            else {


                linkUserGroupController.updateLinkUserGroup(params, function (err) {
                    if (err) return callback(err) 
                    else {
                        for(var key in params) {
                            if (key === '_id') {continue;}
                            if (groupFound[key]) {
                                groupFound[key] = params[key];
                            }
                        }

                        return groupFound.save(function onSaveUpdateGroup(err, updatedGroup) {
                            if (err) callback(err)
                            else {
                                return callback(null, updatedGroup)
                            }
                        })
                    }
                    
                })
                
            }
        })

    },

    removeGroup: function removeGroup(params, callback) {
        //params = { id: '123' }
         groupModel.remove(params, function onRemoveGroup(err, removedGroup) {
            if (err) return callback(err)
            else {
                linkUserGroupController.removeAllLinksfromGroup({group : {_id: params._id}}, function (err, removedLinks) {
                    if(err) {
                        return callback(err)
                    }
                    else {
                        return callback(null, removedGroup)
                    }
                    
                })

            }
        })
    }
}

module.exports = groupController;