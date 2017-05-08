/**
 * Created by TBS on 26/02/2017.
 */
var statusController = require('./../controllers').status;
let jwt = require('express-jwt');

let config = require('./../../config/');

let PARAM = config.secret;
let auth = jwt({
    secret: config.secret['PARAM'].secret,
    userProperty: 'payload'
});

var statusRouters = function statusRouters(router) {
    router.route('/statuses')
        .get(function(req, res) {
            params = req.query.filter ? JSON.parse(req.query.filter) : {};
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

    router.get('/currentStatus', auth, function (req, res, next) {
        statusController.getStatusByName(req, res, function (err, status) {
            if (err) return res.status(500).send(err);
            else {
                res.status(200).send(status);
            }
        })
    })
    
    router.post('/currentStatus', auth, function (req, res, next) {
        statusController.updateUserStatus(req, res, function (err, status) {
            if (err) return res.status(500).json(err);
            res.status(200).json("Success");
        })
    })
};

module.exports = statusRouters;
