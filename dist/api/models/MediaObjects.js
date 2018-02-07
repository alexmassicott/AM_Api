'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
let Schema = database_1.dynamoose.Schema;
let moment = require('moment');
exports.mediaSchema = new Schema({
    id: {
        type: String,
        required: true,
        hashKey: true
    },
    post_id: {
        type: String,
        default: null
    },
    creation_timestamp: { type: Number },
    edit_timestamp: {
        type: Number,
        default: moment().unix()
    }
});
exports.Media = database_1.dynamoose.model('mediaobjects', exports.mediaSchema);
//# sourceMappingURL=MediaObjects.js.map