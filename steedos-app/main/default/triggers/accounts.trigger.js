const objectql = require('@steedos/objectql');

module.exports = {
    listenTo: 'accounts',

    beforeInsert: async function () {
        await _checkCrediCodeUniq(this.doc, this.spaceId, this.id);
    },

    beforeUpdate: async function () {
        await _checkCrediCodeUniq(this.doc, this.spaceId, this.id);
    },

};

async function _checkCrediCodeUniq(doc, spaceId, id) {
    if (doc.credit_code) {
        let steedosSchema = objectql.getSteedosSchema();
        let supplierObj = steedosSchema.getObject('accounts');
        let creditCode = doc.credit_code;
        let count = await supplierObj.count({ filters: [['space', '=', spaceId], ['credit_code', '=', creditCode], ['_id', '!=', id]] });
        if (count > 0) {
            throw new Error('纳税人识别号已存在，不予执行。');
        }
    }
}