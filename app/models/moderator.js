/**
 * Created by TBS on 16/02/2017.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var moderatorSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        groups: [{
            type: Schema.Types.ObjectId,
            ref: 'Group'
        }]
    }, {timestamps: true} );


var Moderator = mongoose.model('Moderator', moderatorSchema);
module.exports = Moderator;
