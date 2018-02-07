"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dynamoose = require("dynamoose");
exports.dynamoose = dynamoose;
const https = require("https");
dynamoose.AWS.config.update({
    accessKeyId: process.env.accessKeyId,
    secretAccessKey: process.env.secretAccessKey,
    region: process.env.region,
    httpOptions: {
        agent: new https.Agent({
            rejectUnauthorized: true,
            keepAlive: true
        })
    }
});
dynamoose.setDefaults({
    create: false,
    waitForActive: false
});
//# sourceMappingURL=database.js.map