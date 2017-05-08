/**
 * Created by TBS on 26/02/2017.
 */
var messageModel = require('./../models').message
var amqp = require('amqplib/callback_api');

var messageController = {
    addMessage: function addMessage(params, callback) {
        var newMessage = new messageModel(params)
        return newMessage.save(function onSaveMessage(err, savedMessage) {
            if (err) return callback(err)
            else {
                if (params.receiverGroup !== [] || !params.receiverGroup) {
                    amqp.connect('amqp://localhost', function(err, conn) {
                        conn.createChannel(function(err, ch) {
                            var q = params.receiverGroup._id;
                            var msg = params.content;
                            //gérer les médias... Si params.media alors Buffer..
                            ch.assertQueue(q, {durable: false});
                            // Note: on Node 6 Buffer.from(msg) should be used
                            ch.sendToQueue(q, new Buffer(msg));
                            console.log(" [x] Sent %s", msg);
                        });
                        setTimeout(function() { conn.close(); process.exit(0) }, 500);
                    });
                    return callback(null, savedMessage)
                }
                else {
                    amqp.connect('amqp://localhost', function(err, conn) {
                        conn.createChannel(function(err, ch) {
                            var q = params.queue;
                            var msg = params.content;
                            //gérer les médias... Si params.media alors Buffer..
                            ch.assertQueue(q, {durable: false});
                            // Note: on Node 6 Buffer.from(msg) should be used
                            ch.sendToQueue(q, new Buffer(msg));
                            console.log(" [x] Sent %s", msg);
                        });
                        setTimeout(function() { conn.close(); process.exit(0) }, 500);
                    });
                    return callback(null, savedMessage)
                }
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
        messageModel.findOne({_id : params._id}, function(err, messageFound) {
            if (err) return callback(err)
            if (!messageFound) return callback("Aucun message n'a été trouvé")
            else {
                for(var key in params) {
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

