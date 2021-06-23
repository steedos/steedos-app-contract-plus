const schedule = require('node-schedule');
const objectql = require('@steedos/objectql');

module.exports = {
  run: function () {
    const config = objectql.getSteedosConfig();
    if (!config.projectSchedule) {
      return;
    }
    let rule = config.projectSchedule.network_security__c_rule;
    if (!rule) {
      console.error('network_security__c schedule: ', 'no rule!!!');
      return;
    }
    let spaceId = config.projectSchedule.space;
    if (!spaceId) {
      console.error('network_security__c schedule: ', 'no space!!!');
      return;
    }
    let next = true;
    schedule.scheduleJob(rule, async function () {
      try {
        if (!next) {
          return;
        }
        next = false;
        console.time('network_security__c');
        let steedosSchema = objectql.getSteedosSchema();
        let spaceObj = steedosSchema.getObject('spaces');
        let labObj = steedosSchema.getObject('network_security__c');
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
            'system_query__c': '', // 检查单元
            'monthy_run__c': true, // 最近1月运行情况
            'system_loophole__c': true, // 系统漏洞情况
            'backup__c': true, // 重要数据备份情况
            'name': '安全检查表'+ date, // 名称
            'fault_acceptance__c': true, // 故障受理情况
            'system_execution__c': true, // 各项制度执行情况
            'others__c': '无', // 其他
            'date_time__c': now, // 检查时间
          };
          let todos = [{system:"OA平台"},{system:"DAQ平台"}, {system:"DPM平台"}, {system:"CSMS平台"}, {system:"其他系统"}, {system:"网络设备"}, {system:"服务器"}, {system:"机房环境"}];
          _.each(todos, async (system_query)=>{
            await labObj.insert(Object.assign({}, insertDoc, {
              system_query__c: system_query.system,
              name: system_query.system + insertDoc.name
            }));
          });
        } else {
          console.error('network_security__c schedule: ', 'can not found space!');
        }

        console.timeEnd('network_security__c');
        next = true;
      } catch (error) {
        console.error(error.stack);
        console.error('network_security__c schedule: ', error.message);
        next = true;
      }
    });
  }
};