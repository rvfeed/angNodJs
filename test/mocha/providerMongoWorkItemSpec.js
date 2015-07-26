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


describe('providerMongoWorkItemSpec', function () {
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

        testDb.collection(constants.GenPopCollection, function (e1, workItemCollection) {

            if (e1) done(e1);

            var workItem = makeSampleWorkItem();
            var objectId = new ObjectID(workItem.workItemId);

            workItemCollection.remove({ _id:objectId }, {w:1}, function (e2, result) {
                if (e2) done(e2);

                console.log("delete success with result " + result);

                workItem["_id"] = objectId;

                workItemCollection.save(workItem, function (e3, save) {
                    if (e3) done(e3);

                    console.log('save happy with result ' + save);

                    done();
                });
            });
        });

//        done();

    });

    describe('#updatePendingAgent()', function () {
        loggy("inner describe");

        it('updates', function (done) {
            loggy("it function");

            var workItem = makeSampleWorkItem();

            var userName = "pendleton";
            var fullname = "Endleton, Parker";

            var dropRep = workItem.dropRep;
            var repUserName = workItem.repUserName;

            var pendingIinfoItem = {
                workItemId:workItem.workItemId,
                pendingAgent:{
                    userName:userName,
                    fullName:fullname
                }
            };
//            loggy( "about to call db" );

            mongoProvider.updatePendingAgent(pendingIinfoItem, function (error) {

                if (error) done(error);

                testDb.collection(constants.GenPopCollection, function (e1, workItemCollection) {
                    if (e1) done(e1);

                    workItemCollection.find(
                        {_id:new ObjectID(workItem.workItemId) }).toArray(function (e2, data) {
                            if (e2) done(e2);

                            assert.equal(data.length, 1, "data length");
                            var item = data[0];

                            assert.deepEqual(item.acmeData, {
                                pendingAgent: {
                                    userName: userName,
                                    fullName: fullname
                                }
                            });
//                            assert.equal(item.pendingAgentFullname, fullname);

                            assert.equal(item.dropRep, dropRep);
                            assert.equal(item.repUserName, repUserName);

                            done();
                        });

                });
            });

        }); // end of it()

    }); // end of inner describe

}); // end of outer describe

function loggy(log) {
    console.log(moment().format('hh.mm.ss.SSS') + "-pmwis: " + log);
}
var makeSampleWorkItem = function () {
    return { //12 by123456789012
        workItemId:"crashTestIdx",
//        "_id":ObjectId("test1234"),
        "accountName":"CRASHTEST DUMMY",
        "accountNumber":"99999991",
        "accountType":"1",
        "aggregatekWh":99238,
        "annualkWh":1352,
        "billingAccountNumber":null,
        "billingPhone":"3154274660",
        "calculated":{
            "monthsUntilCashAward":"",
            "dropDays":"",
            "monthsActive":"",
            "monthsSinceDropped":63
        },
        "campaignCode":"0003",
        "cashbackBalance":null,
        "cashbackDueDate":null,
        "channel":null,
        "commodity":"Electric",
        "contactName":"SPLAT STAR",
        "contactsPerRecord":null,
        "dropOriginSystem":2,
        "dropReason":null,
        "dropRep":"Matthew Bean",
        "dropStatus":"Drop",
        "dropStatusDate":new Date("2007-11-29T00:00:00Z"),
        "dropType":"Drop",
        "energyPlusID":99999999992,
        "eventID":99999999999993,
        "greenBilled":null,
        "greenIndicator":true,
        "lastCallDate":null,
        "lastCallResult":null,
        "lastInvoicesDate":new Date("2007-12-26T00:00:00Z"),
        "loadProfile":"SC1",
        "marketer":"Creative Marketer",
        "masterCustomerID":null,
        "meters":58,
        "mid":"CS1",
        "normalizedAnnualUsage":1352,
        "notificationDate":new Date("2007-11-29T00:00:00Z"),
        "numOfInvoices":1,
        "partner":"Brand - Business",
        "partnerCode":"BRD",
        "phone":"3154274660",
        "premiseStatus":"DROP",
        "priceBand":null,
        "pricing":"0.1182",
        "priorRep":null,
        "priorityLevel":null,
        "promotion":null,
        "promotionCode":null,
        "region":null,
        "reinstatementDate":null,
        "repCode":"26",
        "repUserName":"mbean",
        "saleDate":new Date("2007-10-19T00:00:00Z"),
        "saveCount":null,
        "serviceEndDate":new Date("2007-12-26T00:00:00Z"),
        "serviceStartDate":new Date("2007-11-26T00:00:00Z"),
        "serviceState":"NY",
        "startingRate":0.1182,
        "timesSaved":null,
        "totalAwardsToDate":null,
        "uom":"kWh",
        "utilityAbbr":"NGRID",
        "utilityCode":"02",
        "utilityDropDetail":"Customer Changed to another Service Providers",
        "utilityName":"Niagara Mohawk",
        "utilityState":"NY"
    }
};