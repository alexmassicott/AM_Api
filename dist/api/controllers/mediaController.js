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
let gm = require('gm').subClass({
    imageMagick: true
});
let uuid = require('uuid4');
////////////////////////////////////////
tinify.key = process.env.TINIFY_KEY;
const bucketName = 'alexmassbucket';
let pathParams, image, imageName, srcKey, typeMatch, filetype;
let srcBucket = bucketName;
let dstBucket = bucketName + '-output';
///////////////////////////////////////////
function updatemedia(req, res, next) {
    console.log("i'm in this bitch");
    image = req.files["file_data"][0];
    typeMatch = req.files["file_data"][0].originalname.match(/\.([^.]*)$/);
    filetype = typeMatch[1].toLowerCase();
    imageName = req.body.id;
    var url = 'images/' + `${imageName}` + "." + filetype;
    var metadata = _.pick(req.files["file_data"][0], ['originalname', 'size', 'mimetype', 'encoding']);
    metadata.url = url;
    tinify.fromBuffer(req.files["file_data"][0].buffer).toBuffer(function (err, resultData) {
        if (err)
            next(err);
        let s3params = {
            Bucket: bucketName,
            Key: url,
            Body: resultData,
            ContentType: 'image/' + filetype
        };
        s3_1.s3.putObject(s3params, function (err, data) {
            if (err)
                next(err);
            try {
                mediautils_1.updateOriginalData(req.body.id, "complete", metadata);
                res.json({ status: "success" });
            }
            catch (err) {
                next(err);
            }
        });
    });
}
;
function cropmedia(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let post_id;
        let cropdata;
        console.log("crop life");
        imageName = req.body.id;
        try {
            const data = yield mediautils_1.getFullMedia(req.body.id);
            console.log(data.list_of_media);
            var _sizeArray = [req.body.crop_ratio];
            let mo = data.list_of_media.filter(function (a) { return a.id == req.body.id; });
            if (mo[0].original_data) {
                console.log("yea boy");
                srcKey = mo[0].original_data.url;
                console.log("srcKey is" + srcKey);
                typeMatch = srcKey.match(/\.([^.]*)$/);
                filetype = typeMatch[1].toLowerCase();
                cropImage();
            }
            else
                throw ("Couldn't find original image for media object");
        }
        catch (err) {
            next(err);
        }
        function cropImage() {
            async.forEachOf(_sizeArray, function (value, key, cb) {
                console.log(value);
                async.waterfall([
                    function download(next2) {
                        console.time("downloadImage");
                        s3_1.s3.getObject({
                            Bucket: srcBucket,
                            Key: srcKey
                        }, next);
                        console.timeEnd("downloadImage");
                    },
                    function processImage(response, next2) {
                        let cropdataparse = req.body.crop_data.split(",");
                        let x = parseInt(cropdataparse[0]);
                        let y = parseInt(cropdataparse[1]);
                        let width = parseInt(cropdataparse[2]);
                        let height = parseInt(cropdataparse[3]);
                        gm(response.Body, imageName + "." + filetype).crop(width, height, x, y).toBuffer(filetype.toUpperCase(), function (err, buffer) {
                            if (err)
                                return next(err);
                            tinify.fromBuffer(buffer).toBuffer(function (err, resultData) {
                                if (err)
                                    next(err);
                                gm(resultData).filesize(function (err, filesize) {
                                    if (err)
                                        next(err);
                                    var bytesize = filesize.split("B");
                                    var _filesize = Math.floor(parseInt(bytesize[0]) / 1000) + "kb";
                                    cropdata = {
                                        "extension": filetype,
                                        "file_size": _filesize,
                                        "crop": {
                                            "x": x,
                                            "y": y,
                                            "width": width,
                                            "height": height
                                        },
                                        "url": 'images/' + `${imageName}` + "." + _sizeArray[key] + "." + filetype,
                                        "status": "processed"
                                    };
                                    next2(null, buffer);
                                });
                            });
                        });
                    },
                    function uploadResize(crop, next2) {
                        s3_1.s3.putObject({
                            Bucket: dstBucket,
                            Key: 'images/' + `${imageName}` + "." + value + "." + filetype,
                            Body: crop,
                            ContentType: filetype.toUpperCase()
                        }, next2);
                    }
                ], (err, result) => {
                    if (err)
                        next(err);
                    else {
                        console.log("End of step " + value);
                        cb();
                    }
                });
            }, (err, result) => {
                if (err)
                    next(err);
                try {
                    mediautils_1.updateCropData(req.body.id, req.body.crop_ratio, cropdata);
                    res.json({ "status": "success" });
                }
                catch (err) {
                    next(err);
                }
            });
        }
    });
}
function createmedia(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const postid = req.body.post_id;
        const mediaid = uuid().replace(/-/g, '');
        const timestamp = Date.now() / 1000;
        const mediaobj = {
            "id": mediaid,
            "post_id": postid,
            "creation_timestamp": timestamp,
            "edit_timestamp": timestamp,
            "status": "new",
            "number_of_changes": 0,
            "data": {
                "status": "new"
            }
        };
        try {
            const data = yield mediautils_1.getPostLom(postid);
            let list_of_media = data.list_of_media;
            list_of_media.push(mediaobj);
            Posts_1.Posts.update({ id: postid }, { list_of_media: list_of_media })
                .then(() => {
                return Promise.resolve(MediaObjects_1.Media.create(mediaobj));
            })
                .then(() => {
                res.json({
                    "status": "success",
                    "data": {
                        "id": mediaid
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
            const data = yield mediautils_1.getFullMedia(id);
            const list_of_media = data.list_of_media;
            const mo = list_of_media.filter(function (a) { return a.id == id; })[0];
            res.json({
                "status": "success",
                "data": {
                    "media": [mo]
                }
            });
        }
        catch (err) {
            next(err);
        }
    });
}
function get_medialist(req, res, next) {
    console.log("in list");
    let post_id = req.query.post_id;
    mediautils_1.getPostLom(post_id).then((data) => {
        let sortedArray = data.list_of_media;
        if (sortedArray.length > 1) {
            sortedArray = data.list_of_media.sort(function (a, b) {
                let aa = a.creation_timestamp, bb = b.creation_timestamp;
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
        }
        res.json({
            "status": "success",
            "data": {
                "media": sortedArray
            }
        });
    }).catch((err) => {
        next(err);
    });
}
function deletemedia(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let post_id = req.body.post_id;
        let updatedList;
        let media_id = req.body.id;
        try {
            const data = yield mediautils_1.getPostLom(post_id);
            let updatedList = _.remove(data.list_of_media, {
                id: media_id
            });
            if (updatedList.length > 1) {
                updatedList = updatedList.sort(function (a, b) {
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
            }
            Posts_1.Posts.update({ list_of_media: updatedList })
                .then(() => Promise.resolve(MediaObjects_1.Media.delete({ id: media_id })))
                .then(() => {
                res.json({ "status": "success" });
            });
        }
        catch (err) {
            next(err);
        }
    });
}
exports.update_a_media = function (req, res, next) {
    if (req.user.role !== "admin")
        next(new Error("you don't have the admissions to perform this task"));
    if (req.body.action == "upload")
        updatemedia(req, res, next);
    else if (req.body.action == "crop")
        cropmedia(req, res, next);
    else
        next(new Error("missing action parameters"));
};
exports.create_a_media = function (req, res, next) {
    if (req.user.role !== "admin")
        next(new Error("you don't have the admissions to perform this task"));
    if (req.body.post_id)
        createmedia(req, res, next);
    else
        next(new Error("post id or media id not specified"));
};
exports.delete_a_media = function (req, res, next) {
    if (req.user.role !== "admin")
        next(new Error("you don't have the admissions to perform this task"));
    if (req.body.id)
        deletemedia(req, res, next);
    else
        next(new Error("post id or media id not specified"));
};
exports.show_media = function (req, res, next) {
    if (req.user.role !== "admin")
        next(new Error("you don't have the admissions to perform this task"));
    if (req.query.post_id)
        get_medialist(req, res, next);
    else if (req.query.id)
        get_a_media(req, res, next);
    else
        next(new Error("post id or media id not specified"));
};
//# sourceMappingURL=mediaController.js.map