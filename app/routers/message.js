/**
 * Created by TBS on 26/02/2017.
 */
/**
 * Created by TBS on 21/02/2017.
 */
let jwt = require('express-jwt')

let config = require('./../../config/');
let messageController = require('./../controllers').message


let auth = jwt({
    secret: config.secret['PARAM'].secret,
    userProperty: 'payload'
});

var messageRouters = function messageRouters(router) {
    router.route('/messages/:contact/:start/:limit')
        .get(function(req, res) {
            //params = req.query.filter ? JSON.parse(req.query.filter) : {};
            return messageController.getMessages(req.params, function(err, messages) {
                if (err) return res.status(500).send(err)
                else {
                    res.status(200).send(messages)
                }
            })
        })

        .post(function(req, res) {
            return messageController.addMessage(req.body, function(err, newMessage) {
                if (err) return res.status(500).send(err);
                else {
                    res.status(200).send(newMessage);
                }
            })
        })

        .put(function(req, res) {
            return messageController.updateMessage(req.body, function(err, updatedMessage) {
                if (err) return res.status(500).send(err);
                else {
                    res.status(200).send(updatedMessage);
                }
            })
        });

    router.route('/removemessage')
        .post(function(req, res) {
            return messageController.removeMessage(req, function(err, messages) {
                if (err) return res.status(500).send(err)
                else {
                    res.status(200).send(messages)
                }
            })
        })
    router.route('/getSendMessages')
        .get(auth, function (req, res) {
            return messageController.findMessagesByReceiver(req, function (err, messages) {
                if(err) return res.status(404).send(err)
                else {
                    res.status(200).send(messages);
                }
            })
        })
}

module.exports = messageRouters;