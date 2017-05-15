/**
 * Created by TBS on 17/02/2017.
 */
var groupModel = require('./../models').group;
var linkUserGroupController = require('./linkUserGroup');
var userController = require('./user');

console.log(groupModel)
var groupController = {
    addGroup: function addGroup(params, callback) {
        // ici on envoie forcément soit isPublic: false, soit true
        for(var user in  params.members) {
            userController.getUsers({_id: params.members[user]._id}, function (err, foundUser) {
                if (err) return callback(err)
                else {

                }
            })
        }
        if (params.isPublic === true) {
            //vérifier si le user membre esr présent, boucle..
            var newGroup = new groupModel(params)
            return newGroup.save(function onSaveGroup(err, savedChannel) {
                if (err)  {
                    return callback(err)
                }
                else {
                    linkUserGroupController.addLinkToGroup({data: params, groupId: savedChannel._id}, function(err) {
                        if (err) return callback(err, null)
                        else {
                            return callback(null, savedChannel)
                        }
                    })
                    
                }
            })

        }
        
        if (params.isPublic === false) {
            var formerMember = params.members
            params.members = []
            var newGroup = new groupModel(params)
            return newGroup.save(function onSaveGroup(err, savedGroup) {
                if (err)  {
                    console.log(err)
                    return callback(err)
                }
                else {
                    console.log(savedGroup)
                    params.members = formerMember
                    linkUserGroupController.addLinkToGroup({data: params, groupId: savedGroup._id}, function(err) {
                        if (err) return callback(err, null)
                        else {
                            return callback(null, savedGroup)
                        }
                    })

                }
            })
        }
        else {
            return callback('Le champ isPublic n\'existe pas');
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
        return groupModel.find(params, function onGetGroups(err, arrayGroups) {
            if (err) return callback(err)
            else {
                return callback(null, arrayGroups)
            }
        })
    },
    
    updateGroup: function updateGroup(params, callback) {
        //params = { id: '123', name: 'nouveaunom', description: 'nouvelledescription' }
        groupModel.findOne({_id : params._id}, function(err, groupFound) {
            if (err) return callback(err)
            if (!groupFound) return callback("Aucun groupe n'a été trouvé")
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

    },

    removeGroup: function removeGroup(params, callback) {
        //params = { id: '123' }
        return groupModel.remove(params, function onRemoveGroup(err, removedGroup) {
            if (err) return callback(err)
            else {
                return callback(null, removedGroup)
            }
        })
    }
}

module.exports = groupController;