const manager = require('../../../../lib/manager/accountPayableInvoiceManager');
const changeContractReceiptedAmount = require('../../../../lib/manager/contractsManager').changeContractReceiptedAmount;
Creator.Objects.account_payable_invoice.triggers = {
  "before.remove.server.nc": {
    on: "server",
    when: "before.remove",
    todo: function (userId, doc) {
      manager.checkIsUsed(doc._id);
    }
  },
  "before.update.server.nc": {
    on: "server",
    when: "before.update",
    todo: function (userId, doc, fieldNames, modifier, options) {
      manager.checkIsUsed(doc._id);
    }
  },
  "after.insert.changeContractReceiptedAmount": {
    on: 'server',
    when: "after.insert",
    todo: function (userId, doc) {
      if (doc.contract_id) {
        changeContractReceiptedAmount(doc.contract_id);
      }
    }
  },
  "after.update.changeContractReceiptedAmount": {
    on: 'server',
    when: "after.update",
    todo: function (userId, doc) {
      if (doc.contract_id) {
        changeContractReceiptedAmount(doc.contract_id);
      }
    }
  },
  "after.remove.changeContractReceiptedAmount": {
    on: 'server',
    when: "after.remove",
    todo: function (userId, doc) {
      if (doc.contract_id) {
        changeContractReceiptedAmount(doc.contract_id);
      }
    }
  }
};

Creator.Objects.account_payable_invoice.actions = {
  makePayableOrder: {
    label: "生成应付记录",
    visible: function (object_name, record_id, record_permissions) {
      // 如果合同业务类型时·房屋租赁（承租方）（编码006）·显示此按钮
      if (Session.get('object_name') === 'contracts') {
        var contract = Creator.getObjectRecord();
        if (contract && contract.business_category) {
          var business_category = Creator.getObjectRecord('business_categories', contract.business_category, 'code');
          if (business_category.code == '006') {
            return true;
          }
        }
      }
      return false;
    },
    on: "record",
    todo: function (object_name, record_id, fields) {
      var collection_name, object, record, contract, cmDoc;
      contract = Creator.getObjectRecord();
      object = Creator.getObject('account_payable');
      collection_name = object.label;
      cmDoc = FormManager.getInitialValues('account_payable');
      cmDoc.contract = contract._id;
      cmDoc.trade_type = 'F1-Cxx-02';
      // 将合同下的所有发票的总金额/历史收票总金额之和减去确认成本中的确认成本/历史已确认成本之和所得差额作为应付记录的应付金额(money)字段
      var allInvoices = Creator.odata.query('account_payable_invoice', {
        $filter: `(contract_id eq '${contract._id}')`,
        $select: 'amount,hstorical_amount'
      }, true);
      var allCosts = Creator.odata.query('cost_recognition', {
        $filter: `(contract eq '${contract._id}')`,
        $select: 'cost_amount,hstorical_cost_amount'
      }, true);
      var totoalInvoiceAmount = 0;
      var total_amount = 0;
      allInvoices.forEach(function (av) {
        totoalInvoiceAmount += (av.amount || 0) + (av.hstorical_amount || 0);
        if (av.hstorical_amount > 0) {
          total_amount = av.hstorical_amount;
        }
      });
      var totoalCostAmount = 0;
      allCosts.forEach(function (ac) {
        totoalCostAmount += (ac.cost_amount || 0) + (ac.hstorical_cost_amount || 0);
      });
      var money = totoalInvoiceAmount - totoalCostAmount;
      if (money <= 0) {
        toastr.info('发票总金额已大于等于确认成本/费用总金额，无需生成应付记录。');
        return;
      } else {
        cmDoc.money = money;
      }
      cmDoc.total_amount = total_amount;

      Session.set('cmDoc', cmDoc);
      Session.set("action_collection", "Creator.Collections.account_payable");
      Session.set("action_collection_name", collection_name);
      Session.set("action_save_and_insert", false);
      Session.set('cmIsMultipleUpdate', false);
      Meteor.defer(function () {
        return $(".creator-add-related").click();
      });
    }
  }
};