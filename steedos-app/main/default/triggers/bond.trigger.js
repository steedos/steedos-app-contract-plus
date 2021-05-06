const objectql = require('@steedos/objectql');
const util = require('../utils/index');
const _ = require('underscore');

module.exports = {
    listenTo: 'bond__c',

    beforeInsert: async function () {
        if (_.has(this.doc, 'amount__c')) {
            this.doc.amount_han__c = util._numToRMB(this.doc.amount__c);
        }
    },

    beforeUpdate: async function () {
        if (_.has(this.doc, 'amount__c')) {
            this.doc.amount_han__c = util._numToRMB(this.doc.amount__c);
        }
    },

    beforeDelete: async function () {

    },

    afterInsert: async function () {

    },

    afterUpdate: async function () {

    },

    afterDelete: async function () {

    },

}