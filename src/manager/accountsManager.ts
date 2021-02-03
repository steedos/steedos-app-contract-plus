// import { ReceOAXml } from '../nc/soap/api';
import _ = require('underscore');
export function _syncAccount(doc, action, modifier) {
  if (doc.credit_code) {
    if (Creator.getCollection('accounts').find({ 'credit_code': doc.credit_code, _id: { $ne: doc._id } }).count() > 0) {
      throw new Meteor.Error('400', '纳税人识别号已存在，不予执行。');
    }
  }
  var company_id = doc.company_id;
  var company_ids = doc.company_ids;
  //var country = Creator.getCollection('country').findOne(doc.country);
  /* var modifiedBy = Creator.getCollection('users').findOne(doc.modified_by, {
    fields: {
      name: 1
    }
  });*/
  var all_company_ids = [company_id];
  if (company_ids) {
    all_company_ids = _.uniq(all_company_ids.concat(company_ids));
  }
   /* for (const cid of all_company_ids) {
    var company = Creator.getCollection('company').findOne(cid);
    var data = {
      "pk_group": "DZUG", // 集团 固定编码(DZUG)
      "pk_org": company.code, // 业务单元编码
      "name": doc.name, // 名称
      "shortname": "", // 简称
      "ename": "", // 英文名
      "pk_country": country.code, // 国家编码
      "enablestate": doc.status, // 启用状态
      "def3": doc.address, // 地址
      "tel1": doc.phone, // 电话
      "taxpayerid": doc.credit_code, // 纳税人识别号
      "def30": doc._id, // OA客商id
      "def1": modifiedBy.name // 修改人姓名
    };
     var result = ReceOAXml('custsup', JSON.stringify(data));
    if (!result) {
      return;
    }
    if (!result.billid) {
      console.error('NC返回信息中缺少billid'); // NC单据表头主键
    }
    if (!result.supcode) {
      console.error('NC返回信息中缺少supcode'); // 供应商编码
    }
    if (!result.custcode) {
      console.error('NC返回信息中缺少custcode'); // 客户编码
    }
    if (action == 'before.insert') {
      doc.nc_billid = result.billid; // NC单据表头主键
      doc.nc_supcode = result.supcode; // 供应商编码
      doc.nc_custcode = result.custcode; // 客户编码
    } else if (action == 'before.update') {
      modifier.$set.nc_billid = result.billid; // NC单据表头主键
      modifier.$set.nc_supcode = result.supcode; // 供应商编码
      modifier.$set.nc_custcode = result.custcode; // 客户编码
    }
  }*/

}; 

export function _syncInvoiceInf(doc) {
  var account_bank = Creator.getCollection('account_banks').findOne({
    account: doc._id
  }, {
    fields: {
      accnum: 1, //账号
      pk_bankdoc: 1 //开户行
    }
  });

  var data = {
    "invoice_company_name": "",
    "invoice_credit_code": "",
    "invoice_address": "",
    "invoice_phone": "",
    "invoice_bank": "",
    "invoice_combinenum": ""
  };

  if (doc.name)
    data.invoice_company_name = doc.name

  if (doc.phone)
    data.invoice_phone = doc.phone

  if (doc.address)
    data.invoice_address = doc.address

  if (doc.credit_code)
    data.invoice_credit_code = doc.credit_code

  if (account_bank) {
    if (account_bank.accnum)
      data.invoice_combinenum = account_bank.accnum

    if (account_bank.pk_bankdoc)
      data.invoice_bank = account_bank.pk_bankdoc
  }

  Creator.getCollection("accounts").direct.update({
    _id: doc._id
  }, {
    $set: {
      invoice_company_name: data.invoice_company_name,
      invoice_credit_code: data.invoice_credit_code,
      invoice_address: data.invoice_address,
      invoice_phone: data.invoice_phone,
      invoice_bank: data.invoice_bank,
      invoice_combinenum: data.invoice_combinenum
    }
  });
};
