'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
let Schema = database_1.dynamoose.Schema;
let moment = require('moment');
exports.tagSchema = new Schema({
    name: {
        type: String,
        required: true,
        hashKey: true
    },
    posts: { type: [String] },
    creation_timestamp: { type: Number },
    edit_timestamp: {
        type: Number,
        default: moment().unix()
    }
}, {
    forceDefault: true
});
exports.Tags = database_1.dynamoose.model('Tags', exports.tagSchema);
//# sourceMappingURL=Tags.js.map