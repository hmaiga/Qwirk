/**
 * Created by TBS on 26/02/2017.
 */
var settingController = require('./../controllers').setting

var settingRouters = function settingRouters(router) {
    router.route('/settings')
        .get(function(req, res) {
            // params = req.query.filter ? JSON.parse(req.query.filter) : {};
            return settingController.getSettings(req.params, function(err, settings) {
                if (err) return res.status(500).send(err)
                else {
                    res.status(200).send(settings)
                }
            })
        })

        .post(function(req, res) {
            return settingController.addSetting(req.body, function(err, newSetting) {
                if (err) return res.status(500).send(err);
                else {
                    res.status(200).send(newSetting);
                }
            })
        })

        .put(function(req, res) {
            return settingController.updateSetting(req.body, function(err, updatedSetting) {
                if (err) return res.status(500).send(err);
                else {
                    res.status(200).send(updatedSetting);
                }
            })
        });

    router.route('/removesetting')
        .post(function(req, res) {
            return settingController.removeSetting(req, function(err, settings) {
                if (err) return res.status(500).send(err)
                else {
                    res.status(200).send(settings)
                }
            })
        })
}

module.exports = settingRouters;
