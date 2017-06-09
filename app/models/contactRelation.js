/**
 * Created by Housseini  Maiga on 5/23/2017.
 */
let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let contactRelationSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'Contact'
        },
        userContact: {
            type: Schema.Types.ObjectId,
            ref: 'Contact'
        },
        isPending: {
            type: Boolean
        },
        userEmail: {
            type: String,
            unique: false
        },
        userContactEmail: {
            type: String,
            unique: false
        },
        token: {
            type: String
        },

    }, {timestamps: true} );


let ContactRelation = mongoose.model('ContactRelation', contactRelationSchema);
module.exports = ContactRelation;
