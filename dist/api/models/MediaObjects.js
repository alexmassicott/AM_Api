'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const Schema = database_1.dynamoose.Schema;
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
    creation_timestamp: { type: Number, default: Date.now() / 1000 },
    edit_timestamp: { type: Number, default: Date.now() / 1000 }
});
exports.Media = database_1.dynamoose.model('mediaobjects', exports.mediaSchema);
//# sourceMappingURL=MediaObjects.js.map