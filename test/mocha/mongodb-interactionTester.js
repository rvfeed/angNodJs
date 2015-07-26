/**
 * Created with JetBrains WebStorm.
 * User: mikey
 * Date: 5/7/13
 * Time: 9:36 AM
 * To change this template use File | Settings | File Templates.
 */
// Dependencies:
// global install of mocha (npm install -g mocha)

// This is a helper file to evaluate how Mongo queries find data programmatically.
    // it can be deleted if not useful

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

var testDb = null;
var campaignCollection = null;


describe('mongodb-interactionTester.js', function () {
    loggy("outer describe");

    before(function (done) {
        loggy("before");

        var mongoClient = new MongoClient(new Server(mdbip, mdbport, {auto_reconnect:true}, {}));

        mongoClient.open(function (err, mongoClient) {
            loggy("harness mongo connection open");

            if (err) {
                throw err;
            }

            testDb = mongoClient.db(mdbname);

            testDb.collection(constants.CampaignsCollection, function (e1, cc) {

                if (e1) {
                    done(e1);
                } else {
                    campaignCollection = cc;
                    done();
                }
            });

        });

    });


    describe('#one()', function () {
        loggy("inner describe");

        it('queries by date', function (done) {

            var now = moment();

            var thisMorning = now.clone().startOf('day');
//            var thisEvening = thisMorning.clone().add(1, 'days');

            var expectedQuery = {
                startDate:{'$lte':thisMorning.toDate() },
                endDate:{ '$gte':thisMorning.toDate() }
            };

            loggy("using query " + JSON.stringify(expectedQuery));

            var arrayProcessor = function (err, data) {

                loggy("got " + JSON.stringify( data ));
                loggy("got " + data.length + " rows");

                for (var i = 0; i < data.length; i++) {
                    loggy("name: '" + data[i].name +
                        "', start: '" + data[i].startDate +
                        "', end: '" + data[i].endDate +
                        "' ")
                }

                done();

            };

            campaignCollection.find(expectedQuery).toArray(arrayProcessor);


        }); // end of it()

    }); // end of inner describe

}); // end of outer describe

function loggy(log) {
    console.log(moment().format('hh.mm.ss.SSS') + "-mit: " + log);
}
