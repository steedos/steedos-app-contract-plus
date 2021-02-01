import { BigNumber } from "bignumber.js";

export function checkMoney(accountPaymentId, detailMoney, excludeAccountPaymentDetailId) {
  let account_payment = Creator.getCollection('account_payment').findOne(accountPaymentId);
  let money = new BigNumber(account_payment.money || 0);
  let detailsMoney = new BigNumber(detailMoney || 0);
  let query: any = { account_payment: accountPaymentId };
  if (excludeAccountPaymentDetailId) {
    query._id = { $ne: excludeAccountPaymentDetailId };
  }
  let account_payment_details = Creator.getCollection('account_payment_details').find(query);
  account_payment_details.forEach(function (apd) {
    detailsMoney = detailsMoney.plus(new BigNumber(apd.money || 0));
  });

  if (detailsMoney.isGreaterThan(money)) {
    throw new Error('付款明细累计金额已超过付款金额，不予进行。');
  }
}
