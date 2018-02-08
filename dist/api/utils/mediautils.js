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
/*Expressions for AWS
*/
const Posts_1 = require("../models/Posts");
const MediaObjects_1 = require("../models/MediaObjects");
function getPostLom(post_id) {
    return Posts_1.Posts.get({ id: post_id });
}
exports.getPostLom = getPostLom;
function getFullMedia(media_id) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield MediaObjects_1.Media.get({ id: media_id });
        const post = yield getPostLom(data.post_id);
        return post;
    });
}
exports.getFullMedia = getFullMedia;
function updateCropData(_id, _size, _cd) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield getFullMedia(_id);
        let _pid = data.id;
        let _lom = data.list_of_media;
        let mo = _lom.filter(function (a) { return a.id == _id; })[0];
        mo.data[_size] = _cd;
        mo.edit_timestamp = Date.now() / 1000;
        mo.number_of_changes += 1;
        let index = _lom.map(function (e) { return e.id; }).indexOf(_id);
        _lom[index] = mo;
        _lom = _lom.sort(function (a, b) {
            var aa = a.creation_timestamp, bb = b.creation_timestamp;
            //  console.log(aa);
            if (aa !== bb) {
                if (aa > bb) {
                    return 1;
                }
                if (aa < bb) {
                    return -1;
                }
            }
            return aa - bb;
        });
        return Promise.resolve(Posts_1.Posts.update({ id: _pid }, { list_of_media: _lom }));
    });
}
exports.updateCropData = updateCropData;
function updateOriginalData(_id, _status, file) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield getFullMedia(_id);
        const _pid = data.id;
        let _lom = data.list_of_media;
        let mo = _lom.filter(function (a) { return a.id == _id; })[0];
        mo.original_data = file;
        mo.status = _status;
        mo.number_of_changes += 1;
        mo.edit_timestamp = Date.now() / 1000;
        var index = _lom.map(function (e) { return e.id; }).indexOf(_id);
        _lom[index] = mo;
        _lom = _lom.sort(function (a, b) {
            var aa = a.creation_timestamp, bb = b.creation_timestamp;
            //  console.log(aa);
            if (aa !== bb) {
                if (aa > bb) {
                    return 1;
                }
                if (aa < bb) {
                    return -1;
                }
            }
            return aa - bb;
        });
        return Promise.resolve(Posts_1.Posts.update({ id: _pid }, { list_of_media: _lom }));
    });
}
exports.updateOriginalData = updateOriginalData;
//# sourceMappingURL=mediautils.js.map