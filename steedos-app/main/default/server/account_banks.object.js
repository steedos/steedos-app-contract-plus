const manager = require('../../../../lib/manager/accountBanksManager');
Creator.Objects.account_banks.triggers = {
  "before.insert.syncToNC": {
    on: 'server',
    when: "before.insert",
    todo: function (userId, doc) {
      manager._isOneDefault(doc.account, doc.isdefault, doc._id);
      manager._isBankAvailable(doc.pk_bankdoc);

      // 账号唯一
      if (Creator.getCollection('account_banks').find({
        'accnum': doc.accnum
      }).count()) {
        throw new Meteor.Error('400', '账号已存在，不予进行。');
      }

       //manager._syncAccountBank(doc, 'before.insert');
       doc.synced = false;
    }
  },
  "before.update.syncToNC": {
    on: 'server',
    when: "before.update",
    todo: function (userId, doc, fieldNames, modifier, options) {
      if (modifier.$set.hasOwnProperty('accnum') && doc.accnum != modifier.$set.accnum && manager._isNotSpaceAdmin(userId, doc.space)) {
        throw new Meteor.Error('400', '账号不允许修改!');
      }
      manager._isOneDefault(doc.account, modifier.$set.isdefault, doc._id);

      //manager._syncAccountBank(Object.assign(doc, modifier.$set), 'before.update', modifier);
       modifier.$set.synced = false;
    }
  }
};

Creator.Objects.account_banks.actions = {
  standard_delete: {
    label: "删除",
    visible: function (object_name, record_id, record_permissions) {
      return false;
    },
    on: "record_more",
    todo: "standard_delete"
  }
};