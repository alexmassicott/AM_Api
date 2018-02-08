'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const Schema = database_1.dynamoose.Schema;
const schema = new Schema({
    username: { type: String, hashKey: true, required: true },
    password: { type: String },
    role: { type: String },
    creation_timestamp: { type: Number, default: Date.now() / 1000 },
    edit_timestamp: { type: Number, default: Date.now() / 1000 }
});
exports.User = database_1.dynamoose.model('users', schema);
//# sourceMappingURL=User.js.map