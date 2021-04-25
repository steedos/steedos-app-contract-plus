Steedos.CTR = {};

Steedos.CTR.showContractpaymentForm = function (fields, formId, doc, onConfirm, title) {
    var schema = Creator.getObjectSchema({ fields: fields });
    Modal.show("quickFormModal", { formId: formId, title: title || "编辑付款信息", confirmBtnText: `保存`, schema: schema, autoExpandGroup: true, doc: doc, onConfirm: onConfirm }, {
        backdrop: 'static',
        keyboard: true
    });
}

Steedos.CTR.contractPayment = function (record) {
    
    const record_id = record._id;
    const object_name = "contract_payments";
    let doc = {};
    doc.new_payment_status = record.payment_status__c;
    doc.new_payment_date = record.payment_date__c;
    doc.new_billno = record.billno__c;
    var formId = 'contractpaymentForm';
    Steedos.CTR.showContractpaymentForm({
        payment_status__c: {
            label: "付款状态",
            type: 'select',
            options:[
                {label: "已支付", value: "paid"},
                {label: "未支付", value: "unpaid"}
            ],
            group: "付款信息"
        },
        payment_date__c: {
            label: "付款日期",
            type: 'date',
            group: "付款信息"
        },
        billno__c: {
            label: "财务单据号",
            type: 'text',
            group: "付款信息"
        }
    }, formId, record, function (formValues, e, t) {
        let insertDoc = {$set: formValues.insertDoc}
        var result = Steedos.authRequest(`/api/v4/${object_name}/${record_id}`, { type: 'put', async: false, data: JSON.stringify(insertDoc) });
        if (result) {
            FlowRouter.reload();
            Modal.hide(t);
        }
    })
}
