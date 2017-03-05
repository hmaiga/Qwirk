/**
 * Created by TBS on 26/02/2017.
 */
var settingModel = require('./../models').setting

var settingController = {
    addSetting: function addSetting(params, callback) {
        var newSetting = new settingModel(params)
        return newSetting.save(function onSaveSetting(err, savedSetting) {
            if (err) return callback(err)
            else {
                return callback(null, savedSetting)
            }
        })
    },

    getSettings: function getSettings(params, callback) {
        return settingModel.find(params, function onGetSettings(err, arraySettings) {
            if (err) return callback(err)
            else {
                return callback(null, arraySettings)
            }
        })
    },

    updateSetting: function updateSetting(params, callback) {
        settingModel.findOne({id : params.id}, function(err, settingFound) {
            if (err) return callback(err)
            if (!settingFound) return callback("Aucun paramètre n'a été trouvé")
            else {
                for(var key in settingFound) {
                    if (key === 'id') {continue;}
                    settingFound[key] = params[key];
                }

                return settingFound.save(function onSaveUpdateSetting(err, updatedSetting) {
                    if (err) callback(err)
                    else {
                        return callback(null, updatedSetting)
                    }
                })
            }
        })

    },

    removeSetting: function removeSetting(params, callback) {
        return settingModel.remove(params, function onRemoveSetting(err, removedSetting) {
            if (err) return callback(err)
            else {
                return callback(null, removedSetting)
            }
        })
    }
}

module.exports = settingController;
