Creator.Objects.contract_stamps.triggers = {
  "before.insert.check_stamp_source": {
    on: 'server',
    when: "before.insert",
    todo: function (userId, doc) {
      // 如果盖章来源字段没有值则表示此记录是从申请单同步过来的， 并且印章名称的编码为空才同步此记录,备注字段中传入默认值“普通章” #362
      if (!doc.stamp_source) {
        if (!doc.stamp_name) {
          return false;
        }
        let seal = Creator.getCollection('seal').findOne(doc.stamp_name);
        if (seal) {
          if (seal.code) {
            return false;
          } else {
            doc.stamp_description = doc.stamp_description || '普通章';
          }

        } else {
          return false;
        }
      }

    }
  },
};