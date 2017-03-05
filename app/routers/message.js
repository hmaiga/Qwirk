/**
 * Created by TBS on 26/02/2017.
 */
/**
 * Created by TBS on 21/02/2017.
 */
var messageController = require('./../controllers').message

var messageRouters = function messageRouters(router) {
    router.route('/messages')
        .get(function(req, res) {
            params = req.query.filter ? JSON.parse(req.query.filter) : {}
            return messageController.getMessages(params, function(err, messages) {
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
}

module.exports = messageRouters;