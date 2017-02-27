/**
 * Created by TBS on 26/02/2017.
 */
var statusController = require('./../controllers').status

var statusRouters = function statusRouters(router) {
    router.route('/statuses')
        .get(function(req, res) {
            params = req.query.filter ? JSON.parse(req.query.filter) : {}
            return statusController.getStatuses(params, function(err, statuses) {
                if (err) return res.status(500).send(err)
                else {
                    res.status(200).send(statuses)
                }
            })
        })

        .post(function(req, res) {
            return statusController.addStatus(req.body, function(err, newStatus) {
                if (err) return res.status(500).send(err);
                else {
                    res.status(200).send(newStatus);
                }
            })
        })

        .put(function(req, res) {
            return statusController.updateStatus(req.body, function(err, updatedStatus) {
                if (err) return res.status(500).send(err);
                else {
                    res.status(200).send(updatedStatus);
                }
            })
        });

    router.route('/removestatus')
        .post(function(req, res) {
            return statusController.removeStatus(req, function(err, statuss) {
                if (err) return res.status(500).send(err)
                else {
                    res.status(200).send(statuss)
                }
            })
        })
}

module.exports = statusRouters;
