const objectql = require('@steedos/objectql');
// 收票明细
module.exports = {
    listenTo: 'contract_payment_invoice',

    beforeInsert: async function () {
        let doc = this.doc;
        if (doc.payment_invoicefolder__c) {
            let payment_invoicefolder = await this.getObject('contract_payment_invoicefolder').findOne(doc.payment_invoicefolder__c, { fields: ['contract__c'] });
            doc.contract__c = payment_invoicefolder.contract__c;
        }
    },

    afterInsert: async function () {
        await setInvoiceNumber(this.doc.payment_invoicefolder__c, this.spaceId);
    },

    afterDelete: async function () {
        await setInvoiceNumber(this.previousDoc.payment_invoicefolder__c, this.spaceId);
    },

};

// 计算收票记录的发票号
async function setInvoiceNumber(paymentInvoiceFolderId, spaceId) {
    if (!paymentInvoiceFolderId || !spaceId) {
        return;
    }
    let steedosSchema = objectql.getSteedosSchema();
    let invoiceNumbers = [];
    let paymentInvoices = await steedosSchema.getObject('contract_payment_invoice').find({ filters: [['space', '=', spaceId], ['payment_invoicefolder__c', '=', paymentInvoiceFolderId]] });
    for (const invoice of paymentInvoices) {
        let num = invoice.invoice_number__c;
        if (num) {
            invoiceNumbers.push(num);
        }
    }
    let numStr = invoiceNumbers.join(',');
    await steedosSchema.getObject('contract_payment_invoicefolder').updateOne(paymentInvoiceFolderId, { 'invoice_number__c': numStr });
}