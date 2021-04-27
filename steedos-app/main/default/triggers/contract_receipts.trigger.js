const objectql = require('@steedos/objectql');

module.exports = {
    listenTo: 'contract_receipts',

    beforeInsert: async function () {

    },

    beforeUpdate: async function () {

    },

    beforeDelete: async function () {

    },

    afterInsert: async function () {
        if (_.has(this.doc, 'invoiceapply__c')) {
            await setReceiptProp(this.doc.invoiceapply__c, this.doc._id);
        }
    },

    afterUpdate: async function () {
        await updateReceiptProp(this.doc.invoiceapply__c, this.previousDoc.invoiceapply__c, this.id);
    },

    afterDelete: async function () {

    },

};

async function setReceiptProp(receiptInvoiceIds, contractReceiptId) {
    if (!_.isArray(receiptInvoiceIds)) {
        return;
    }
    let steedosSchema = objectql.getSteedosSchema();
    for (const id of receiptInvoiceIds) {
        await steedosSchema.getObject('contract_receipt_invoiceapply').updateOne(id, { 'contract_receipts__c': contractReceiptId });
    }
}

async function updateReceiptProp(newReceiptInvoiceIds, oldReceiptInvoiceIds, contractReceiptId) {
    newReceiptInvoiceIds = newReceiptInvoiceIds || [];
    oldReceiptInvoiceIds = oldReceiptInvoiceIds || [];
    let newIds = _.difference(newReceiptInvoiceIds, oldReceiptInvoiceIds);
    let removedIds = _.difference(oldReceiptInvoiceIds, newReceiptInvoiceIds);
    let steedosSchema = objectql.getSteedosSchema();
    let invoiceFolderObj = steedosSchema.getObject('contract_receipt_invoiceapply');
    for (const id of newIds) {
        await invoiceFolderObj.updateOne(id, { 'contract_receipts__c': contractReceiptId });
    }
    for (const id of removedIds) {
        await invoiceFolderObj.updateOne(id, { 'contract_receipts__c': '' });
    }
}