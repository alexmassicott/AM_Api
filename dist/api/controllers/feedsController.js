'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const Posts_1 = require("../models/Posts");
const Content_1 = require("../models/Content");
//////////////
function getfeeds(req, res) {
    // ["work", "showcase", "news"]
    let count = 0;
    const promises = req.query.feed.reduce((acc, type) => {
        // acc.push(Promise.resolve(Posts.query('type').eq(type).where("publication_status").eq("live").exec()));
        acc.push(Content_1.Content.get({ feed: "list_of_live_" + type })
            .then(items => {
            return Promise.resolve(Posts_1.Posts.batchGet(items.posts.map(item => { return { id: item }; })));
        }));
        return acc;
    }, []);
    Promise.all(promises)
        .then((items) => {
        let feed = items.reduce(function (arr, row) {
            return arr.concat(row);
        }, []);
        res.json({ status: "success", data: { posts: feed } });
    }).catch(err => { console.log(err); });
}
function get_feed(req, res) {
    if (req.query.feed)
        getfeeds(req, res);
    else {
        res.status(500).send({
            status: 'error',
            message: 'no type or id specified'
        });
    }
}
exports.get_feed = get_feed;
;
//# sourceMappingURL=feedsController.js.map