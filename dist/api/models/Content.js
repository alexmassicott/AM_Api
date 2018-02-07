'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
let Schema = database_1.dynamoose.Schema;
let moment = require('moment');
exports.contentSchema = new Schema({
    feed: {
        type: String,
        required: true,
        hashKey: true
    },
    posts: { type: [String] },
    edit_timestamp: {
        type: Number,
        default: moment().unix()
    }
}, {
    forceDefault: true
});
exports.Content = database_1.dynamoose.model('content', exports.contentSchema);
//# sourceMappingURL=Content.js.map