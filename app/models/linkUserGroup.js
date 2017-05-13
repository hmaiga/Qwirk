/**
 * Created by TBS on 09/05/2017.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var linkUserGroupSchema = new Schema(
    {
        group: {
            type: Schema.Types.ObjectId,
            ref: 'Group'
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        isPending: Boolean,
        isKicked: Boolean,
        isBanned: Boolean,
        isAccepted: Boolean
    }, {timestamps: true} );


var LinkUserGroup = mongoose.model('LinkUserGroup', linkUserGroupSchema);
module.exports = LinkUserGroup;
