'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const Schema = database_1.dynamoose.Schema;
exports.contentSchema = new Schema({
    feed: {
        type: String,
        required: true,
        hashKey: true
    },
    posts: { type: [String] },
    edit_timestamp: {
        type: Number,
        default: Math.floor(Date.now() / 1000)
    }
}, {
    forceDefault: true
});
exports.Content = database_1.dynamoose.model('content', exports.contentSchema);
//# sourceMappingURL=Content.js.map