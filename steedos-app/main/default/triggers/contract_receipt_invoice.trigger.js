const objectql = require('@steedos/objectql');
const { default: BigNumber } = require('bignumber.js');
// 开票明细
module.exports = {
    listenTo: 'contract_receipt_invoice',

    beforeInsert: async function () {
        let doc = this.doc;
        if (doc.invoiceapply__c) {
            let contract_receipt_invoiceapply = await this.getObject('contract_receipt_invoiceapply').findOne(doc.invoiceapply__c, { fields: ['contract'] });
            doc.contract__c = contract_receipt_invoiceapply.contract;
        }
        await checkAmount(this.id, doc.amount__c, doc.invoiceapply__c);
    },

    beforeUpdate: async function () {
        let doc = this.doc;
        let id = this.id;
        let receiptInvoice = await this.getObject('contract_receipt_invoice').findOne(id, { fields: ['invoiceapply__c'] });
        await checkAmount(id, doc.amount__c, receiptInvoice.invoiceapply__c);
    }

};

// 开票明细的累计金额应不大于所属的开票记录的申请开票金额（已开票信息中的发票总金额加当前记录的发票金额，不大于申请开票金额，保存时校验）
async function checkAmount(receiptInvoiceId, amount, invoiceApplyId) {
    let steedosSchema = objectql.getSteedosSchema();
    let receiptInvoices = await steedosSchema.getObject('contract_receipt_invoice').find({ filters: [['invoiceapply__c', '=', invoiceApplyId], ['_id', '!=', receiptInvoiceId]] });
    let receiptInvoiceApply = await steedosSchema.getObject('contract_receipt_invoiceapply').findOne(invoiceApplyId);
    let totalAmount = new BigNumber(amount || 0);
    for (const rInvoice of receiptInvoices) {
        totalAmount = totalAmount.plus(new BigNumber(rInvoice.amount__c || 0));
    }
    let applyAmount = new BigNumber(receiptInvoiceApply.money__c || 0);
    if (totalAmount.isGreaterThan(applyAmount)) {
        throw new Error('开票明细的累计金额应不大于所属的开票记录的申请开票金额。');
    }
}