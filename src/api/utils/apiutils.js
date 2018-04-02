"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function clientErrorHandler(err, req, res, next) {
    if (req.xhr) {
        res.status(500).send({ error: err.message });
    }
    else {
        next(err);
    }
}
exports.clientErrorHandler = clientErrorHandler;
function errorHandler(err, req, res) {
    res.status(500);
    res.render('error', { error: err });
}
exports.errorHandler = errorHandler;
//# sourceMappingURL=apiutils.js.map