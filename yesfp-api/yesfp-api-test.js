let express = require('express');
let router = express.Router();
let Cookies = require("cookies");
let objectql = require('@steedos/objectql');
let steedosConfig = objectql.getSteedosConfig();
const auth = require("@steedos/auth");
const axios = require("axios");
var app = express();

var yesfp_api = require('./yesfp-api');
// app.use('', yesfp_api.router);
let req = {body: {fileurl : "http://127.0.0.1:5000/api/files/images/Zgn9LJp6NP5ZoRWck/%E7%94%B5%E8%84%91%E4%B8%AA%E4%BA%BA%E5%8F%91%E7%A5%A8.png" }}
let mockres = {
    status: function(x){return this}, 
    send :  function(x){return this}, 
};
yesfp_api.recognise(req,mockres)



