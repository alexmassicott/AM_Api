'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const Posts_1 = require("../models/Posts");
const MediaObjects_1 = require("../models/MediaObjects");
const errorconstants_1 = require("../constants/errorconstants");
let setTags = require("../utils/updatetags");
let uuid = require('uuid4');
function get_a_post(req, res, next) {
    console.log(req.query.id);
    const id = req.query.id;
    Posts_1.Posts.get({ id: id })
        .then(items => {
        const response = {
            status: "success",
            data: {
                more_available: false,
                LastEvaluatedKey: 0,
                number_of_posts_returned: items.length,
                "posts": [items]
            }
        };
        res.json(response);
    })
        .catch((err) => { next(err); });
}
;
function get_a_type(req, res, next) {
    let type = req.query.type;
    Posts_1.Posts.query("type").eq(type).descending().startAt(req.query.offset).limit(req.query.limit).exec()
        .then(items => {
        const response = {
            status: "success",
            data: {
                more_available: items.lastKey ? true : false,
                LastEvaluatedKey: items.lastKey ? items.lastKey : 0,
                number_of_posts_returned: items.length,
                "posts": items
            }
        };
        res.json(response);
    })
        .catch((err) => { next(err); });
}
;
function getUpdatepostParams(body) {
    var data = {};
    if (body.new_client) {
        data.client = body.new_client;
    }
    if (body.new_title) {
        data.title = body.new_title;
    }
    if (body.new_summary) {
        data.summary = body.new_summary;
    }
    if (body.new_link) {
        data.link = body.new_link;
    }
    if (body.redirect_link) {
        data.redirect_link = body.redirect_link;
    }
    if (body.new_publication_status) {
        data.publication_status = body.new_publication_status;
    }
    if (body.new_featured === true || body.new_featured === false) {
        data.featured = body.new_featured;
    }
    data.edit_timestamp = Math.floor(Date.now() / 1000);
    return data;
}
function createpost(req, res, next) {
    var postid = uuid().replace(/-/g, '');
    var mediaid = uuid().replace(/-/g, '');
    var timestamp = Math.floor(Date.now() / 1000);
    var mediaobj = { "id": mediaid, "post_id": postid };
    var full_mediaobj = {
        "id": mediaid,
        "post_id": postid,
        creation_timestamp: timestamp,
        edit_timestamp: timestamp,
        "status": "new",
        "number_of_changes": 0,
        "data": {
            "1x1": {
                "status": "new",
                "number_of_changes": 0,
                "crop": {
                    "x": 0,
                    "y": 0,
                    "width": 0,
                    "height": 0
                }
            },
            "1x2": {
                "status": "new",
                "number_of_changes": 0,
                "crop": {
                    "x": 0,
                    "y": 0,
                    "width": 0,
                    "height": 0
                }
            },
            "2x1": {
                "status": "new",
                "number_of_changes": 0,
                "crop": {
                    "x": 0,
                    "y": 0,
                    "width": 0,
                    "height": 0
                }
            },
            "3x2": {
                "status": "new",
                "number_of_changes": 0,
                "crop": {
                    "x": 0,
                    "y": 0,
                    "width": 0,
                    "height": 0
                }
            },
            "3x1": {
                "status": "new",
                "number_of_changes": 0,
                "crop": {
                    "x": 0,
                    "y": 0,
                    "width": 0,
                    "height": 0
                }
            },
            "16x9": {
                "status": "new",
                "number_of_changes": 0,
                "crop": {
                    "x": 0,
                    "y": 0,
                    "width": 0,
                    "height": 0
                }
            }
        }
    };
    MediaObjects_1.Media.create(mediaobj)
        .then(() => {
        return Promise.resolve(Posts_1.Posts.create({ id: postid, type: req.body.type, list_of_media: [full_mediaobj] }));
    })
        .then(() => {
        res.json({ "status": "success", "id": postid, "mediaid": mediaid });
    })
        .catch((err) => { next(err); });
}
function deletepost(req, res, next) {
    const post_id = req.body.id;
    //To do: Delete all media objects for posts, you could delete S3 objects too if you wanna get fancy
    Posts_1.Posts.delete({ id: post_id })
        .then(() => res.json({ status: "success" }))
        .catch((err) => { next(err); });
}
function create_a_post(req, res, next) {
    console.log(req.body.type);
    if (req.body.type)
        createpost(req, res, next);
    else
        next(new Error("no type specified"));
}
exports.create_a_post = create_a_post;
;
function update_a_post(req, res, next) {
    if (req.user.role !== "admin")
        next(new Error(errorconstants_1.PERMISSION_ERROR));
    if (req.body.id) {
        Posts_1.Posts.update({ id: req.body.id }, getUpdatepostParams(req.body))
            .then(data => {
            let tags = [];
            if (req.body.new_list_of_tags) {
                console.log("tags bro");
                tags = req.body.new_list_of_tags;
                // setTags(req.body.id,tags,docClient);
            }
            res.json({
                "status": "success",
                "data": {
                    type: "work"
                }
            });
        });
    }
    else
        next(new Error("no id specified"));
}
exports.update_a_post = update_a_post;
;
function delete_a_post(req, res, next) {
    if (req.user.role !== "admin")
        next(new Error(errorconstants_1.PERMISSION_ERROR));
    if (req.body.id)
        deletepost(req, res, next);
    else
        next(new Error("no id specified"));
}
exports.delete_a_post = delete_a_post;
;
function show_posts(req, res, next) {
    if (req.query.id)
        get_a_post(req, res, next);
    else if (req.query.type)
        get_a_type(req, res, next);
    else
        next(new Error("no id or type parameter"));
}
exports.show_posts = show_posts;
;
//# sourceMappingURL=postsController.js.map