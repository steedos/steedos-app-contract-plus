export function checkIsUsed(invoiceId) {
  // 付款记录(account_payment)，应付记录(account_payable)
  var aPaymentsCount = Creator.getCollection('account_payment').find({
    'invoice': invoiceId
  }).count();
  if (aPaymentsCount) {
    throw new Meteor.Error('400', '发票已被付款记录引用，不予进行。');
  }
  var aPayableCount = Creator.getCollection('account_payable').find({
    'invoice': invoiceId
  }).count();
  if (aPayableCount) {
    throw new Meteor.Error('400', '发票已被应付记录引用，不予进行。');
  }
}
export function unlock(invoiceIds) {
  if (!invoiceIds) {
    return
  }
  let invCol = Creator.getCollection('account_payable_invoice');
  invoiceIds.forEach(function (invoiceId) {
    var aPaymentsCount = Creator.getCollection('account_payment').find({
      'invoice': invoiceId
    }).count();
    var aPayableCount = Creator.getCollection('account_payable').find({
      'invoice': invoiceId
    }).count();
    if (aPaymentsCount == 0 && aPayableCount == 0) {
      invCol.direct.update(invoiceId, {
        $set: {
          locked: false
        }
      })
    }
  })
}