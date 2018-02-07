import * as dynamoose from "dynamoose";
import * as https from 'https'

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

export { dynamoose };
