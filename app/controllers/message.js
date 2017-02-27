/**
 * Created by TBS on 26/02/2017.
 */
var messageModel = require('./../models').message

var messageController = {
    addMessage: function addMessage(params, callback) {
        var newMessage = new messageModel(params)
        return newMessage.save(function onSaveMessage(err, savedMessage) {
            if (err) return callback(err)
            else {
                return callback(null, savedMessage)
            }
        })
    },

    getMessages: function getMessages(params, callback) {
        return messageModel.find(params, function onGetMessages(err, arrayMessages) {
            if (err) return callback(err)
            else {
                return callback(null, arrayMessages)
            }
        })
    },

    updateMessage: function updateMessage(params, callback) {
        messageModel.findOne({id : params.id}, function(err, messageFound) {
            if (err) return callback(err)
            if (!messageFound) return callback("Aucun message n'a été trouvé")
            else {
                for(var key in messageFound) {
                    if (key === 'id') {continue;}
                    messageFound[key] = params[key];
                }

                return messageFound.save(function onSaveUpdateMessage(err, updatedMessage) {
                    if (err) callback(err)
                    else {
                        return callback(null, updatedMessage)
                    }
                })
            }
        })

    },

    removeMessage: function removeMessage(params, callback) {
        return messageModel.remove(params, function onRemoveMessage(err, removedMessage) {
            if (err) return callback(err)
            else {
                return callback(null, removedMessage)
            }
        })
    }
}

module.exports = messageController;

