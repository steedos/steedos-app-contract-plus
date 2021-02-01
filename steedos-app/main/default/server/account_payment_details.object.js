const manager = require('../../../../lib/manager/accountPaymentDetailsManager');

Creator.Objects.account_payment_details.triggers = {
  "before.insert.syncToNC": {
    on: 'server',
    when: "before.insert",
    todo: function (userId, doc) {
      // 新建和修改付款明细表信息时如付款明细累计金额已超过付款金额，保存此条记录时也将进行提示，并不予保存 #539
      manager.checkMoney(doc.account_payment, doc.money);
    }
  },
  "before.update.syncToNC": {
    on: 'server',
    when: "before.update",
    todo: function (userId, doc, fieldNames, modifier, options) {
      if (modifier && modifier.$set.money) {
        // 新建和修改付款明细表信息时如付款明细累计金额已超过付款金额，保存此条记录时也将进行提示，并不予保存 #539
        manager.checkMoney(doc.account_payment, modifier.$set.money, doc._id);
      }

    }
  }

};