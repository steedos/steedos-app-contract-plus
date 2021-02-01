/* import { ReceOAXml } from '../nc/soap/api';
import moment = require('moment');

export function _syncAccountBank(doc, action, modifier) {
  var account = Creator.getCollection('accounts').findOne(doc.account);
  var bank = Creator.getCollection('bank').findOne(doc.pk_bankdoc);
  var bank_type = Creator.getCollection('bank_type').findOne(doc.pk_banktype);
  var currency = Creator.getCollection('currency').findOne(doc.pk_currtype);
  var data = {
    "pk_group": "DZUG", // 固定编码(DZUG)
    "pk_cust": account._id, // 纳税人识别号(修改为传客商信息中的def30字段)
    "accnum": doc.accnum, // 账号
    "accname": doc.accname, // 户名
    "pk_bankdoc": bank.code, // 开户银行编码
    "pk_banktype": bank_type.code, // 银行类别编码
    "accountproperty": doc.accountproperty, // 账户属性
    "accopendate": moment(doc.accopendate).format('YYYY-MM-DD HH:mm:ss'), // 开户日期
    "address": "", // 所在地
    "cntactpsn": "", // 联系人
    "accstate": doc.accstate, // 账户状态
    "tel1": "", // 电话
    "enablestate": doc.enablestate, // 启用状态
    "pk_currtype": currency.code, // 币种编码
    "swiftcde": "", // 国际代码
    "Ibann": "", // 国际银行
    "accclass": "3", // 账户分类
    "isdefault": doc.isdefault, // 是否默认
    "def20": doc._id // OA主键
  };

  var result = ReceOAXml('cuspbank', JSON.stringify(data));
  if (!result) {
    return;
  }
  if (!result.billid) {
    console.error('NC返回信息中缺少billid'); // NC单据表头主键
  }
  if (!result.billno) {
    console.error('NC返回信息中缺少billno'); // NC单据号
  }
  if (action == 'before.insert') {
    doc.nc_billid = result.billid; // NC单据表头主键
    doc.nc_billno = result.billno; // NC单据号
  } else if (action == 'before.update') {
    modifier.$set.nc_billid = result.billid; // NC单据表头主键
    modifier.$set.nc_billno = result.billno; // NC单据号
  }

}; */

// 同一签约对象最多只能有一个默认的银行信息 #105
export function _isOneDefault(accountId, isdefault, docId) {
  if (Creator.getCollection('account_banks').find({
    account: accountId,
    isdefault: true,
    _id: {
      $ne: docId
    }
  }).count() > 0 && isdefault) {
    throw new Meteor.Error('400', '只能有一个默认的银行信息!');
  }
}

//开户银行已停用，不允许保存
export function _isBankAvailable(bankId) {
  if (Creator.getCollection('bank').find({
    _id: bankId,
    enablestate: '2'
  }).count() == 0) {
    throw new Meteor.Error('400', '开户银行已停用，不允许保存!');
  }
}

export function _isNotSpaceAdmin(userId, spaceId) {
  let notSpaceAdmin = true;
  if (!userId || !spaceId) {
    return notSpaceAdmin;
  }

  if (Creator.getCollection('spaces').find({ _id: spaceId, admins: userId }).count() > 0) {
    notSpaceAdmin = false;
  }

  return notSpaceAdmin;

}