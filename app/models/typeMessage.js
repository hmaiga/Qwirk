/**
 * Created by TBS on 16/02/2017.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var typeMessageSchema = new Schema(
    {
        type: String
    }, {timestamps: true} );


var TypeMessage = mongoose.model('TypeMessage', typeMessageSchema);
module.exports = TypeMessage;

