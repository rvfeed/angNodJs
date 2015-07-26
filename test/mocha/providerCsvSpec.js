// Dependencies:
// global install of mocha (npm install -g mocha)

// This file will remove then insert a new test-generated work item before each test
// and therefore can test modifications to that WI

var assert = require('assert');
var moment = require('moment');

var csvProvider = require('../../routes/providers/provider-csv');

describe('providerCsvSpec', function () {
//    loggy("outer describe");
//
//    before(function (done) {
//        loggy("before");
//
//        done();
//    });
//
//    beforeEach(function (done) {
//        loggy("beforeEach");
//
//        done();
//    });

    describe('#test()', function () {
//        loggy("inner describe");

        it('proof of concept', function (done) {
            loggy("POC, ACME-310");

            csvProvider.test();

            done();

        }); // end of it()

    }); // end of inner describe

}); // end of outer describe

function loggy(log) {
    console. log(moment().format('hh.mm.ss.SSS') + "-PCSV: " + log);
}
