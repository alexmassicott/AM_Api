"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Posts_1 = require("../models/Posts");
function getfeeds(req, res, next) {
    Posts_1.Posts.find({ type: { $in: req.body.feed }, publication_status: 'live' })
        .sort({ creation_timestamp: -1 })
        .exec()
        .then((posts) => {
        res.json({ status: 'success', data: { posts } });
    })
        .catch((err) => {
        next(err);
    });
}
function get_feed(req, res, next) {
    if (Array.isArray(req.query.feed))
        getfeeds(req, res, next);
    else
        next(new Error('No feeds supplied'));
}
exports.get_feed = get_feed;
//# sourceMappingURL=feedsController.js.map