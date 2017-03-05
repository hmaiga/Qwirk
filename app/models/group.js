/**
 * Created by TBS on 16/02/2017.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var groupSchema = new Schema(
    {
        name: String,
        description: String,
        members: [{
            type: Schema.Types.ObjectId,
            ref: 'User'
        }],
        isPublic: Boolean,
        owner: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        moderators: [{
            type: Schema.Types.ObjectId,
            ref: 'Moderator'
        }],
        kickBanUsers: [{
            type: Schema.Types.ObjectId,
            ref: 'KickBanUser'
        }]
    }, {timestamps: true} );


var Group = mongoose.model('Group', groupSchema);
module.exports = Group;
