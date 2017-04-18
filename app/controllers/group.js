/**
 * Created by TBS on 17/02/2017.
 */
var groupModel = require('./../models').group;

var groupController = {
    addGroup: function addGroup(params, callback) {
        var newGroup = new groupModel(params)
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
        return newGroup.save(function onSaveGroup(err, savedGroup) {
            if (err)  {
                console.log(err)
                return callback(err)
            }
            else {
                console.log(savedGroup)
                return callback(null, savedGroup)
            }
        })
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