/**
 * Created by TBS on 21/02/2017.
 */
var groupController = require('./../controllers').group

var groupRouters = function groupRouters(router) {
    router.route('/groups/:user_id')
        .get(function(req, res) {
            // params = req.query.filter ? JSON.parse(req.query.filter) : {};
            return groupController.getGroups(req.params, function(err, groups) {
                if (err) return res.status(500).send(err)
                else {
                    res.status(200).send(groups)
                }
            })
        })
    router.route('/groups')
        .post(function(req, res) {
            return groupController.addGroup(req.body, function(err, newGroup) {
                if (err) return res.status(500).send(err);
                else {
                    res.status(200).send(newGroup);
                }
            })
        })

        .put(function(req, res) {
            return groupController.updateGroup(req.body, function(err, updatedGroup) {
                if (err) return res.status(500).send(err);
                else {
                    res.status(200).send(updatedGroup);
                }
            })
        });

    router.route('/removegroup')
        .post(function(req, res) {
            return groupController.removeGroup(req.body, function(err, groups) {
                if (err) return res.status(500).send(err)
                else {
                    res.status(200).send(groups)
                }
            })
        })
}

module.exports = groupRouters;