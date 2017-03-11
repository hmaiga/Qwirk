/**
 * Created by TBS on 26/02/2017.
 */
var statusModel = require('./../models').status

var statusController = {
    addStatus: function addStatus(params, callback) {
        var newStatus = new statusModel(params)
        return newStatus.save(function onSaveStatus(err, savedStatus) {
            if (err) return callback(err)
            else {
                return callback(null, savedStatus)
            }
        })
    },

    getStatuses: function getStatuses(params, callback) {
        return statusModel.find(params, function onGetStatuses(err, arrayStatus) {
            if (err) return callback(err)
            else {
                return callback(null, arrayStatus)
            }
        })
    },

    updateStatus: function updateStatus(params, callback) {
        statusModel.findOne({_id : params._id}, function(err, statusFound) {
            if (err) return callback(err)
            if (!statusFound) return callback("Aucun status n'a été trouvé")
            else {
                for(var key in params) {
                    if (key === '_id') {continue;}
                    if (statusFound[key]) {
                        statusFound[key] = params[key];
                    }
                }

                return statusFound.save(function onSaveUpdateStatus(err, updatedStatus) {
                    if (err) callback(err)
                    else {
                        return callback(null, updatedStatus)
                    }
                })
            }
        })

    },

    removeStatus: function removeStatus(params, callback) {
        return statusModel.remove(params, function onRemoveStatus(err, removedStatus) {
            if (err) return callback(err)
            else {
                return callback(null, removedStatus)
            }
        })
    }
}

module.exports = statusController;
