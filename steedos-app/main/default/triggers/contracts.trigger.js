
const contractRoleIds = ['ZzGK4FKhwYTo8eoJs', 'hkjgnLqHFMMaQ8vkZ', 'psMqNBFrxbz4wZyye', 'tndje5gmT4oZdW5gj', '2XvfHNWMBh4pNB5hK'];

function getContractAdmin(companyId) {
    let admin = '';
    Creator.getCollection('flow_positions').find({
    // this.getObject("flow_positions").find({
        org: companyId,
        role: {
            $in: contractRoleIds
        }
    }).forEach(function (fp) {
        if (admin) {
            return;
        }
        if (fp.users && fp.users[0]) {
            admin = fp.users[0];
        }
    });
    return admin;
}

module.exports = {
  listenTo: 'contracts',
  
  afterInsert: async function () {
  /*
    1.1 如果是已获批的项目，则增加3个日程；
  */
    console.log("afterInsert");
    let doc = this.doc;
    
    let applicant = doc.owner;
    let admin = getContractAdmin(doc.company_id);
    let last_date_delivery = doc.last_date_delivery;
    let last_date_acceptance = doc.last_date_acceptance;
    let last_date_payment = doc.last_date_payment;
    // let eventsCollection = Creator.getCollection('events'); 
    let eventsCollection = this.getObject('events');
    let startHours = 1 * 3600 * 1000;
    let endHours = 10 * 3600 * 1000;

    let eventObj = {
        assignees: [applicant, admin],
        related_to: {
            "o": "contracts",
            "ids": [
                doc._id
            ]
        },
        is_all_day: true,
        space: doc.space,
        owner: applicant
    }

    // 如果有约定交付期限 last_date_delivery
    if (last_date_delivery) {
        eventObj._id = Creator.getCollection('events')._makeNewID();
        eventObj.name = '约定交付期限: ' + doc.name;
        eventObj.start = new Date(last_date_delivery.getTime() + startHours);
        eventObj.end = new Date(last_date_delivery.getTime() + endHours);
        //await this.getObject('events').insert(eventObj);
    }

    // 如果有约定验收期限 last_date_acceptance
    if (last_date_acceptance) {
        eventObj._id = Creator.getCollection('events')._makeNewID();
        eventObj.name = '约定验收期限: ' + doc.name;
        eventObj.start = new Date(last_date_acceptance.getTime() + startHours);
        eventObj.end = new Date(last_date_acceptance.getTime() + endHours);
       //await this.getObject('events').insert(eventObj);
    }

    // 如果有约定付款期限 last_date_payment
    if (last_date_payment) {
        eventObj._id = Creator.getCollection('events')._makeNewID();
        eventObj.name = '约定付款期限: ' + doc.name;
        eventObj.start = new Date(last_date_payment.getTime() + startHours);
        eventObj.end = new Date(last_date_payment.getTime() + endHours);
        await this.getObject('events').insert(eventObj);
    }

  },
  
  afterDelete: async function () { 
    /*
      3.1 删除关联的日程记录
    */
    console.log("afterDelete");
    let doc = this.previousDoc;
    let eventObj = {
        related_to: {
            "o": "contracts",
            "ids": [
                doc._id
            ]
        },
        space: doc.space
    }
    console.log(eventObj);
    let this_ps_all = await this.getObject("events").find(eventObj); 
    console.log(this_ps_all);
    for (let this_ps of this_ps_all) {
      console.log(this_ps);
      await this.getObject("events").delete(this_ps._id);
    }
  } 
}