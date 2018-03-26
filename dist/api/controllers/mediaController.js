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
const async = require("async");
const _ = require("lodash");
const tinify = require("tinify");
const Posts_1 = require("../models/Posts");
const MediaObjects_1 = require("../models/MediaObjects");
const mediautils_1 = require("../utils/mediautils");
const errorconstants_1 = require("../constants/errorconstants");
const gm = require('gm').subClass({
    imageMagick: true
});
const uuid = require('uuid4');
tinify.key = process.env.TINIFY_KEY;
const bucketName = 'alexmassbucket';
let pathParams, image, imageName, srcKey, typeMatch, filetype;
const srcBucket = bucketName;
const dstBucket = `${bucketName}-output`;
// /////////////////////////////////////////
function cropImage(req, res, next) {
    let cropdata;
    const _sizeArray = [req.body.crop_ratio];
    async.forEachOf(_sizeArray, (value, key, cb) => {
        console.log(value);
        async.waterfall([
            function download(next2) {
                console.time('downloadImage');
                s3_1.s3.getObject({
                    Bucket: srcBucket,
                    Key: srcKey
                }, next);
                console.timeEnd('downloadImage');
            },
            function processImage(response, next2) {
                const cropdataparse = req.body.crop_data.split(',');
                const x = parseInt(cropdataparse[0]);
                const y = parseInt(cropdataparse[1]);
                const width = parseInt(cropdataparse[2]);
                const height = parseInt(cropdataparse[3]);
                gm(response.Body, `${imageName}.${filetype}`)
                    .crop(width, height, x, y)
                    .toBuffer(filetype.toUpperCase(), (err, buffer) => {
                    if (err)
                        return next(err);
                    tinify.fromBuffer(buffer).toBuffer((err, resultData) => {
                        if (err)
                            next(err);
                        gm(resultData).filesize((err, filesize) => {
                            if (err)
                                next(err);
                            const bytesize = filesize.split('B');
                            const _filesize = `${Math.floor(parseInt(bytesize[0]) / 1000)}kb`;
                            cropdata = {
                                extension: filetype,
                                file_size: _filesize,
                                crop: {
                                    x,
                                    y,
                                    width,
                                    height
                                },
                                url: `${'images/' + `${imageName}` + '.'}${_sizeArray[key]}.${filetype}`,
                                status: 'processed'
                            };
                            next2(null, buffer);
                        });
                    });
                });
            },
            function uploadResize(crop, next2) {
                s3_1.s3.putObject({
                    Bucket: dstBucket,
                    Key: `${'images/' + `${imageName}` + '.'}${value}.${filetype}`,
                    Body: crop,
                    ContentType: filetype.toUpperCase()
                }, next2);
            }
        ], (err, result) => {
            if (err)
                next(err);
            else {
                console.log(`End of step ${value}`);
                cb();
            }
        });
    }, (err, result) => {
        if (err)
            next(err);
        try {
            mediautils_1.updateCropData(req.body.id, req.body.crop_ratio, cropdata);
            res.json({ status: 'success' });
        }
        catch (err) {
            next(err);
        }
    });
}
function updatemedia(req, res, next) {
    const image = req.files.file_data[0];
    const typeMatch = req.files.file_data[0].originalname.match(/\.([^.]*)$/);
    const filetype = typeMatch[1].toLowerCase();
    const imageName = req.body.id;
    const url = `${'images/' + `${imageName}` + '.'}${filetype}`;
    const metadata = _.pick(req.files.file_data[0], ['originalname', 'size', 'mimetype', 'encoding']);
    metadata.url = url;
    if (req.body.type == 'image') {
        tinify.fromBuffer(req.files.file_data[0].buffer).toBuffer((err, resultData) => {
            if (err)
                next(err);
            const s3params = {
                Bucket: bucketName,
                Key: url,
                Body: resultData,
                ContentType: `image/${filetype}`
            };
            s3_1.s3.putObject(s3params, (err, data) => {
                if (err)
                    next(err);
                try {
                    mediautils_1.updateOriginalData(req.body.id, 'complete', metadata);
                    res.json({ status: 'success' });
                }
                catch (err) {
                    next(err);
                }
            });
        });
    }
    else if (req.body.type == 'video') {
        const s3params = {
            Bucket: bucketName,
            Key: url,
            Body: req.files.file_data[0].buffer,
            ContentType: `image/${filetype}`
        };
        s3_1.s3.putObject(s3params, (err, data) => {
            if (err)
                next(err);
            try {
                mediautils_1.updateVideoData(req, 'complete', metadata);
                res.json({ status: 'success' });
            }
            catch (err) {
                next(err);
            }
        });
    }
}
function cropmedia(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        imageName = req.body.id;
        try {
            const data = yield mediautils_1.getFullMedia(req.body.id);
            if (data.original_data) {
                srcKey = data.original_data.url;
                typeMatch = srcKey.match(/\.([^.]*)$/);
                filetype = typeMatch[1].toLowerCase();
                cropImage(req, res, next);
            }
            else
                throw "Couldn't find original image for media object";
        }
        catch (err) {
            next(err);
        }
    });
}
function createmedia(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const postid = req.body.post_id;
        const mediaid = uuid().replace(/-/g, '');
        const timestamp = Date.now() / 1000;
        const mediaobj = {
            id: mediaid,
            post_id: postid,
            creation_timestamp: timestamp,
            edit_timestamp: timestamp,
            status: 'new',
            number_of_changes: 0,
            data: {
                status: 'new'
            }
        };
        try {
            const data = yield mediautils_1.getPostLom(postid);
            const list_of_media = data.list_of_media;
            list_of_media.push(mediaobj);
            Posts_1.Posts.update({ id: postid }, { list_of_media })
                .then(() => Promise.resolve(MediaObjects_1.Media.create(mediaobj)))
                .then(() => {
                res.json({
                    status: 'success',
                    data: {
                        id: mediaid
                    }
                });
            });
        }
        catch (err) {
            next(err);
        }
    });
}
function get_a_media(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const id = req.query.id;
        try {
            const mo = yield mediautils_1.getFullMedia(id);
            res.json({
                status: 'success',
                data: {
                    media: [mo]
                }
            });
        }
        catch (err) {
            next(err);
        }
    });
}
function get_medialist(req, res, next) {
    console.log('in list');
    const post_id = req.query.post_id;
    mediautils_1.getPostLom(post_id)
        .then((data) => {
        res.json({
            status: 'success',
            data: {
                media: data.list_of_media
            }
        });
    })
        .catch((err) => {
        next(err);
    });
}
function deletemedia(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const post_id = req.body.post_id;
        const media_id = req.body.id;
        try {
            const data = yield Posts_1.Posts.update({ id: post_id }, { $pullAll: { list_of_media: [media_id] } });
            MediaObjects_1.Media.remove({ _id: media_id });
            res.json({ status: 'success' });
        }
        catch (err) {
            next(err);
        }
    });
}
exports.update_a_media = function (req, res, next) {
    if (req.user.role !== 'admin')
        next(new Error(errorconstants_1.PERMISSION_ERROR));
    if (req.body.action == 'upload')
        updatemedia(req, res, next);
    else if (req.body.action == 'crop')
        cropmedia(req, res, next);
    else
        next(new Error('missing action parameters'));
};
exports.create_a_media = function (req, res, next) {
    if (req.user.role !== 'admin')
        next(new Error(errorconstants_1.PERMISSION_ERROR));
    if (req.body.post_id)
        createmedia(req, res, next);
    else
        next(new Error('post id or media id not specified'));
};
exports.delete_a_media = function (req, res, next) {
    if (req.user.role !== 'admin')
        next(new Error(errorconstants_1.PERMISSION_ERROR));
    if (req.body.id)
        deletemedia(req, res, next);
    else
        next(new Error('post id or media id not specified'));
};
exports.show_media = function (req, res, next) {
    if (req.user.role !== 'admin')
        next(new Error(errorconstants_1.PERMISSION_ERROR));
    if (req.query.post_id)
        get_medialist(req, res, next);
    else if (req.query.id)
        get_a_media(req, res, next);
    else
        next(new Error('post id or media id not specified'));
};
//# sourceMappingURL=mediaController.js.map