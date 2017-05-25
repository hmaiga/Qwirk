/**
 * Created by TBS on 26/02/2017.
 */
let messageModel = require('./../models').message
let messageStatusController = require('./messageStatus');
let async = require('async');
let amqp = require('amqplib/callback_api');

let messageController = {
    addMessage: function addMessage(params, callback) {
        async.waterfall([
            function (done) {
                messageStatusController.findStatusByName(params.messageStatus.status, function (err, status) {
                    params.messageStatus = status;
                    done();
                })
            },
            function () {
                let newMessage = new messageModel(params);
                console.log("New message : ", newMessage, params);
                return newMessage.save(function onSaveMessage(err, savedMessage) {
                    if (err) return callback(err)
                    else {
                        if (err) return callback(err)
                        else {
                            return callback(null, savedMessage)
                        }
                    }
                })
            }
        ], function(err) {
            logger.debug(err);
            if (err) return next(err);
        })
    },

    updateMessageStatus : function (params, callback) {
        async.waterfall([
            function (done) {
                messageStatusController.findStatusByName(params.messageStatus.status, function (err, status) {
                    params.messageStatus = status;
                    done();
                })
            },
            function () {
                let newMessage = new messageModel(params);
                return newMessage.save(function onSaveMessage(err, savedMessage) {
                    if (err) return callback(err)
                    else {
                        if (err) return callback(err)
                        else {
                            return callback(null, savedMessage)
                        }
                    }
                })
            }
        ], function(err) {
            logger.debug(err);
            if (err) return next(err);
        })
    },

    getMessages: function getMessages(params, callback) {
        return messageModel.find({contact : params.contact})
            .skip(parseInt(params.start))
            .limit(parseInt(params.limit))
            .sort([['sendTime', 'descending']])
            .exec(function onGetMessages(err, arrayMessages) {
                console.log(arrayMessages);
                if (err) return callback(err)
                else {
                    return callback(null, arrayMessages)
                }
            });/*
        return messageModel.find({contact : params.contact}, { skip: params.start, limit: params.limit, sort : -1 }, function onGetMessages(err, arrayMessages) {
            if (err) return callback(err)
            else {
                return callback(null, arrayMessages)
            }
        })*/
    },

    updateMessage: function updateMessage(params, callback) {
        messageModel.findOne({_id : params._id}, function(err, messageFound) {
            if (err) return callback(err)
            if (!messageFound) return callback("Aucun message n'a été trouvé")
            else {
                for(let key in params) {
                    if (key === '_id') {continue;}
                    if (messageFound[key]) {
                        messageFound[key] = params[key];
                    }
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

