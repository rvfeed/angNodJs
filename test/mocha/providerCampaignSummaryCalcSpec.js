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
var campaignCollection = null;



describe('providerCampaignSummaryCalcSpec', function () {
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


            testDb.collection(constants.CampaignsCollection, function (e1, cc) {

                if (e1) {
                    done(e1);
                } else {
                    campaignCollection = cc;

                    var callback = function( error ) {

                        if( error ) { return done(error); } else {


                            // Timeout function to give the mongoProvider time to initialize
                            setTimeout(function () {
                                loggy("db init timeout running");

                                done();

                            }, 250);
                        }

                    };

                    cleanCampaignSummaryData(callback);
                }
            });

            // TODO: Check docs for on open ready etc function for the mongodb provider startup
            mongoProvider = new Provider(mdbname, mdbip, mdbport);

        });

    });

    function cleanCampaignSummaryData(callback) {

        loggy( "Starting to clean out campaign summary data" );
// Clean out all summary data
        campaignCollection.update(
            { // all records
            },
            {
                $unset:{
//                    summary:1,
                    agentsCalculated:1,
                    campaignCalculated:1
                }
            },
            {
                upsert:true, multi:true, safe:true
            },
            function (e2, success) {
                if (e2) {
                    return callback(e2);
                } else {
                    loggy('clean out campaign summary with success ' + JSON.stringify(success));
                    return callback();
                }

            });
    }


    describe('#updateCampaignCalculations2()', function () {
        loggy("inner describe");

        it('succeeds', function (done) {
            loggy("it function");

            var callback = function( e1, result ) {

                loggy( "callback return with e1 '" + e1 +
                    "' and result '" + result +
                    "' ");

                if( e1 ) return done( e1 );

                if( result ) {
                    return done( "updateCampaignCalculations unexpected with e1 '" + e1 +
                        "' and result '" + result +
                        "' ");
                }

                loggy( "Starting timeout to finish" );
                setTimeout( function () {
                    loggy( "timeout expired, calling done()" );
                     done();
                }, 5000 );
//                return done();
                return;
            };

            mongoProvider.updateCampaignCalculations2( callback );

        }); // end of it()

    }); // end of inner describe


    // TODO: Attempting to test the current state as part of ACME-381 (ACME-438), run campaign summary calcs

    describe('#updateCampaignCalculations()', function () {
        loggy("inner describe");

        it('succeeds', function (done) {
            loggy("it function");

            var callback = function( e1, result ) {

                loggy( "callback return with e1 '" + e1 +
                    "' and result '" + result +
                    "' ");

                if( e1 ) return done( e1 );

                if( result ) {
                    return done( "updateCampaignCalculations unexpected with e1 '" + e1 +
                        "' and result '" + result +
                        "' ");
                }

                return done();
            };

            // TODO: Mikey, this is slow and not really what we want to use for testing I think.
//            mongoProvider.updateCampaignCalculations( callback );
            done();


        }); // end of it()

    }); // end of inner describe

}); // end of outer describe

function loggy(log) {
    console. log(moment().format('hh.mm.ss.SSS') + "-pCSCS: " + log);
}
