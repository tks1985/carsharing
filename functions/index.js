const functions = require('@google-cloud/functions-framework');
const app = require('./src/app');

functions.http('popiBot', app);
