/**
 * Created by Housseini  Maiga on 5/2/2017.
 */
let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let contactSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        contactEmail: {
            type: String,
            unique: false
        },
        nickname: {
            type: String
        },
        isBlocked: {
            type: Boolean
        },
        isRefuse: {
            type: Boolean,
            default: false
        },
        relationId: {
            type: Schema.Types.ObjectId,
            ref: 'ContactRelation'
        }
        // isReceived: {
        //     type: Boolean
        // },
    }, {timestamps: true});

let Contact = mongoose.model('Contact', contactSchema);
module.exports = Contact;