/**
 * Created by TBS on 21/02/2017.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var botSchema = new Schema(
    {
        name: String,
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }

    },
    { timestamp: true }
)

var Bot = mongoose.model('Bot', botSchema);
module.exports = Bot;