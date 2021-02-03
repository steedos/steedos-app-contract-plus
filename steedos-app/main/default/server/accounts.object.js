const manager = require('../../../../lib/manager/accountsManager');
Creator.Objects.accounts.triggers = {
  "before.insert.syncToNC": {
    on: 'server',
    when: "before.insert",
    todo: function (userId, doc) {
      // doc.synced = false;
      manager._syncAccount(doc, 'before.insert');
    }
  },
  "before.update.syncToNC": {
    on: 'server',
    when: "before.update",
    todo: function (userId, doc, fieldNames, modifier, options) {
      // modifier.$set.synced = false;
      manager._syncAccount(Object.assign(doc, modifier.$set), 'before.update', modifier);
    }
  },
  "before.remove.document": {
    on: 'server',
    when: "before.remove",
    todo: function (userId, doc) {
      var exists = Creator.getCollection('contracts').find({
        othercompany: doc._id
      }).count();
      if (exists > 0) {
        throw new Meteor.Error('400', '此签约对象已关联合同，无法删除');
      }
    }
  },
  "after.insert.invoiceInf": {
    on: 'server',
    when: "after.insert",
    todo: function (userId, doc) {
      manager._syncInvoiceInf(doc);
    }
  }
};

Creator.Objects.accounts.actions = {
  standard_delete: {
    label: "删除",
    visible: function (object_name, record_id, record_permissions) {
      return false;
    },
    on: "record_more",
    todo: "standard_delete"
  }
};