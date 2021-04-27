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

}