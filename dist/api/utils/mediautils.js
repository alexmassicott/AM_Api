"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/* Expressions for AWS
*/
const Posts_1 = require("../models/Posts");
const MediaObjects_1 = require("../models/MediaObjects");
function getPostLom(post_id) {
    return __awaiter(this, void 0, void 0, function* () {
        const lom = yield Posts_1.Posts.findById(post_id)
            .select('list_of_media')
            .populate('list_of_media');
        return lom;
    });
}
exports.getPostLom = getPostLom;
function getFullMedia(media_id) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield MediaObjects_1.Media.findById(media_id);
        return data;
    });
}
exports.getFullMedia = getFullMedia;
function updateCropData(_id, _size, _cd) {
    return __awaiter(this, void 0, void 0, function* () {
        const media = yield getFullMedia(_id);
        media.data[_size] = _cd;
        media.edit_timestamp = Date.now() / 1000;
        media.number_of_changes += 1;
        media.save();
    });
}
exports.updateCropData = updateCropData;
function updateOriginalData(_id, _status, file) {
    return __awaiter(this, void 0, void 0, function* () {
        const media = yield getFullMedia(_id);
        media.original_data = file;
        media.status = _status;
        media.number_of_changes += 1;
        media.edit_timestamp = Date.now() / 1000;
        media.save();
    });
}
exports.updateOriginalData = updateOriginalData;
function updateVideoData(req) { }
exports.updateVideoData = updateVideoData;
//# sourceMappingURL=mediautils.js.map