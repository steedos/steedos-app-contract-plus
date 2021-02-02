export function _checkAmount(accountPayableId, amount, contractId, action) {
  var contract = Creator.getCollection('contracts').findOne(contractId);
  if (contract.amount_type == '浮动') {
    return;
  }
  var contractAmount = contract.amount;
  var totalAmount = 0;
  Creator.getCollection('contract_receipts').find({
    contract: contractId
  }).forEach(function (ap) {
    if (ap._id == accountPayableId) {
      if (amount) {
        totalAmount += amount;
      }
    } else if (ap.amount) {
      totalAmount += ap.amount;
    }
  });
  if (action == 'before.insert') {
    totalAmount += amount;
  }
  if (totalAmount > contractAmount) {
    throw new Meteor.Error(400, '金额已超过合同总金额，不予进行。');
  }
}
