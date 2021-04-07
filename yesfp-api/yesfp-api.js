let express = require('express');
let router = express.Router();
let Cookies = require("cookies");
let objectql = require('@steedos/objectql');
let steedosConfig = objectql.getSteedosConfig();
const auth = require("@steedos/auth");

//OCR识别接口
router.get("/api/yesfp/recognise", async function (req, res, next){
    let fileurl = req.query.fileurl;
    
    // let space = dtApi.spaceGet();
    // let cookies = new Cookies(req, res);
    // let userId = cookies.get("X-User-Id");
    // let authToken = cookies.get("X-Auth-Token");
    // if (!userId && space.dingtalk_corp_id) {
    //     Meteor.call('dingtalk_sso', space.dingtalk_corp_id, Meteor.absoluteUrl(), function(error, result) {
    //         if (error) {
    //             throw _.extend(new Error("Error!" + error.message));
    //         }
    //         if (result) {
    //             DingtalkManager.dd_init_mobile(result);
    //         }
    //     });
    // } else {
    //     FlowRouter.go('/');
    // }
    res.status(200).send({message:"OK"});
});


// module.exports = router
exports.router = router;