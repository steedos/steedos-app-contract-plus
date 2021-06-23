require('dotenv-flow').config();

var server = require('@steedos/meteor-bundle-runner');
var steedos = require('@steedos/core')
var labSchedule = require('./steedos-app/main/default/schedule/lab_inspection_table__c.js');
var netSchedule = require('./steedos-app/main/default/schedule/network_security__c.js');

server.Fiber(function () {
    try {
        server.Profile.run("Server startup", function () {
            server.loadServerBundles();
            steedos.init();
            server.callStartupHooks();
            server.runMain();
            labSchedule.run();
            netSchedule.run();
        })
    } catch (error) {
       console.error(error.stack)
    }
}).run()
