const fs = require('fs');
const yaml = require('js-yaml');
const handler = require('./handler');

const fileContents = fs.readFileSync('./config.yml', 'utf8');
const config = yaml.load(fileContents);

process.env.WEBHOOK_URL = config.webhookUrl;
process.env.POST_COUNT = config.postCount;

handler.run();
