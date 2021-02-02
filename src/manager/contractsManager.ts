const objectql = require('@steedos/objectql');
const _ = require('underscore');
const BigNumber = require('bignumber.js');

//通过【付款记录】中的数据进行计算；已支付总金额=历史支付金额+实际支付金额、未支付付款总金额=合同总金额-已支付金额；
export function changeContractPaidAmount(contractId) {
  var paidAmount = 0;

  var contract = Creator.getCollection("contracts").findOne(contractId);
  if (contract) {
    Creator.getCollection('account_payment').find({
      contract: contractId,
      payment_status: "结算成功"
    }).forEach(function (payment) {
      paidAmount += (payment.money || 0) + (payment.total_amount || 0)
    })
    var cAmount = contract.amount;
    var unPaidAmount = cAmount - paidAmount;
    Creator.getCollection("contracts").update({ _id: contractId }, { $set: { paid_amount: paidAmount, unpaid_amount: unPaidAmount } });
  }
}

//通过【应付记录】中的数据进行计算；已收票总金额=历史收票金额+实际收票金额、未收票总金额=合同总金额-已收票总金额；
export function changeContractReceiptedAmount(contractId) {
  var receiptedAmount = new BigNumber(0);
  var contract = Creator.getCollection("contracts").findOne(contractId);
  if (contract) {
    Creator.getCollection('account_payable').find({
      contract: contractId
    }).forEach(function (payable) { 
      receiptedAmount = receiptedAmount.plus(payable.money || 0);
    })
    Creator.getCollection('account_payable_invoice').find({
      contract_id: contractId
    }).forEach(function (payable_invoice) {
      receiptedAmount = receiptedAmount.plus(payable_invoice.hstorical_amount || 0);
    })
    var cAmount = new BigNumber(contract.amount);
    var unclaimedVotesAmount = cAmount.minus(receiptedAmount);
    Creator.getCollection("contracts").update({ _id: contractId }, { $set: { receipted_amount: receiptedAmount.toNumber(), unclaimed_votes_amount: unclaimedVotesAmount.toNumber() } });
  }
}

//通过【收款记录】中的数据进行计算；已收款总金额=已收款金额+历史收款金额、未收款金额=合同总金额-已收款总金额；
export function changeContractReceivedamount(contractId) {
  var receivedAmount = 0;
  var contract = Creator.getCollection("contracts").findOne(contractId);
  if (contract) {
    Creator.getCollection('account_receipt').find({
      contract: contractId
    }).forEach(function (receipt) {
      receivedAmount += (receipt.money || 0) + (receipt.total_amount || 0)
    })
    var cAmount = contract.amount;
    var unReceivedAmount = cAmount - receivedAmount;
    Creator.getCollection("contracts").update({ _id: contractId }, { $set: { received_amount: receivedAmount, unreceived_amount: unReceivedAmount } });
  }
}

//通过【应收记录】中的数据进行计算；申请开票总金额=历史已完成开票金额+SUN（申请开票金额）、未申请开票总金额=合同总金额—申请开票总金额。
export function changeContractForInvoicingAmount(contractId) {
  var forInvoicingAmount = 0;
  var contract = Creator.getCollection("contracts").findOne(contractId);
  if (contract) {
    Creator.getCollection('account_receivable').find({
      contract: contractId,
      nc_approvestatus: "1"
    }).forEach(function (receivable) {
      forInvoicingAmount += (receivable.money || 0) + (receivable.invoiced_amount || 0)
    })
    var cAmount = contract.amount;
    var unforInvoicingAmount = cAmount - forInvoicingAmount;
    Creator.getCollection("contracts").update({ _id: contractId }, { $set: { for_invoicing_amount: forInvoicingAmount, unfor_invoicing_amount: unforInvoicingAmount } });
  }
}

export function _formatState(insId, modifierSet, doc) {
  var ins = Creator.getCollection('instances').findOne(insId, {
    fields: {
      state: 1,
      final_decision: 1
    }
  });
  var contract_state = '';
  if (ins) {
    if (modifierSet.overwrite_contract_state == 'approved' || doc.overwrite_contract_state == 'approved') {
      if (!doc.signed_date && !doc.original_file && !doc.revocation_date) {
        contract_state = 'approved';
      }
      if (modifierSet.signed_date || doc.signed_date) {
        contract_state = 'signed';
      }
      if (modifierSet.original_file || doc.original_file) {
        contract_state = 'archived';
      }
      if (modifierSet.revocation_date || doc.revocation_date) {
        contract_state = 'droped';
      }
    } else {
      var state = ins.state;
      if (state == 'pending') {
        contract_state = state;
        return contract_state;
      } else if (state == 'completed') {
        var final_decision = ins.final_decision;
        if (final_decision == 'approved') {
          if (!doc.signed_date && !doc.original_file && !doc.revocation_date) {
            contract_state = 'approved';
          }
          if (modifierSet.signed_date || doc.signed_date) {
            contract_state = 'signed';
          }
          if (modifierSet.original_file || doc.original_file) {
            contract_state = 'archived';
          }
          if (modifierSet.revocation_date || doc.revocation_date) {
            contract_state = 'droped';
          }
        } else if (final_decision == 'terminated') {
          contract_state = 'terminated';
        } else if (final_decision == 'rejected') {
          contract_state = 'rejected';
        }
      }
    }

  }
  return contract_state;
}

