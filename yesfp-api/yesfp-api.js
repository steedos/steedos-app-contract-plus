let express = require('express');
let router = express.Router();
let Cookies = require("cookies");
let objectql = require('@steedos/objectql');
let steedosConfig = objectql.getSteedosConfig();
const auth = require("@steedos/auth");
const axios = require("axios");
const yesfp_sign = require("./yeafp-sign");

const configurl ={
    domain:"https://yesfp.yonyoucloud.com",
    appid: "commontesterCA",
    recognise:"/input-tax/api/ocr/v2/recognise?appid=",
}


const recognise =  async function (req, res, next){
    try{
        // let fileurl = req.query.fileurl;
        const body = req.body;
        console.log(body);
        const fileurl = body.fileurl;
        const filedata = await axios({
            method: "GET",
            url: fileurl,
            responseType:'arraybuffer',
        })
        console.log(filedata.data.length);
        
        let  bodyParam = yesfp_sign.buildRecognisePostParam();
        console.log(bodyParam);
        const sign = yesfp_sign.jwtsign(bodyParam);
        bodyParam.file = Buffer.from(filedata.data).toString('base64');
        console.log("bodyParam.file:"+bodyParam.file.substr(0,100))
        console.log(getUrl(configurl.recognise));
        axios({
            method: "POST",
            url: getUrl(configurl.recognise),
            data: bodyParam,
            headers: {
                'Content-Type': 'application/json',
                'sign': sign
            }
        }).then( async function(response){
            console.log(JSON.stringify(response.data));
            if(response.data.code != "0000"){
                res.status(200).send({message:response.data.msg});
                return 
            }
    
            const invoice = await objectql.getSteedosSchema().getObject('contract_invoice_account').insert(response.data);
            console.log(invoice);
            // let user = await objectql.getSteedosSchema().getObject('contract_invoice_account').findOne(userId, {fields: ['mobile']})
    
            res.status(200).send({message:"OK"});
        })
    }catch(error){
        console.error(error);
        res.status(200).send({message:"ERROR"});
    }
}

const getUrl =  function(url){
    return configurl.domain + url + configurl.appid;
}

//OCR识别接口
router.post("/api/yesfp/recognise",recognise );
// module.exports = router
exports.router = router;
exports.recognise = recognise; //TODO delete