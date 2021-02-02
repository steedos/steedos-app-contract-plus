//var notificationManager = require('../../lib/manager/notificationManager').notificationManager;
const manager = require('../../../../lib/manager/contractReceiptsManager');
const utilsManager = require('../../../../lib/manager/utilsManager');

Creator.Objects.contract_receipts.triggers = {
  "before.insert.checkAmount": {
    on: 'server',
    when: "before.insert",
    todo: function (userId, doc) {
      if (!_.has(doc, "finished")) {
        doc.finished = false;
      }
      // 收款计划总金额不能大于合同总金额
      if (_.has(doc, "amount")) {
        manager._checkAmount(doc._id, doc.amount, doc.contract, 'before.insert');
      }
      // 收款计划所属单位即为所属合同的我方单位
      // 收款记录及收款计划中增加“项目”字段，数据来源为合同中的项目，对于已有的收款记录和收款计划需附加值 #401
      // 收/付款计划增加合同状态（来源合同）并维护历史数据 #440
      if (_.has(doc, 'contract')) {
        let contract = Creator.getCollection('contracts').findOne(doc.contract, {
          fields: {
            'company_id': 1,
            'project': 1,
            'contract_state': 1
          }
        });
        if (contract) {
          if (contract.company_id) {
            doc.company_id = contract.company_id;
          }
          if (contract.project) {
            doc.project = contract.project;
          }
          if (contract.contract_state) {
            doc.contract_state = contract.contract_state;
          }
        }

      }

      // 如果 项目有对应项目台账 则科目字段必填 #456
      // utilsManager.isSubjectNeed(doc);
    }
  },
  "before.update.checkAmount": {
    on: 'server',
    when: "before.update",
    todo: function (userId, doc, fieldNames, modifier, options) {
      // 收款计划总金额不能大于合同总金额
      if (_.has(modifier.$set, "amount")) {
        manager._checkAmount(doc._id, modifier.$set.amount, doc.contract, 'before.update');
      }
    }
  },
  "after.update.pushNotification": {
    on: 'server',
    when: "after.update",
    todo: function (userId, doc, fieldNames, modifier, options) {
      // notificationManager.receiptsPush(doc._id);
    }
  },
  "after.insert.pushNotification": {
    on: 'server',
    when: "after.insert",
    todo: function (userId, doc) {
      // notificationManager.receiptsPush(doc._id);
    }
  }
};

Creator.Objects.contract_receipts.actions = {
  standard_new: {
    label: "新建",
    visible: function () {
      return false;
    },
    on: "list",
    todo: "standard_new"
  }
};