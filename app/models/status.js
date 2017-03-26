/**
 * Created by TBS on 16/02/2017.
 */
let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let statusSchema = new Schema(
    {
        name: String,
        color : String
    }, {timestamps: true} );


let Status = mongoose.model('Status', statusSchema);
module.exports = Status;
