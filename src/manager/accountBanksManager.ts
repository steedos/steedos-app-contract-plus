

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