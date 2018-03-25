'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
exports.contentSchema = new mongoose_1.Schema({
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
exports.Content = mongoose_1.model('content', exports.contentSchema);
//# sourceMappingURL=Content.js.map