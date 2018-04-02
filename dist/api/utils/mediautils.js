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
const s3_1 = require("../config/s3");
const Posts_1 = require("../models/Posts");
const MediaObjects_1 = require("../models/MediaObjects");
const dstBucket = 'alexmassbucket-output';
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
function updateVideoData(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const mp4FileName = `${req.body.id}.mp4`;
        try {
            const params = {
                Body: req.files.file_data[0].buffer,
                Bucket: dstBucket,
                Key: `media/${mp4FileName}`
            };
            s3_1.s3.putObject(params, (err, data) => __awaiter(this, void 0, void 0, function* () {
                if (err)
                    throw err;
                console.log('success with updateVideoData');
                const media = yield getFullMedia(req.body.id);
                media.data.mp4.status = 'uploaded';
                media.type = 'video';
                media.data.mp4.url = `media/${mp4FileName}`;
                media.data.mp4.size = req.files.file_data[0].size;
                media.save();
                res.json({ status: 'success' });
            }));
        }
        catch (err) {
            console.log('errror');
            console.log(err);
            next(err);
        }
    });
}
exports.updateVideoData = updateVideoData;
//# sourceMappingURL=mediautils.js.map