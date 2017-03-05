/**
 * Created by TBS on 26/02/2017.
 */
var moderatorModel = require('./../models').moderator

var moderatorController = {
    addModerator: function addModerator(params, callback) {
        var newModerator = new moderatorModel(params)
        return newModerator.save(function onSaveModerator(err, savedModerator) {
            if (err) return callback(err)
            else {
                return callback(null, savedModerator)
            }
        })
    },

    getModerators: function getModerators(params, callback) {
        return moderatorModel.find(params, function onGetModerators(err, arrayModerators) {
            if (err) return callback(err)
            else {
                return callback(null, arrayModerators)
            }
        })
    },

    updateModerator: function updateModerator(params, callback) {
        moderatorModel.findOne({id : params.id}, function(err, moderatorFound) {
            if (err) return callback(err)
            if (!moderatorFound) return callback("Aucun modérateur n'a été trouvé")
            else {
                for(var key in moderatorFound) {
                    if (key === 'id') {continue;}
                    moderatorFound[key] = params[key];
                }

                return moderatorFound.save(function onSaveUpdateModerator(err, updatedModerator) {
                    if (err) callback(err)
                    else {
                        return callback(null, updatedModerator)
                    }
                })
            }
        })

    },

    removeModerator: function removeModerator(params, callback) {
        return moderatorModel.remove(params, function onRemoveModerator(err, removeModerator) {
            if (err) return callback(err)
            else {
                return callback(null, removeModerator)
            }
        })
    }
}

module.exports = moderatorController;

