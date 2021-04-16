module.exports = {
    receipt: function(){
      Steedos.CRM.receiptLead(this.record);
    },
    receiptVisible: function(object_name, record_id, permissions, record) {
        if (record && !record.converted) {
            return true
        }
    }
  
  }