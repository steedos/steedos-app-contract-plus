/**
 * 
 * @param num 
 */
export function _numToRMB(num) {
  if (isNaN(num)) return "无效数值！";
  var strPrefix = "";
  if (num < 0) strPrefix = "(负)";
  num = Math.abs(num);
  if (num >= 1000000000000) return "无效数值！";
  var strOutput = "";
  var strUnit = '仟佰拾亿仟佰拾万仟佰拾元角分';
  var strCapDgt = '零壹贰叁肆伍陆柒捌玖';
  num += "00";
  var intPos = num.indexOf('.');
  if (intPos >= 0) {
    num = num.substring(0, intPos) + num.substr(intPos + 1, 2);
  }
  strUnit = strUnit.substr(strUnit.length - num.length);
  for (var i = 0; i < num.length; i++) {
    strOutput += strCapDgt.substr(num.substr(i, 1), 1) + strUnit.substr(i, 1);
  }
  return strPrefix + strOutput.replace(/零角零分$/, '整').replace(/零[仟佰拾]/g, '零').replace(/零{2,}/g, '零').replace(/零([亿|万])/g, '$1').replace(/零+元/, '元').replace(/亿零{0,3}万/, '亿').replace(/^元/, "零元");
}

export const _contractStates = {
  "pending": "审批中",
  "approved": "已核准",
  "rejected": "已驳回",
  "terminated": "已取消",
  "signed": "已签订",
  "archived": "已归档",
  "droped": "已作废",
  "completed": "已完成",
};

/**
 - 当合同状态为“已核准”、“已归档”、“已签订“时，”提前付款“字段无论为何值时都可发起后续收付款业务（发起应付记录、付款记录和应收记录）。
 - 当合同状态为“审批中“，”提前付款“字段为”是“时，可由执行人发起收付款业务,”提前付款“字段为”否“时，执行人不可发起收付款业务
 - 当合同状态为“已废止“和“已驳回”时，提前付款“字段无论为何值时都不可以发起后续收付款业务。
 * @param contractState 
 * @param advancePayment 
 * @param contractOwner 
 * @param currentUser 
 */
export function isAdvancePaymentLegal(contractState: string, advancePayment: string, contractOwner: string, currentUser: string) {
  if (['approved', 'archived', 'signed'].includes(contractState)) {
    return true;
  }
  if ('pending' == contractState && contractOwner == currentUser && '是' == advancePayment) {
    return true;
  }
  throw new Error('不符合提前付款要求，不予进行');
}

/**
 * 应收记录、应付记录、收款记录、付款记录、收款计划、付款计划增加科目字段 #456
 * 在合同中新建时判断如果 项目有对应项目台账 则此字段必填
 * @param doc 
 */
export function isSubjectNeed(doc: any) {
  let contractId = doc.contract;
  if (contractId) {
    let contract = Creator.getCollection('contracts').findOne(contractId, { fields: { project: 1 } });
    if (contract && contract.project) {
      let projectId = doc.project;
      let epCount = Creator.getCollection('engineering_projects').find({ account_project: projectId, is_deleted: { $ne: true } }).count();
      if (epCount > 0 && !doc.subject) {
        throw new Error('请选择科目');
      }
    }
  }
}