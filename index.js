"use strict";
exports.__esModule = true;
// var router = require('./yesfp-api/yesfp-api');
var router = require('./aliyun-api/aliyun-api');
exports.init = function (_a) {
    var app = _a.app;
    app.use('', router.router);
};