

// 同一签约对象最多只能有一个默认的银行信息 #105
export function _isOneDefault2(accountId, isdefault, docId) {
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