export async function change_history(contractId, newInsId) {
  const steedosSchema = objectql.getSteedosSchema();
  var contract = await steedosSchema.getObject('contracts').findOne(contractId);
  var instances = contract.instances;
  var instance = await steedosSchema.getObject('instances').findOne(instances[0]._id);
  var forwardInsId = '';
  if (newInsId) {
    forwardInsId = newInsId;
  } else {
    forwardInsId = _.last(_.last(instance.traces).approves).forward_instance;
  }
  if (!forwardInsId) {
    throw new Error('未能找到转发后申请单');
  }
  var changeBefore = {
    '_id': contract._id,
    'name': contract.name,
    '@label': contract.name
  };
  var setObj = {
    'values.change_before': changeBefore,
    'traces.0.approves.0.values.change_before': changeBefore
  };
  await steedosSchema.getObject('instances').update(forwardInsId, setObj);
  return forwardInsId;
}

export async function checkMoneyFromDraft(contractId, money, type) {
  const steedosSchema = objectql.getSteedosSchema();
  // 应付
  let accountPayableAmount = 0;
  let account_payables = await steedosSchema.getObject('account_payable').find({ 'filters': `(contract eq '${contractId}')` });
  account_payables.forEach(function (ap) {
    accountPayableAmount += ap.money || 0 + ap.total_amount || 0;
  });
  // 付款
  let accountPaymentAmount = 0;
  let account_payments = await steedosSchema.getObject('account_payment').find({ 'filters': `(contract eq '${contractId}')` });
  account_payments.forEach(function (ap) {
    accountPaymentAmount += ap.money || 0 + ap.total_amount || 0;
  });
  // 应收
  let accountReceivableAmount = 0;
  let account_receivables = await steedosSchema.getObject('account_receivable').find({ 'filters': `(contract eq '${contractId}')` });
  account_receivables.forEach(function (ar) {
    accountReceivableAmount += ar.money || 0 + ar.invoiced_amount || 0;
  });
  // 收款
  let accountReceiptAmount = 0;
  let account_receipts = await steedosSchema.getObject('account_receipt').find({ 'filters': `(contract eq '${contractId}')` });
  account_receipts.forEach(function (ar) {
    accountReceiptAmount += ar.money || 0 + ar.total_amount || 0;
  });
  if (type == 'payment') {
    if (money < accountPayableAmount - accountReceivableAmount) {
      throw new Error('变更后合同金额需大于等于: 原合同对应的应付单总额减去原合同对应的应收单总额的值。');
    }
    if (money < accountPayableAmount - accountReceiptAmount) {
      throw new Error('变更后合同金额需大于等于: 原合同对应的应付单总额减去原合同对应的收款单总额的值。');
    }
    if (money < accountPaymentAmount - accountReceivableAmount) {
      throw new Error('变更后合同金额需大于等于: 原合同对应的付款单总额减去原合同对应的应收单总额的值。');
    }
    if (money < accountPaymentAmount - accountReceiptAmount) {
      throw new Error('变更后合同金额需大于等于: 原合同对应的付款单总额减去原合同对应的收款单总额的值。');
    }
  } else if (type == 'receivables') {
    if (money < accountReceivableAmount - accountPayableAmount) {
      throw new Error('变更后合同金额需大于等于: 原合同对应的应收单总额减去原合同对应的应付单总额。');
    }
    if (money < accountReceivableAmount - accountPaymentAmount) {
      throw new Error('变更后合同金额需大于等于: 原合同对应的应收单总额减去原合同对应的付款单总额。');
    }
    if (money < accountReceiptAmount - accountPayableAmount) {
      throw new Error('变更后合同金额需大于等于: 原合同对应的收款单总额减去原合同对应的应付单总额。');
    }
    if (money < accountReceiptAmount - accountPaymentAmount) {
      throw new Error('变更后合同金额需大于等于: 原合同对应的收款单总额减去原合同对应的付款单总额。');
    }
  }
  return;
}
