/**
 * Created by TBS on 26/02/2017.
 */
var botController = require('./../controllers').bot

var botRouters = function botRouters(router) {
    router.route('/bots')
        .get(function(req, res) {
            params = req.query.filter ? JSON.parse(req.query.filter) : {};
            return botController.getBots(params, function(err, bots) {
                if (err) return res.status(500).send(err)
                else {
                    res.status(200).send(bots)
                }
            })
        })

        .post(function(req, res) {
            return botController.addBot(req.body, function(err, newBot) {
                if (err) return res.status(500).send(err);
                else {
                    res.status(200).send(newBot);
                }
            })
        })

        .put(function(req, res) {
            return botController.updateBot(req.body, function(err, updatedBot) {
                if (err) return res.status(500).send(err);
                else {
                    res.status(200).send(updatedBot);
                }
            })
        });

    router.route('/removeuser')
        .post(function(req, res) {
            return botController.removeBot(req, function(err, bots) {
                if (err) return res.status(500).send(err)
                else {
                    res.status(200).send(bots)
                }
            })
        })

    router.route('/api/botmessages')
        .post(function(req, res) {
            return botController.sendMessages(req, function(err, bots) {
                if (err) return res.status(500).send(err)
                else {
                    res.status(200).send(bots)
                }
            })
        })
}

module.exports = botRouters;