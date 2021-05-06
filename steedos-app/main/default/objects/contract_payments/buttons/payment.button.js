module.exports = {

    payment: function() {
        Steedos.CTR.contractPayment(this.record);
    },
    paymentVisible: function(object_name, record_id, record_permissions) {
        // 如果是公司合同管理财务则显示出该按钮
        var record = Creator.getObjectRecord(object_name, record_id);
        var userId = Steedos.userId();
        var roles = Creator.USER_CONTEXT.user.roles;
        if (record && (roles.includes("contract_finance"))) {
            return true;
        }
        return false;
    }

}