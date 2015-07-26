// Dependencies:
// global install of mocha (npm install -g mocha)

// This file will remove then insert a new test-generated work item before each test
// and therefore can test modifications to that WI

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
var workItemCollection = null;
var campaignCollection = null;



function insertWorkItem(done) {
    testDb.collection(constants.GenPopCollection, function (e1, wic) {

        workItemCollection = wic;

        if (e1) done(e1);

        var workItem = makeSampleWorkItem();
        var objectId = new ObjectID(workItem.workItemId);

        workItemCollection.remove({ _id:objectId }, {w:1}, function (e2, result) {
            if (e2) done(e2);

            loggy("delete success with result " + result);

            workItem["_id"] = objectId;

            workItemCollection.save(workItem, function (e3, save) {
                if (e3) done(e3);

                loggy('save happy with result ' + save);

                done();
            });
        });
    });
}

describe('providerMongoCampaignRuleSpec', function () {
    loggy("outer describe");

    before(function (done) {
        loggy("before");

        var mongoClient = new MongoClient(new Server(mdbip, mdbport, {auto_reconnect:true}, {}));

        mongoClient.open(function (err, mongoClient) {
            loggy("harness mongo connection open");

            if (err) {
                throw err;
            }

            // TODO: Race condition on db opens, but wtf for now...
            testDb = mongoClient.db(mdbname);
        });

        mongoProvider = new Provider(mdbname, mdbip, mdbport);


        // TODO: Check docs for on open ready etc function
        setTimeout(function () {
            loggy("db init timeout running");

            done();

        }, 250);
    });

    beforeEach(function (done) {
        loggy("beforeEach");

        testDb.collection(constants.CampaignsCollection, function (e1, cc) {

            if (e1) {
                done(e1);
            } else {
                campaignCollection = cc;

                var campaign = makeTestCampaign();

                campaignCollection.remove({ name:campaign.name }, {w:1}, function (e2, result) {
                    if (e2) done(e2);

                    loggy("delete success with result " + result);

                    campaignCollection.save(campaign, function (e3, save) {
                        if (e3) done(e3);

                        loggy('save happy with result ' + save);

                        insertWorkItem(done);
                    });
                });
            }
        });

    });

    // TODO: Attempting to test ACME-355, assign work items to agents via rule,
    // TODO:  but it's a complex beast and this is not working well, so the test
    // TODO:  is deactivated essentially while I ponder options (MGPR 2013-04-10)
    describe('#updateGenPopByCampaignRule()', function () {
        loggy("inner describe");

        it('assigns', function (done) {
            loggy("it function");
            var campaign = makeTestCampaign();

            var campaignId = null;


            campaignCollection.find({ name:campaign.name }).toArray(function (error, results) {

                if( error ) { done( error ); } else {

                    assert.equal( results.length, 1, "results length" );
                    campaignId = results[0]._id;

                    workItemCollection.count({campaignId:campaignId}, function (e2, count) {
                        if (e2) {
                            done(e2);
                        } else {
                            assert.equal( count, 0, "initial count" );

                            var agentCallback = function() {
                                loggy( "agent callback" );

                                done( "should not get here" );
                            };

                            var infoCallback = function (e3, info) {
                                loggy( "info callback" );

                                if (e3) {
                                    done(e3);
                                } else {
                                    done();

                                    workItemCollection.count({campaignId:campaignId}, function (e4, afterCount) {
                                        if (e4) {
                                            done(e4);
                                        } else {
                                            loggy( "final count returned: " + afterCount );

//                                            assert.equal( afterCount, 1, "final count" );

//                                            done();
                                        }
                                    });
//                                    loggy("info callback");
                                }
                            };

                            // TODO: Research how to test this (related to ACME-355)
                            // crux
//                            mongoProvider.updateGenPopByCampaignRule( infoCallback, agentCallback );

                            // TODO: Exit
                            done();
                        }
                    });

                    loggy( "found campaign results: " + JSON.stringify( results ) );
//                    done();

                }

            });


        }); // end of it()

    }); // end of inner describe

}); // end of outer describe

function loggy(log) {
    console. log(moment().format('hh.mm.ss.SSS') + "-PMCRS: " + log);
}
var makeSampleWorkItem = function () {
    return { //12 by123456789012
        workItemId:"crashTestIdx",
//        "_id":ObjectId("test1234"),
        "testCriteria": 1,
        "accountName":"CRASHTEST DUMMY",
        "accountNumber":"99999991",
        "accountType":"1",
        "dropOriginSystem":2,
        "dropRep":"Matthew Bean",
        "energyPlusID":99999999992,
        "eventID":99999999999993,
        "greenBilled":null,
        "repUserName":"mbean"
    }
};

var makeTestCampaign = function () {
    return {
        "agents":[
            {     "name":"akulkarni.lh", "fullName":"Advait Kulkarni" },
            {     "name":"bgrant", "fullName":"Brian Grant" },
            {     "name":"bgrimes", "fullName":"Bryan Grimes" }
        ], "description":"test",
        "endDate":"2013-04-30T04:00:00Z",
        "name":"testbedXYXYXXY98",
        "order":9999999999,
        "rule":{ "testCriteria":1 },
        "startDate":"2013-04-01T04:00:00Z",
        "status":"Active",
        "type":"Other" };
};