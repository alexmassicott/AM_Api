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
const _ = require("lodash");
const Posts_1 = require("../models/Posts");
const Tags_1 = require("../models/Tags");
// ////////////
function getsearch(req) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = req.query.query.split(',');
        let queryItems = [];
        let result;
        let result2;
        let posts;
        result = yield Tags_1.Tags.batchGet(query.map((i) => ({ name: i })));
        posts = _.intersection(...result.map((j) => j.posts));
        result2 = yield Posts_1.Posts.batchGet(posts.map((id) => ({ id })));
        queryItems = queryItems.concat(result2);
        // done();
        return queryItems;
    });
}
function get_search(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let result;
        const query = req.query.query;
        try {
            result = yield getsearch(req);
            res.json({
                status: 'success',
                status_msg: '',
                data: {
                    search_query: query,
                    more_available: false,
                    total_search_results_returned: result.length,
                    list_of_search_results: result
                }
            });
        }
        catch (err) {
            res.json({
                status: 'success',
                status_msg: query ? '' : 'no query given',
                data: {
                    search_query: query || null,
                    more_available: false,
                    total_search_results_returned: 0,
                    list_of_search_results: []
                }
            });
        }
    });
}
exports.get_search = get_search;
//# sourceMappingURL=searchController.js.map