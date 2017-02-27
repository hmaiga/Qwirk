/**
 * Created by TBS on 16/02/2017.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var statusSchema = new Schema(
    {
        name: String
    }, {timestamps: true} );


var Status = mongoose.model('Status', statusSchema);
module.exports = Status;
