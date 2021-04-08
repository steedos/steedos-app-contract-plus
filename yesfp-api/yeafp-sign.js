const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const uuid = require('uuid');
const jwt = require('jsonwebtoken');

const ISSUER = "iss";
const SUBJECT = "sub";
const AUDIENCE = "aud";
const EXPIRATION = "exp";
const NOT_BEFORE = "nbf";
const ISSUED_AT = "iat";
const ID = "jti";

const config = {
  privateKey: "../doc/1_pri_pkcs8.key",
  nsrsbh: "201609140000001",
  orgcode: "20160914001",
  algorithm: "RS512"
}
const  claimsConst = {
  SUBJECT: "tester",
  ISSUER: "einvoice",
  AUDIENCE: "einvoice",
};
// 获取公钥和私钥
// let publicKey = fs.readFileSync(path.join(__dirname, "../doc/1_pub.key"), "ascii");
const privateKey = fs.readFileSync(path.join(__dirname, config.privateKey), "ascii");


exports.buildRecognisePostParam = function(){
  let body = {};
  body.nsrsbh = config.nsrsbh;
  body.orgcode = config.orgcode;
  return body;
}


exports.jwtsign = function(param){

  let  claims = Object.assign({}, claimsConst);
  let noww = Math.floor(new Date().getTime()/1000);
  claims.ID = uuid.v1();
  claims.ISSUED_AT = noww;
  claims.EXPIRATION = noww + 3600;
  claims.NOT_BEFORE = noww - 3600;

  // 需要将表单参数requestdatas的数据进行md5加密，然后放到签名数据的requestdatas中。
  // 此签名数据必须存在，否则在验证签名时会不通过。
  if (param.requestdatas) {
    const value = param.requestdatas;
    claims.requestdatas =  getMD5(value);
  } else if (param.nsrsbh) {
    const value = param.nsrsbh;
    claims.nsrsbh = getMD5(value);
  } else {
      //throw new Exception("签名错误");
  }
  const compactJws = jwt.sign(claims, privateKey, { algorithm: config.algorithm});
  console.log(claims);
  console.log(compactJws);
  return compactJws;
}

let getMD5 = function (content){
  return crypto.createHash('md5').update(content).digest("hex");
}

// 生成签名
// let sign = crypto.createSign("RSA-SHA512");
// sign.update("hello");
// let signed = sign.sign(privateKey, "base64");
// console.log(signed);
