"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    username: { type: String, hashKey: true, required: true },
    password: { type: String },
    role: { type: String },
    creation_timestamp: { type: Number, default: Math.floor(Date.now() / 1000) },
    edit_timestamp: { type: Number, default: Math.floor(Date.now() / 1000) }
});
exports.User = mongoose_1.model('users', schema);
//# sourceMappingURL=User.js.map