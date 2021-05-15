'use strict';

// npm install aliyun-api-gateway --save
const path = require('path');
const fs = require('fs');
const Client = require('./client');
let express = require('express');
let router = express.Router();
let Cookies = require("cookies");
let objectql = require('@steedos/objectql');
let steedosConfig = objectql.getSteedosConfig();
const auth = require("@steedos/auth");
const axios = require("axios");

const config ={
    ocrservice:"https://ocrapi-mixed-multi-invoice.taobao.com/ocrservice/mixedMultiInvoice",
    appKey:process.env.APP_KEY,
    appSecret:process.env.APP_SECRET,
    appCode:process.env.APP_CODE
}

var client = new Client(config.appKey, config.appSecret);

const recognise =  async function (req, res, next){
  try{
      let cookies = new Cookies(req, res);
      let userId = cookies.get("X-User-Id");
      let spaceId = cookies.get("X-Space-Id");
      // let authToken = cookies.get("X-Auth-Token");
      const body = req.body;
      console.log(body);
      const invoice_image__c = body.invoice_image__c;
      const filedata = await axios({
          method: "GET",
          url: invoice_image__c,
          responseType:'arraybuffer',
      })
      console.log(filedata.data.length);
      
      const picdata = Buffer.from(filedata.data).toString('base64');

      var result = await client.post(config.ocrservice, {
        timeout: 5000, // 5s
        headers: {
          'Content-Type': 'application/octet-stream'
        },
        data: {
          'img': picdata
        }
      });

     
      console.log(JSON.stringify(result));
      if(result.error_code || !result.subMsgs){
          res.status(200).send({
            error_msg:result.error_msg,
            error_code:result.error_code
          });
          return 
      }
      const originData = result.subMsgs[0].result.data;
      let invoice = {}
      invoice.pk_invoice = originData['发票号码']; // 待定
      invoice.bill_type = result.subMsgs[0].type;
      invoice.name = originData['发票号码'];
      invoice.invoice_code = originData['发票代码'];

      
      let kprq = originData['开票日期'] || originData['日期']  || ''; // "2020年08月28日"  2021-01-30
      kprq = kprq.replace('年','').replace('月','').replace('日','').replace('-','');
      if(kprq !='' && kprq.length == 8){
        invoice.date = new Date(kprq.substr(0,4) + '/' + kprq.substr(4,2) + '/' + kprq.substr(6,2));
      }

      if(invoice.bill_type == '出租车票'){
        invoice.jshj = originData['金额'] || '';
        invoice.jshj = invoice.jshj.replace('¥','').replace('￥','').replace('：','') ;
      }else if(invoice.bill_type == '火车票'){
        invoice.jshj = originData['票价'];
      }else if(invoice.bill_type == '机票行程单'){
        invoice.name = originData['电子客票号码'];
        invoice.invoice_code = originData['印刷序号'];
      }else if(invoice.bill_type == '定额发票'){
        invoice.jshj = originData['小写金额'] || '';
        invoice.jshj = invoice.jshj.replace('¥','').replace('￥','').replace('：','') ;
      }else if(invoice.bill_type == '增值税发票'){
        invoice.jym = originData['校验码'];
        invoice.hjje = originData['不含税金额'];
        invoice.hjse = originData['发票税额'];
        if(originData['发票详单'] && originData['发票详单'][0]){
          invoice.sl = originData['发票详单'][0]['税率'] || ''; //13% 替换成13 数字
          invoice.sl = invoice.sl.replace('%','')
        }
        
        invoice.jshj = originData['发票金额'];
        invoice.xsf_mc = originData['销售方名称'];
        invoice.xsf_nsrsbh = originData['销售方税号'];
      }else{
     
      
      }

      // invoice.lslbs = originData['发票详单'][0]['税率']; // 待定
      // invoice.zfbz = originData.data.zfbz ;// 待定
      // invoice.status = originData.data. ;   //未找到对应字段
      // invoice.company_id =  ;
      // invoice.owner_organization =  ;
      // invoice.owner =   ;
      // invoice.payment_date =   ;
      // invoice.contract =   ;
      // invoice.contract_payable =  ;
      // invoice.contract_payment =   ;
      // invoice.account_payable_invoice =   ;
      
      invoice.owner = userId;
      invoice.space = spaceId;
      invoice = await objectql.getSteedosSchema().getObject('contract_invoice_account').insert(invoice);
      console.log(invoice);

      let contract_payment_invoice = {};
      contract_payment_invoice.account__c = invoice.xsf_mc ;// originData['销售方名称'];
      contract_payment_invoice.amount__c = invoice.jshj  ; // originData['发票金额']
      contract_payment_invoice.bill_date__c = invoice.date; // 开票日期;
      contract_payment_invoice.check_code__c = invoice.jym; // 校验码;

      contract_payment_invoice.credit_code__c = invoice.xsf_nsrsbh;  //销售方纳税人识别号
      contract_payment_invoice.invoice_code__c = invoice.invoice_code; //发票代码
      contract_payment_invoice.invoice_number__c = invoice.name; //发票号码
      contract_payment_invoice.invoice_type__c = invoice.bill_type; //发票类型
      contract_payment_invoice.name = invoice.name;  //名称
      contract_payment_invoice.notax_amount__c = invoice.hjje; //不含税金额
      contract_payment_invoice.tax__c = invoice.sl; //税率
      contract_payment_invoice.tax_amount__c = invoice.hjse; //税额
      
      contract_payment_invoice.contract__c = body.contract__c ; //合同
      contract_payment_invoice.payment_invoicefolder__c = body._id ; //收票记录
      contract_payment_invoice.owner = userId;
      contract_payment_invoice.space = spaceId;
      contract_payment_invoice = await objectql.getSteedosSchema().getObject('contract_payment_invoice').insert(contract_payment_invoice);
      console.log(contract_payment_invoice);
      // let user = await objectql.getSteedosSchema().getObject('contract_invoice_account').findOne(userId, {fields: ['mobile']})

      res.status(200).send({message:'SUCCESS'});
  }catch(error){
      console.error(error);
      res.status(200).send({message:"ERROR"});
  }
}


//OCR识别接口
router.post("/api/aliyun/recognise",recognise );
// module.exports = router
exports.router = router;


