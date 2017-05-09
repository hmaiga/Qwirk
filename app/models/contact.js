/**
 * Created by Housseini  Maiga on 5/2/2017.
 */
let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let contactSchema = new Schema(
    {
        owner: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        contact: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        nickname: {
            type: String
        },
        email: {
            type: String
        },
        isBlocked: {
            type: Boolean
        },
        isPending: {
            type: Boolean
        },
        isReceived: {
            type: Boolean
        },
        token: {
            type: String
        },

    }, {timestamps: true} );


let Contact = mongoose.model('Contact', contactSchema);
module.exports = Contact;
