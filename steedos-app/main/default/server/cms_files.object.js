const accountPayableInvoiceManager = require('../../../../lib/manager/accountPayableInvoiceManager');
Creator.Objects.cms_files.triggers = {
  "before.remove.server.nc": {
    on: "server",
    when: "before.remove",
    todo: function (userId, doc) {
      // account_payable_invoice
      var parentRecord = Creator.getCollection(doc.parent.o).findOne(doc.parent.ids[0]);
      accountPayableInvoiceManager.checkIsUsed(parentRecord._id);
    }
  }
};