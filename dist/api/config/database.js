"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
exports.mongoose = mongoose;
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/mydb');
//# sourceMappingURL=database.js.map