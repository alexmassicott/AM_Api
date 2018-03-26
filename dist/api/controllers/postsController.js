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
const Posts_1 = require("../models/Posts");
const MediaObjects_1 = require("../models/MediaObjects");
const errorconstants_1 = require("../constants/errorconstants");
const setTags = require('../utils/updatetags');
const uuid = require('uuid4');
function get_a_post(req, res, next) {
    const id = req.query.id;
    Posts_1.Posts.findById(id)
        .populate('list_of_media')
        .then((items) => {
        const response = {
            status: 'success',
            data: {
                number_of_posts_returned: items.length,
                posts: [items]
            }
        };
        res.json(response);
    })
        .catch((err) => {
        next(err);
    });
}
function get_a_type(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const type = req.query.type;
        const count = yield Posts_1.Posts.find({ type }).count();
        const offset = req.query.offset ? parseInt(req.query.offset) : 0;
        const query = Posts_1.Posts.find({ type })
            .sort({ creation_timestamp: -1 })
            .skip(offset)
            .limit(parseInt(req.query.limit))
            .populate('list_of_media');
        query
            .then((items) => {
            const response = {
                status: 'success',
                data: {
                    more_available: offset + parseInt(req.query.limit) < count,
                    number_of_posts_total: count,
                    number_of_posts_returned: items.length,
                    posts: items
                }
            };
            res.json(response);
        })
            .catch((err) => {
            next(err);
        });
    });
}
function getUpdatepostParams(body, post) {
    if (body.new_client) {
        post.client = body.new_client;
    }
    if (body.new_title) {
        post.title = body.new_title;
    }
    if (body.new_summary) {
        post.summary = body.new_summary;
    }
    if (body.new_link) {
        post.link = body.new_link;
    }
    if (body.redirect_link) {
        post.redirect_link = body.redirect_link;
    }
    if (body.new_publication_status) {
        post.publication_status = body.new_publication_status;
    }
    if (body.new_featured === true || body.new_featured === false) {
        post.featured = body.new_featured;
    }
    post.edit_timestamp = Math.floor(Date.now() / 1000);
    post.save();
}
function createpost(req, res, next) {
    try {
        const newmedia = new MediaObjects_1.Media();
        const newpost = new Posts_1.Posts({ type: req.body.type, list_of_media: [newmedia._id] });
        newmedia.post_id = newpost._id;
        newpost.save();
        res.json({ status: 'success', id: newpost._id, mediaid: newmedia._id });
    }
    catch (err) {
        next(err);
    }
}
function deletepost(req, res, next) {
    const post_id = req.body.id;
    // To do: Delete all media objects for posts, you could delete S3 objects too if you wanna get fancy
    Posts_1.Posts.remove({ _id: post_id })
        .then(() => res.json({ status: 'success' }))
        .catch((err) => {
        next(err);
    });
}
function updatepost(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const post = yield Posts_1.Posts.findById(req.body.id);
            getUpdatepostParams(req.body, post);
            //   let tags = []
            //   if (req.body.new_list_of_tags) {
            //     console.log('tags bro')
            //     tags = req.body.new_list_of_tags
            //     // setTags(req.body.id,tags,docClient);
            //   }
            res.json({
                status: 'success',
                data: {
                    type: 'work'
                }
            });
        }
        catch (err) {
            next(err);
        }
    });
}
function create_a_post(req, res, next) {
    console.log(req.body.type);
    if (req.body.type)
        createpost(req, res, next);
    else
        next(new Error('no type specified'));
}
exports.create_a_post = create_a_post;
function update_a_post(req, res, next) {
    if (req.user.role !== 'admin')
        next(new Error(errorconstants_1.PERMISSION_ERROR));
    if (req.body.id) {
        updatepost(req, res, next);
    }
    else
        next(new Error('no id specified'));
}
exports.update_a_post = update_a_post;
function delete_a_post(req, res, next) {
    if (req.user.role !== 'admin')
        next(new Error(errorconstants_1.PERMISSION_ERROR));
    if (req.body.id)
        deletepost(req, res, next);
    else
        next(new Error('no id specified'));
}
exports.delete_a_post = delete_a_post;
function show_posts(req, res, next) {
    if (req.query.id)
        get_a_post(req, res, next);
    else if (req.query.type)
        get_a_type(req, res, next);
    else
        next(new Error('no id or type parameter'));
}
exports.show_posts = show_posts;
//# sourceMappingURL=postsController.js.map