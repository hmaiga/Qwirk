/**
 * Created by TBS on 21/02/2017.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var messageStatusSchema = new Schema(
    {
        status: String
    },
    { timestamp: true }
)

var MessageStatus = mongoose.model('MessageStatus', messageStatusSchema);
module.exports = MessageStatus;