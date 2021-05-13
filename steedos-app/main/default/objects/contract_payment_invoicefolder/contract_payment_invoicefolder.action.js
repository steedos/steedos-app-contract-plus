module.exports = {
  invoiceIdent: function (object_name, record_id, fields) {
    // 获取附件列表
    let cmsfiles = Creator.odata.query('cms_files',  {
      $orderby: 'created desc',
      $top: 5,
      $select: 'name,size,owner,created,modified,parent,company_id,company_ids,locked,versions',
      $expand: 'owner,parent',
      $filter: "(parent/o eq 'contract_payment_invoicefolder') and (parent/ids eq '"+ this.record._id + "')",
      $count: true
    }, true);
    console.log(cmsfiles);
    if(cmsfiles != undefined && cmsfiles.length && cmsfiles.length > 0){
      let invoice_image__c = '';
      cmsfiles.forEach(element => {
        if((element.name.endsWith('.png') || element.name.endsWith('.jpg')) && invoice_image__c == '' ){
          invoice_image__c = element.versions[element.versions.length - 1]
        }
      });
      if(invoice_image__c == ''){
        return ;// 没有获取到附件图片
      }

      var doc = Creator.odata.get(object_name, record_id);
      console.log(doc);
      if(doc){
        let data = {};
        data.invoice_image__c = window.location.origin + "/api/files/files/" +  invoice_image__c;
        // 填充记录数据
        // data.xx = doc.xx
        $.post("/api/aliyun/recognise",data,function(result){
          console.log(result);
        });
      }
    }
  },
  invoiceIdentVisible: function(object_name, record_id, record_permissions, record){
    return true;
  },
  invoiceCheck: function (object_name, record_id, fields) {
     //发票查重验伪
  },
  invoiceCheckVisible: function(object_name, record_id, record_permissions, record){
    return true;
  },
}