"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const mongoose_1 = require("mongoose");
const cropSchema = {
    crop: {
        x: { type: Number, default: null },
        y: { type: Number, default: null },
        width: { type: Number, default: null },
        height: { type: Number, default: null }
    },
    status: { type: String, default: 'new' },
    number_of_changes: { type: Number, default: 0 },
    url: { type: String }
};
const mediaSchema = new mongoose_1.Schema({
    id: { type: String },
    post_id: String,
    original_data: {
        originalname: String,
        mimetype: String,
        url: String,
        size: Number,
        cover_image: cropSchema
    },
    creation_timestamp: {
        type: Number,
        default: Math.floor(Date.now() / 1000)
    },
    edit_timestamp: {
        type: Number,
        default: Math.floor(Date.now() / 1000)
    },
    type: String,
    status: String,
    number_of_changes: { type: Number, default: 0 },
    data: {
        mp4: cropSchema,
        '1x1': cropSchema,
        '1x2': cropSchema,
        '3x1': cropSchema,
        '3x2': cropSchema,
        '2x1': cropSchema,
        '16x9': cropSchema
    }
});
mediaSchema.set('toJSON', {
    transform(doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});
exports.Media = database_1.mongoose.model('Media', mediaSchema, 'Media');
//# sourceMappingURL=MediaObjects.js.map