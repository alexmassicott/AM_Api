'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const Posts_1 = require("../models/Posts");
const Content_1 = require("../models/Content");
const mapOrder_1 = require("../utils/mapOrder");
function getfeeds(req, res, next) {
    let count = 0;
    const promises = req.query.feed.reduce((acc, type) => {
        acc.push(Content_1.Content.get({ feed: "list_of_live_" + type })
            .then(items => {
            return Promise.resolve(Posts_1.Posts.batchGet(items.posts.map(item => { return { id: item }; })));
        }));
        return acc;
    }, []);
    Promise.all(promises)
        .then((items) => {
        const feed = items.reduce(function (arr, row) {
            return arr.concat(row);
        }, []);
        let orderList = mapOrder_1.mapOrder(feed, items, 'id');
        res.json({ status: "success", data: { posts: orderList } });
    })
        .catch(err => { next(err); });
}
function get_feed(req, res, next) {
    if (req.query.feed)
        getfeeds(req, res, next);
    else
        next(new Error('No feeds supplied'));
}
exports.get_feed = get_feed;
;
//# sourceMappingURL=feedsController.js.map