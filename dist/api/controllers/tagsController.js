'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const Tags_1 = require("../models/Tags");
const errorconstants_1 = require("../constants/errorconstants");
function deletetag(req, res, next) {
    Tags_1.Tags.delete({ name: req.body.name })
        .then(() => {
        res.json({ "status": "success", "name": req.body.name });
    })
        .catch((err) => {
        next(new Error("tag doesn't exist"));
    });
}
function createtag(req, res, next) {
    let name = req.body.name;
    Tags_1.Tags.create({ name: name })
        .then(() => {
        res.json({ "status": "success", "name": req.body.name });
    })
        .catch((err) => {
        next(err);
    });
}
function gettags(req, res, next) {
    Tags_1.Tags.scan().attributes(["name"]).exec()
        .then((items) => {
        res.json({ "status": "success", "data": { "tags": items } });
    }).catch((err) => {
        next(err);
    });
}
function delete_a_tag(req, res, next) {
    if (req.user.role !== "admin")
        next(new Error(errorconstants_1.PERMISSION_ERROR));
    if (req.body.name)
        deletetag(req, res, next);
    else
        next(new Error("no name parameter specified"));
}
exports.delete_a_tag = delete_a_tag;
;
function create_tag(req, res, next) {
    if (req.user.role !== "admin")
        next(new Error(errorconstants_1.PERMISSION_ERROR));
    if (req.body.name)
        createtag(req, res, next);
    else
        next(new Error("no name parameter specified"));
}
exports.create_tag = create_tag;
;
function get_tags(req, res, next) {
    if (req.user.role !== "admin")
        next(new Error(errorconstants_1.PERMISSION_ERROR));
    gettags(req, res, next);
}
exports.get_tags = get_tags;
;
//# sourceMappingURL=tagsController.js.map