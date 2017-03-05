/**
 * Created by TBS on 26/02/2017.
 */
var typeMessageController = require('./../controllers').typeMessage

var typeMessageRouters = function typeMessageRouters(router) {
    router.route('/typeMessages')
        .get(function(req, res) {
            params = req.query.filter ? JSON.parse(req.query.filter) : {}
            return typeMessageController.getTypeMessages(params, function(err, typeMessages) {
                if (err) return res.status(500).send(err)
                else {
                    res.status(200).send(typeMessages)
                }
            })
        })

        .post(function(req, res) {
            return typeMessageController.addTypeMessage(req.body, function(err, newTypeMessage) {
                if (err) return res.status(500).send(err);
                else {
                    res.status(200).send(newTypeMessage);
                }
            })
        })

        .put(function(req, res) {
            return typeMessageController.updateTypeMessage(req.body, function(err, updatedTypeMessage) {
                if (err) return res.status(500).send(err);
                else {
                    res.status(200).send(updatedTypeMessage);
                }
            })
        });

    router.route('/removetypeMessage')
        .post(function(req, res) {
            return typeMessageController.removeTypeMessage(req, function(err, typeMessages) {
                if (err) return res.status(500).send(err)
                else {
                    res.status(200).send(typeMessages)
                }
            })
        })
}

module.exports = typeMessageRouters;
