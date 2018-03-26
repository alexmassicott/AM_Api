"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
exports.tagSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        hashKey: true
    },
    posts: { type: [String] },
    creation_timestamp: { type: Number, default: Math.floor(Date.now() / 1000) }
});
exports.Tags = mongoose_1.model('Tags', exports.tagSchema);
//# sourceMappingURL=Tags.js.map