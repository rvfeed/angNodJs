/**
 * Created with JetBrains WebStorm.
 * User: mikey
 * Date: 5/16/13
 * Time: 5:05 PM
 */

// Dependencies:
// global install of mocha (npm install -g mocha)

// This file will remove then insert a new test-generated work item before each test
// and therefore can test modifications to that WI

var assert = require('assert');
var moment = require('moment');

var Server = require('mongodb').Server;
//var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;


var Provider = require('../../routes/providers/provider-mongodb').Provider;
var config = require('../../config/acme_config');
var constants = require('../../routes/constants.js');

var mdbport = config.mongodb_port;
var mdbip = config.mongodb_ip;
var mdbname = config.mongodb_name;

var mongoProvider = null;

//var testDb = null;
//var campaignCollection = null;



describe('rulesTestSpec', function () {
    loggy("outer describe");

    before(function (done) {
        loggy("before");


        // TODO: Check docs for on open ready etc function for the mongodb provider startup
        mongoProvider = new Provider(mdbname, mdbip, mdbport);
        // Timeout function to give the mongoProvider time to initialize
        setTimeout(function () {
            loggy("db init timeout running");

            done();

        }, 250);

    });



    describe('#fireRulesStep()', function () {
        loggy("inner describe");

        it('works', function (done) {
            loggy("it function");

            var doneCallback = function( error, status ) {
                loggy( "done callback, error '%j', status %j", error, status );

                done( error );
            };

            var agentCallback = function( data ) {
                loggy( "agent callback: '%j'", data );
            }

//            done();
            mongoProvider.updateGenPopByCampaignRuleStep( doneCallback, agentCallback );

        }); // end of it()

    }); // end of inner describe


}); // end of outer describe

function loggy(log) {
    console. log(moment().format('hh.mm.ss.SSS') + "-cres: " + log);
}
