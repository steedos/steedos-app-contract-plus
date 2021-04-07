Creator.Objects.contracts.actions = {
    /* standard_edit: {
      label: "编辑",
      sort: 0,
      visible: function (object_name, record_id, record_permissions) {
        // 管理员显示按钮
        var permission = {};
        var record = Creator.getObjectRecord(object_name, record_id);
        if (record_permissions) {
          permission = record_permissions;
        }
        if (record && permission.modifyAllRecords) {
          return true;
        }
        return false;
      }
    }, */
    standard_approve: {
      label: "发起审批",
      visible: function (object_name, record_id, record_permissions) {
        return false;
      }
    }
}  