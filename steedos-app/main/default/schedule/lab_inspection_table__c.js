const schedule = require('node-schedule');
const objectql = require('@steedos/objectql');

module.exports = {
  run: function () {
    const config = objectql.getSteedosConfig();
    if (!config.projectSchedule) {
      return;
    }
    let rule = config.projectSchedule.lab_inspection_table__c_rule;
    if (!rule) {
      console.error('lab_inspection_table__c schedule: ', 'no rule!!!');
      return;
    }
    let spaceId = config.projectSchedule.space;
    if (!spaceId) {
      console.error('lab_inspection_table__c schedule: ', 'no space!!!');
      return;
    }
    let next = true;
    schedule.scheduleJob(rule, async function () {
      try {
        if (!next) {
          return;
        }
        next = false;
        console.time('lab_inspection_table__c');
        let steedosSchema = objectql.getSteedosSchema();
        let spaceObj = steedosSchema.getObject('spaces');
        let labObj = steedosSchema.getObject('lab_inspection_table__c');
        let space = await spaceObj.findOne(spaceId);
        if (space) {
          let now = new Date();
          //let date = now.toLocaleDateString();
          let year = now.getFullYear();
          let month = now.getMonth() + 1;
          month = month < 10 ? '0' + month : month;
          let day = now.getDate();
          day = day < 10 ? '0' + day : day;
          let date = year + '-' + month + '-' + day;
          let owner = space.owner;
          let insertDoc = {
            'space': spaceId,
            'owner': 'jeyoP8LKJXrkxE7hj',
            'created': now,
            'created_by': 'jeyoP8LKJXrkxE7hj',
            'air_conditioning__c': '正常', // 空调
            'air_summary__c': '', // 情况摘要
            'humidity__c': '正常', // 湿度
            'humidity_summary__c': '', // 情况摘要
            'name': '机房巡检'+ date, // 名称
            'remarks__c': '', // （详细描述、有关现象、设备品牌、型号等）：
            'review_time__c': now, // 巡检时间
            'reviewer__c': 'jeyoP8LKJXrkxE7hj', // 巡检人
            'router_port_label__c': '正常', // 交换机、路由器端口标签，网线标签，电源线标签齐全，清晰明了
            'router_port_summary__c': '', // 情况摘要
            'temperature__c': '正常', // 温度
            'temperature_summary__c': '', // 情况摘要
            'ground__c': '正常', // 地面
            'ground_summary__c': '', // 情况摘要
            'wall__c': '正常', // 墙壁
            'wall_summary__c': '', // 情况摘要
            'ceiling__c': '正常', // 天花板
            'ceiling_summary__c': '', // 情况摘要
            'mouseTrace__c': '正常', // 鼠蚁
            'mouseTrace_summary__c': '', // 情况摘要
            'explosive__c': '正常', // 易爆易燃
            'explosive_summary__c': '', // 情况摘要
            'clean__c': '正常', // 干净整洁
            'clean_summary__c': '', // 情况摘要
            'detector__c': '正常', // 温湿检测
            'detector_summary__c': '', // 情况摘要
            'lighting__c': '正常', // 照明设施
            'detector_summary__c': '', // 情况摘要
            'ups__c': '正常', // ups配电
            'detector_summary__c': '', // 情况摘要
            'firefighting__c': '正常', // 消防设备
            'detector_summary__c': '', // 情况摘要
          };
          await labObj.insert(insertDoc);
        } else {
          console.error('lab_inspection_table__c schedule: ', 'can not found space!');
        }

        console.timeEnd('lab_inspection_table__c');
        next = true;
      } catch (error) {
        console.error(error.stack);
        console.error('lab_inspection_table__c schedule: ', error.message);
        next = true;
      }
    });
  }
};