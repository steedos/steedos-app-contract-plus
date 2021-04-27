const objectql = require('@steedos/objectql');

module.exports = {
    listenTo: 'contract_receipt_invoice',

    beforeInsert: async function(){
        let doc = this.doc;
        if (doc.invoiceapply__c) {
            let contract_receipt_invoiceapply = await this.getObject('contract_receipt_invoiceapply').findOne(doc.invoiceapply__c, { fields: ['contract'] });
            doc.contract__c = contract_receipt_invoiceapply.contract;
        }
    },

}