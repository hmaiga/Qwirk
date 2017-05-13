/**
 * Created by TBS on 26/02/2017.
 */
var messageStatusController = require('./../controllers').messageStatus

var messageStatusRouters = function messageStatusRouters(router) {
    router.route('/messageStatuses')
        .get(function(req, res) {
            // params = req.query.filter ? JSON.parse(req.query.filter) : {};
            return messageStatusController.getMessageStatuses(req.params, function(err, messageStatuses) {
                if (err) return res.status(500).send(err)
                else {
                    res.status(200).send(messageStatuses)
                }
            })
        })

        .post(function(req, res) {
            return messageStatusController.addMessageStatus(req.body, function(err, newMessageStatus) {
                if (err) return res.status(500).send(err);
                else {
                    res.status(200).send(newMessageStatus);
                }
            })
        })

        .put(function(req, res) {
            return messageStatusController.updateMessageStatus(req.body, function(err, updatedMessageStatus) {
                if (err) return res.status(500).send(err);
                else {
                    res.status(200).send(updatedMessageStatus);
                }
            })
        });

    router.route('/removemessageStatus')
        .post(function(req, res) {
            return messageStatusController.removeMessageStatus(req, function(err, messageStatuses) {
                if (err) return res.status(500).send(err)
                else {
                    res.status(200).send(messageStatuses)
                }
            })
        })
}

module.exports = messageStatusRouters;
