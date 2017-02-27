/**
 * Created by TBS on 26/02/2017.
 */
var typeMessageModel = require('./../models').typeMessage

var typeMessageController = {
    addTypeMessage: function addTypeMessage(params, callback) {
        var newTypeMessage = new typeMessageModel(params)
        return newTypeMessage.save(function onSaveTypeMessage(err, savedTypeMessage) {
            if (err) return callback(err)
            else {
                return callback(null, savedTypeMessage)
            }
        })
    },

    getTypeMessages: function getTypeMessages(params, callback) {
        return typeMessageModel.find(params, function onGetTypeMessages(err, arrayTypeMessages) {
            if (err) return callback(err)
            else {
                return callback(null, arrayTypeMessages)
            }
        })
    },

    updateTypeMessage: function updateTypeMessage(params, callback) {
        typeMessageModel.findOne({id : params.id}, function(err, typeMessageFound) {
            if (err) return callback(err)
            if (!typeMessageFound) return callback("Aucun type de message n'a été trouvé")
            else {
                for(var key in typeMessageFound) {
                    if (key === 'id') {continue;}
                    typeMessageFound[key] = params[key];
                }

                return typeMessageFound.save(function onSaveUpdateTypeMessage(err, updatedTypeMessage) {
                    if (err) callback(err)
                    else {
                        return callback(null, updatedTypeMessage)
                    }
                })
            }
        })

    },

    removeTypeMessage: function removeTypeMessage(params, callback) {
        return typeMessageModel.remove(params, function onRemoveTypeMessage(err, removeTypeMessage) {
            if (err) return callback(err)
            else {
                return callback(null, removeTypeMessage)
            }
        })
    }
}

module.exports = typeMessageController;
