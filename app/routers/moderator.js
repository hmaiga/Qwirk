/**
 * Created by TBS on 26/02/2017.
 */
var moderatorController = require('./../controllers').moderator

var moderatorRouters = function moderatorRouters(router) {
    router.route('/moderators')
        .get(function(req, res) {
            // params = req.query.filter ? JSON.parse(req.query.filter) : {};
            return moderatorController.getModerators(req.params, function(err, moderators) {
                if (err) return res.status(500).send(err)
                else {
                    res.status(200).send(moderators)
                }
            })
        })

        .post(function(req, res) {
            return moderatorController.addModerator(req.body, function(err, newModerator) {
                if (err) return res.status(500).send(err);
                else {
                    res.status(200).send(newModerator);
                }
            })
        })

        .put(function(req, res) {
            return moderatorController.updateModerator(req.body, function(err, updatedModerator) {
                if (err) return res.status(500).send(err);
                else {
                    res.status(200).send(updatedModerator);
                }
            })
        });

    router.route('/removemoderator')
        .post(function(req, res) {
            return moderatorController.removeModerator(req, function(err, moderators) {
                if (err) return res.status(500).send(err)
                else {
                    res.status(200).send(moderators)
                }
            })
        })
}

module.exports = moderatorRouters;