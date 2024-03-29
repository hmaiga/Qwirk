/**
 * Created by TBS on 16/02/2017.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var messageSchema = new Schema(
    {
        sender: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        receiverUser: [{
            type: Schema.Types.ObjectId,
            ref: 'User'
        }],
        receiverGroup: {
            type: Schema.Types.ObjectId,
            ref: 'Group'
        },
        messageStatus: {
            type: Schema.Types.ObjectId,
            ref: 'MessageStatus'
        },
        queue: String,
        sendTime: Date,
        typeMessage: {
            type: Schema.Types.ObjectId,
            ref: 'TypeMessage'
        },
        media: Buffer,
        content: String
    }, {timestamps: true} );


var Message = mongoose.model('Message', messageSchema);
module.exports = Message;
