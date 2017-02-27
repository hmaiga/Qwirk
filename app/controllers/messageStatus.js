/**
 * Created by TBS on 26/02/2017.
 */
var messageStatusModel = require('./../models').messageStatus

var messageStatusController = {
    addMessageStatus: function addMessageStatus(params, callback) {
        var newMessageStatus = new messageStatusModel(params)
        return newMessageStatus.save(function onSaveMessageStatus(err, savedMessage) {
            if (err) return callback(err)
            else {
                return callback(null, savedMessage)
            }
        })
    },

    getMessageStatuses: function getMessageStatuses(params, callback) {
        return messageStatusModel.find(params, function onGetMessageStatus(err, arrayMessageStatus) {
            if (err) return callback(err)
            else {
                return callback(null, arrayMessageStatus)
            }
        })
    },

    updateMessageStatus: function updateMessageStatus(params, callback) {
        messageStatusModel.findOne({id : params.id}, function(err, messageStatusFound) {
            if (err) return callback(err)
            if (!messageStatusFound) return callback("Aucun status de message n'a été trouvé")
            else {
                for(var key in messageStatusFound) {
                    if (key === 'id') {continue;}
                    messageStatusFound[key] = params[key];
                }

                return messageStatusFound.save(function onSaveUpdateMessageStatus(err, updatedMessageStatus) {
                    if (err) callback(err)
                    else {
                        return callback(null, updatedMessageStatus)
                    }
                })
            }
        })

    },

    removeMessageStatus: function removeMessageStatus(params, callback) {
        return messageStatusModel.remove(params, function onRemoveMessageStatus(err, removedMessageStatus) {
            if (err) return callback(err)
            else {
                return callback(null, removedMessageStatus)
            }
        })
    }
}

module.exports = messageStatusController;

