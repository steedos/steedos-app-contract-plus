const objectql = require('@steedos/objectql');
const _ = require('underscore');
// 付款单
module.exports = {
    listenTo: 'contract_payments',

    beforeInsert: async function () {

    },

    beforeUpdate: async function () {

    },

    beforeDelete: async function () {

    },

    afterInsert: async function () {
        if (_.has(this.doc, 'payment_invoicefolder__c')) {
            await setPaymentProp(this.doc.payment_invoicefolder__c, this.doc._id);
        }
    },

    afterUpdate: async function () {
        await updatePaymentProp(this.doc.payment_invoicefolder__c, this.previousDoc.payment_invoicefolder__c, this.id);
    },

    afterDelete: async function () {

    },

};

async function setPaymentProp(paymentInvoiceFolderIds, contractPaymentId) {
    if (!_.isArray(paymentInvoiceFolderIds)) {
        return;
    }
    let steedosSchema = objectql.getSteedosSchema();
    for (const id of paymentInvoiceFolderIds) {
        await steedosSchema.getObject('contract_payment_invoicefolder').updateOne(id, { 'contract_payment__c': contractPaymentId });
    }
}

async function updatePaymentProp(newPaymentInvoiceFolderIds, oldPaymentInvoiceFolderIds, contractPaymentId) {
    newPaymentInvoiceFolderIds = newPaymentInvoiceFolderIds || [];
    oldPaymentInvoiceFolderIds = oldPaymentInvoiceFolderIds || [];
    let newIds = _.difference(newPaymentInvoiceFolderIds, oldPaymentInvoiceFolderIds);
    let removedIds = _.difference(oldPaymentInvoiceFolderIds, newPaymentInvoiceFolderIds);
    let steedosSchema = objectql.getSteedosSchema();
    let invoiceFolderObj = steedosSchema.getObject('contract_payment_invoicefolder');
    for (const id of newIds) {
        await invoiceFolderObj.updateOne(id, { 'contract_payment__c': contractPaymentId });
    }
    for (const id of removedIds) {
        await invoiceFolderObj.updateOne(id, { 'contract_payment__c': '' });
    }
}