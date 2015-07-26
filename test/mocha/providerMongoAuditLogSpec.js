// Dependencies:
// global install of mocha (npm install -g mocha)

var assert = require('assert');
var moment = require('moment');

var Server = require('mongodb').Server;
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;


var Provider = require('../../routes/providers/provider-mongodb').Provider;
var config = require('../../config/acme_config');
var constants = require('../../routes/constants.js');

var mdbport = config.mongodb_port;
var mdbip = config.mongodb_ip;
var mdbname = config.mongodb_name;

var mongoProvider = null;

var testDb = null;


describe('providerMongoAuditLogSpec', function () {
//    loggy("outer describe");

    before(function (done) {
//        loggy("before");

        var mongoClient = new MongoClient(new Server(mdbip, mdbport, {auto_reconnect:true}, {}));

        mongoClient.open(function (err, mongoClient) {
            loggy("harness mongo connection open");

            if (err) {
                throw err;
            }


            // TODO: Check docs for on open ready etc function
            setTimeout(function () {
                loggy("db init timeout running");

                done();

            }, 250);

            // TODO: Race condition on db opens, but wtf for now...
            testDb = mongoClient.db(mdbname);
        });

        mongoProvider = new Provider(mdbname, mdbip, mdbport);


//        // TODO: Check docs for on open ready etc function
//        setTimeout(function () {
//            loggy("db init timeout running");
//
//            done();
//
//        }, 250);
    });

    var count = 0;

    beforeEach(function (done) {
        loggy("beforeEach");

        testDb.collection(constants.AuditCollection, function (e1, collection) {
            if (e1) {
                done(e1);
            } else {
                collection.count(function (e2, beforeCount) {

                    if (e2) {
                        done(e2);
                    } else {

                        loggy("count done with result " + JSON.stringify(beforeCount));
                        count = beforeCount;

                        done();
                    }

                });
            }
        });
    });

    describe('#LogWorkItem()', function () {
//        loggy("inner describe");

        it('updates', function (done) {
            loggy("it function");

            var userName = "atest";
            var oldAgentUsername = "btest";
            var oldAgentFullname = "B Test";
            var pendingAgentUsername = "ctest";
            var pendingAgentFullname = "C Test";

            var workItemId = "auditTestIdx";

            var row = {"event": "Agent Action",
                "byWhom": userName,
                "from": oldAgentFullname,
                "fromId": oldAgentUsername,
                "to": pendingAgentFullname,
                "toId": pendingAgentUsername,
                "workItemId": workItemId,
                "action": "assignment request", "status": "pending"};

            // crux
            mongoProvider.LogWorkItem([row], function (error) {
                if (error) {
                    done(error);
                } else {

                    // validate insert
                    testDb.collection(constants.AuditCollection, function (e1, collection) {
                        if (e1) {
                            done(e1);
                        } else {
                            collection.count(function (e2, afterCount) {

                                if (e2) {
                                    done(e2);
                                } else {

                                    assert.equal( afterCount, count+1, "count after" );

                                    done();
                                }

                            });
                        }
                    });                }
            });


        }); // end of it()

    }); // end of inner describe

}); // end of outer describe

function loggy(log) {
    console.log(moment().format('hh.mm.ss.SSS') + "-pmals: " + log);
}
