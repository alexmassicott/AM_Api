'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const Tags_1 = require("../models/Tags");
function deletetag(req, res) {
    Tags_1.Tags.delete({ name: req.body.name })
        .then(() => {
        res.json({ "status": "success", "name": req.body.name });
    })
        .catch((err) => {
        console.log(err);
        res.status(500).send({
            status: 'error',
            message: "There was a error"
        });
    });
}
function createtag(req, res) {
    let name = req.body.name;
    Tags_1.Tags.create({ name: name })
        .then(() => {
        res.json({ "status": "success", "name": req.body.name });
    })
        .catch((err) => {
        console.log(err);
        res.status(500).send({
            status: 'error',
            message: "There was a error"
        });
    });
}
function gettags(req, res) {
    Tags_1.Tags.scan().attributes(["name"]).exec()
        .then((items) => {
        res.json({ "status": "success", "data": { "tags": items } });
    }).catch((err) => {
        console.log(err);
        res.status(500).send({
            status: 'error',
            message: "There was a error"
        });
    });
}
function delete_a_tag(req, res) {
    if (req.user.role !== "admin") {
        res.status(500).send({
            status: 'error',
            message: "You don't have permissions to do this task"
        });
        return;
    }
    if (req.body.name)
        deletetag(req, res);
    else {
        res.status(500).send({
            status: 'error',
            message: 'no name specified'
        });
    }
}
exports.delete_a_tag = delete_a_tag;
;
function create_tag(req, res) {
    if (req.user.role !== "admin") {
        res.status(500).json({
            status: 'error',
            message: "You don't have permissions to do this task"
        });
        return;
    }
    if (req.body.name)
        createtag(req, res);
    else {
        res.status(500).json({
            status: 'error',
            message: 'no name specified'
        });
    }
}
exports.create_tag = create_tag;
;
function get_tags(req, res) {
    if (req.user.role !== "admin") {
        res.status(500).json({
            status: 'error',
            message: "You don't have permissions to do this task"
        });
        return;
    }
    gettags(req, res);
}
exports.get_tags = get_tags;
;
//# sourceMappingURL=tagsController.js.map