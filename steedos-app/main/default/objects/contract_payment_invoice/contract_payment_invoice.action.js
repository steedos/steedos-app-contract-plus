module.exports = {
  invoiceIdent: function (object_name, record_id, fields) {
      var doc = Creator.odata.get(object_name, record_id);
      console.log(doc);
      // var newRecord = _.pick(doc, Creator.getObjectFieldsName(object_name));
      // delete newRecord.is_system;
      // delete newRecord._id;
      // newRecord.from_code_id = record_id;
      // Creator.odata.insert(object_name, newRecord, function(result, error){
      //     if(result){
      //         FlowRouter.go(`/app/-/${object_name}/view/${result._id}`)
      //     }
      // });
      console.log(jQuery);
      console.log($);
      console.log('hahahaa');
          
  },
  invoiceIdentVisible: function(object_name, record_id, record_permissions, record){
    return true;
      // if(record._id === 'admin'){return false;}
      // return Creator.baseObject.actions.standard_new.visible() && record.is_system;
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