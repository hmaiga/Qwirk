/**
 * Created by TBS on 16/02/2017.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var settingSchema = new Schema(
    {
        port: {
            type: Schema.Types.ObjectId,
            ref: 'Port'
        },
        downloadDestination: String,
        isActive: Boolean,
        date: String,
    }, {timestamps: true} );


var Setting = mongoose.model('Setting', settingSchema);
module.exports = Setting;
