/**
 * Created by TBS on 26/02/2017.
 */
let messageStatusModel = require('./../models').messageStatus
let MESSAGE_STATUSES = require('./Utils/global_variables');

let messageStatusController = {
    addMessageStatus: function addMessageStatus(params, callback) {
        console.log(params, new messageStatusModel(params));
        let newMessageStatus = new messageStatusModel(params)
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
        messageStatusModel.findOne({_id : params._id}, function(err, messageStatusFound) {
            if (err) return callback(err)
            if (!messageStatusFound) return callback("Aucun status de message n'a été trouvé")
            else {
                for(let key in params) {
                    if (key === '_id') {continue;}
                    if (messageStatusFound[key]) {
                        messageStatusFound[key] = params[key];
                    }
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
    },
    
    initMessageStatuses : function (callback) {
        messageStatusController.getMessageStatuses(null, function (err, result) {
            if (!result || !result.length || result.length <= 0) {
                for (let msgSts of MESSAGE_STATUSES) {
                    console.log(msgSts);
                    messageStatusController.addMessageStatus(msgSts, callback);
                }
            }
            else {
                callback(new Error("Already in database"));
            }
        })
    },
    findStatusByName : function (status, callback) {
        console.log('Is find baby');
        return messageStatusModel.findOne({"status" : status}, function (err, result) {
            (err) ? callback(err)
                : callback(null, result);
        })
    },
    findStatusById : function (id, callback) {
        return messageStatusModel.findById(id, function (err, result) {
            (err) ? callback(err)
                : callback(null, result);
        })
    }
}

module.exports = messageStatusController;

