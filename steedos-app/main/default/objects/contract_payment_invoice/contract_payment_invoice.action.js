module.exports = {
  invoiceIdent: function (object_name, record_id, fields) {
    var doc = Creator.odata.get(object_name, record_id);
    console.log(doc);
    //  有上传发票图片的才识别
    if(doc && doc.invoice_image__c){
      let data = {};
      data.invoice_image__c = window.location.origin + "/api/files/images/" +  doc.invoice_image__c;

      $.post("/api/aliyun/recognise",data,function(result){
        console.log(result);
      });
    }
  },
  invoiceIdentVisible: function(object_name, record_id, record_permissions, record){
    return true;
  },
  // reset: function(object_name, record_id, fields){
  //     var record = Creator.odata.get(object_name, record_id);
  //     var doc = Creator.odata.get(object_name, record.from_code_id);
  //     var newRecord = _.pick(doc, Creator.getObjectFieldsName(object_name));
  //     newRecord.from_code_id = newRecord._id;
  //     delete newRecord.is_system;
  //     delete newRecord._id;
  //     Creator.odata.update(object_name, record_id, newRecord);
  //     FlowRouter.reload();
  // },
  // resetVisible: function(object_name, record_id, record_permissions, record){
      // if(Creator.baseObject.actions.standard_edit.visible()){
      //     return record.from_code_id;
      // }
  // }
}