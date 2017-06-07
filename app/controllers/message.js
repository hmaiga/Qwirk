/**
 * Created by TBS on 26/02/2017.
 */
let messageModel = require('./../models').message
let messageStatusController = require('./messageStatus');
let FileController = require('./fileController');
let async = require('async');
let amqp = require('amqplib/callback_api');
let multer = require('multer');
let upload = multer();
let mime = require('mime');

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
                //console.log("New message : ", newMessage, params);
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

    addMediaMessage : function (req, res, app, callback) {
        let fc = new FileController(app);
        //console.log("Start messages : ", req.files);
        async.waterfall([
            function (done) {
                for (let i in req.body) {
                    //console.log("All is fine");
                    req.body[i] = JSON.parse(req.body[i]);
                }
                //console.log("Done messages Status : ", req.body.messageStatus.status);
                req.body.messageStatus.status = "sent";
                messageStatusController.findStatusByName(req.body.messageStatus.status, function (err, status) {
                    req.body.messageStatus = status;
                    done(err);
                })
            },
            function (done) {
                //console.log("Done messages : ", req.files);
                fc.uploadFile(req, res, done)
            },
            function (filename, done) {
                //console.log("Req body", req.body);
                let newMessage = new messageModel(req.body);
                newMessage.media.filename = filename;
                newMessage.media.contentType = mime.lookup(filename);
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
            if (err) return callback(err);
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
                //console.log("Update message status controllers ********", params);
                messageModel.findByIdAndUpdate(params._id, { $set: { messageStatus: params.messageStatus }}, function onSaveMessage(err, savedMessage) {
                    //console.log("Update message status controllers findByIdAndUpdate", params);
                    if (err) return callback(err)
                    else {
                        //console.log("Update message status controllers", savedMessage);
                        return callback(null, savedMessage)
                    }
                })
            }
        ], function(err) {
            logger.debug(err);
            if (err) return next(err);
        })
    },

    getMessages: function getMessages(params, callback) {
        //console.log('Get Messages');
        async.waterfall([
            function (done) {
                return messageStatusController.getMessageStatuses(null, function (err, msgStatuses) {
                   done(err, msgStatuses);
                });
            },
            function (msgStatuses, done) {

                //console.log("Get messages", msgStatuses);
                return messageModel.find({contact : params.contact})
                    .skip(parseInt(params.start))
                    .limit(parseInt(params.limit))
                    .sort([['sendTime', 'descending']])
                    .exec(function onGetMessages(err, arrayMessages) {
                        done(err, arrayMessages, msgStatuses);
                    });
            },
            function (arrayMessages, msgStatuses, done) {
                let msges = [];
                for (msg of arrayMessages) {
                    let newMsg = {};
                    for (let msgSts of msgStatuses) {
                        //console.log(msg.messageStatus.toString() === msgSts._id.toString());
                        if (msg.messageStatus.toString() === msgSts._id.toString()) {
                            msg.messageStatus = msgSts;
                        }
                    }
                    msges.push(msg);
                }
                done(null, msges);
            },
            function (msges) {
                callback(null, msges);
            }
        ], function(err) {
            //console.log(err.json());
            //res.status(500).json(err);
            callback(err);
        });
        /*
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
    },

    findMessagesByReceiver: function (req, callback) {
        return messageModel.find({"receiverUser": {$elemMatch: {_id : req.payload._id}}}, function (err, messages) {
            if (err) return callback(err);
            return callback(null, messages);
        })
    } 
}

module.exports = messageController;

