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
    appCode:process.env.APP_CODE,

    // yonyou
    verifyUrl: "https://api.yonyoucloud.com/apis/dst/verifyInvoiceWithType/verifyInvoiceWithType",
    apicode:process.env.YONGYOU_API_CODE,
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

      
      let kprq = originData['开票日期'] || originData['日期']  || ''; // "2020年08月28日"  2021年6月2日 2021-01-30
      kprq = kprq.replace('年','-').replace('月','-').replace('日','');
      if(kprq !=''){
        if(kprq.length == 8 && kprq.indexOf('-') == -1){ // 20210130
          invoice.date = new Date(kprq.substr(0,4) + '-' + kprq.substr(4,2) + '-' + kprq.substr(6,2));
        }else { // 2021-6-2 和 2021-06-02 结果不一样， 需要统一转换成 yyyy-MM-dd格式
          let  adate = kprq.split('-');
          if(adate != null && adate.length == 3){
            let year = adate[0];
            let month = adate[1].length == 1 ? '0'+adate[1]  : adate[1];
            let day = adate[2].length == 1 ? '0'+adate[2]  : adate[2];
            invoice.date = new Date(year + '-' +  month  + '-' + day);
          }
        }
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
          invoice.sl = invoice.sl.replace('%','')/100
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

const formatDate = function(date){
  if( date !== undefined && date instanceof Date){
    let year = date.getFullYear(); 
    let month = date.getMonth() + 1;
    let day = date.getDate();
    if(month < 10) month = "0" + month;
    if(day < 10) day = "0" + day;
    return "" + year + month + day ;
  }
  return "";
}

const invoiceVerify =  async function (req, res, next){
  try{
    let cookies = new Cookies(req, res);
    let userId = cookies.get("X-User-Id");
    let spaceId = cookies.get("X-Space-Id");
    // let authToken = cookies.get("X-Auth-Token");
    const body = req.body;
    console.log(body);

    let contract_payment_invoice_list = await objectql.getSteedosSchema().getObject('contract_payment_invoice').find({payment_invoicefolder__c: body.record_id});
    console.log(contract_payment_invoice_list);
    if(contract_payment_invoice_list == undefined || contract_payment_invoice_list.length == 0){
      res.status(200).send({message:'SUCCESS'});
      return;
    }

     /**
     * 增值税专用发票：01 ；
        货运运输业增值税专用发票：02 ；
        机动车销售统一发票：03； 
        增值税普通发票：04 ；
        增值税普通发票（电子）：10 ；
        增值税普通发票（卷式）：11 ；
        通行费发票：14 ；
        二手车发票：15，
     */
    console.log("***********verify**************");
    const header = {"authoration":"apicode","apicode":config.apicode,"Content-Type":"application/json"}
    for( let index = 0; index < contract_payment_invoice_list.length ; index ++ ){
      let contract_payment_invoice  = contract_payment_invoice_list[index]; 
      if(contract_payment_invoice.verification__c == undefined || contract_payment_invoice.verification__c == ''){
        contract_payment_invoice.check_code__c == undefined && (contract_payment_invoice.check_code__c = '');
        let data = {
          "code": contract_payment_invoice.invoice_code__c, //发票代码
          "date": formatDate(contract_payment_invoice.bill_date__c) ,  //开票日期，格式：yyyyMMdd
          "number"  :contract_payment_invoice.invoice_number__c , // 发票号码
          "priceWithoutTax" : contract_payment_invoice.notax_amount__c,//  发票金额（不含税）
          "type" :  contract_payment_invoice.invoice_type__c == '增值税发票' ? '10' : '01' , //  发票类型（参考备注）
          "verifyCode":  contract_payment_invoice.check_code__c.substr(contract_payment_invoice.check_code__c.length-6,6) ,//发票校验码后6位
        }
        console.log("data:")
        console.log(data)
        const verifyResult = await axios({
            method: "post",
            url: config.verifyUrl,
            headers: header,
            data:data
        })
        console.log("**********verifyResult***********");
        console.log(verifyResult.data);
        contract_payment_invoice.verification__c = verifyResult.data.Code + verifyResult.data.Msg
        await objectql.getSteedosSchema().getObject('contract_payment_invoice').updateOne(contract_payment_invoice._id,contract_payment_invoice);
      }
    };
   
    
    res.status(200).send({message:'SUCCESS'});
  }catch(error){
       console.log("******error**********");
      // console.error(error);
      res.status(200).send({message:"ERROR"});
  }
}
//OCR识别接口
router.post("/api/aliyun/recognise",recognise );

//查重验伪
router.post("/api/yonyoucloud/invoiceVerify",invoiceVerify );
// module.exports = router
exports.router = router;


