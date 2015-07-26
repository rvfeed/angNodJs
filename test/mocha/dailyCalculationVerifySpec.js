/**
 * Created with JetBrains WebStorm.
 * User: mikey
 * Date: 5/7/13
 * Time: 12:43 PM
 *  Dependencies:
 *  global install of mocha (npm install -g mocha)

 The purpose of this file is to test the daily calculation routines
 */

var assert = require('assert');
var moment = require('moment');

var mongoHelper = require('../../routes/providers/mongodb-helper');
var constants = require('../../routes/constants.js');


function loggy(log) {
    console.log(moment().format('hh.mm.ss.SSS') + "-dcvs: " + log);
}


// TODO eventually refactor some common db helper setup
describe('dailyCalculationVerifySpec.js', function () {

    var db;
    var mockWorkItemCollection;


    // setup & misc helpers:
    var collectionError = "db.collection is returning error..";

    var getCallbackNotExpectedToBeInvoked = function (done) {
        return function () {
            done("should not get to callback in this test");
        }
    };


    var getCallbackWithExpectedError = function (message, done) {
        return function (error) {

            assert.equal(error, message);
            done();
        }
    };

    var makeMockCollectionObject = function () {
        return {
            find_queryDocs:[],
            findReturnObj:{ toArray:function () {
            } },
            verifyQuery:null,
            find:function (queryDoc) {

                //loggy("mock collection find: " + JSON.stringify(queryDoc));


                // Needs to be defined by test
                if (this.verifyQuery) {
                    this.verifyQuery(queryDoc);
                }

                this.find_queryDocs.push(queryDoc);

                // Needs to be defined by test
                return this.findReturnObj;
            },
            aggregate_args:[], // Will be an array of arrays, one array per Aggregate invocation
            aggregate:function () {
                // get the args from the arguments
                var args = Array.prototype.slice.call(arguments, 0);
//                loggy( "Mock aggregate called" );

                // use args here as a native Javascript array.

                // store for client use
                this.aggregate_args.push(args);

                // Needs to be defined by test in order to be meaningful
                if (this.verifyQuery) {
                    this.verifyQuery(args);
                }
            },
            update:function () {
                throw "Update must be expected by test";
            }
        };
    };

    loggy("mongoDbHelperSpec starting");

    beforeEach(function () {
        //loggy("global beforeEach...");

        mockWorkItemCollection = makeMockCollectionObject();

        db = {
            collectionFn_names:[],
            collectionFn_functions:[],
            collection:function (name, options, callback) {

                //loggy( "mock collection fn called" );

                // options should never change
                assert.deepEqual(options, {w:1, strict:true });

                this.collectionFn_names.push(name);
                this.collectionFn_functions.push(callback);
            }
        };
    });

    describe('#updateWorkItemCalculations()', function () {
        //loggy("inner describe");

        it('should get the collection by name', function (done) {

            // crux
            mongoHelper.updateWorkItemCalculations(db,
                getCallbackNotExpectedToBeInvoked(done));

            // asserts
            assert.equal(db.collectionFn_names.length, 1);

            assert.equal(db.collectionFn_names[0], constants.GenPopCollection);

            done();
        });

        it('should error if collection errors', function (done) {

            // crux
            mongoHelper.updateWorkItemCalculations(db,
                getCallbackWithExpectedError(collectionError, done));

            assert.equal(db.collectionFn_functions.length, 1);

            // simulate server error
            db.collectionFn_functions[0](collectionError);
        });


        it('should find all', function (done) {

            mockWorkItemCollection.findReturnObj = {
                sort:function () {

                    return {
                        each:function () {
                        }
                    }
                }
            };

            mockWorkItemCollection.verifyQuery = function (doc) {
                assert.deepEqual(doc, undefined);

                done();
            };

            // crux
            mongoHelper.updateWorkItemCalculations(db, getCallbackNotExpectedToBeInvoked(done));

            // simulate server collection response
            db.collectionFn_functions[0](null, mockWorkItemCollection);
        });


        it('should sort', function (done) {

            mockWorkItemCollection.findReturnObj = {
                sort:function (args) {

                    assert.deepEqual(args, {'_id':-1});

                    done();

                    return {
                        each:function () {
                        }
                    }
                }
            };

            // crux
            mongoHelper.updateWorkItemCalculations(db, getCallbackNotExpectedToBeInvoked(done));

            // simulate server collection response
            db.collectionFn_functions[0](null, mockWorkItemCollection);
        });


        it('each error handled', function (done) {

            var error = "eachError";

            mockWorkItemCollection.findReturnObj = {
                sort:function () {
                    return {
                        each:function (fn) {
                            fn(error);
                        }
                    }
                }
            };

            // crux
            mongoHelper.updateWorkItemCalculations(db, getCallbackWithExpectedError(error, done));

            // simulate server collection response
            db.collectionFn_functions[0](null, mockWorkItemCollection);
        });


        it('each null "item" ends iteration', function (done) {

            mockWorkItemCollection.findReturnObj = {
                sort:function () {
                    return {
                        each:function (fn) {

                            // null error & null item signifying end of iteration
                            // and method under test should callback to invoking callback
                            // which is our done() function
                            fn(null, null);
                        }
                    }
                }
            };

            // crux
            mongoHelper.updateWorkItemCalculations(db, done);

            // simulate server collection response
            db.collectionFn_functions[0](null, mockWorkItemCollection);
        });


        it('each item is processed & updated', function (done) {
            var workItem = {
            };

            mockWorkItemCollection.findReturnObj = {
                sort:function () {
                    return {
                        each:function (fn) {

                            // work item as returned by iterator
                            fn(null, workItem);
                        }
                    }
                }
            };


            // Verify via update call
            mockWorkItemCollection.update = function () {
                // get the args from the arguments
                var args = Array.prototype.slice.call(arguments, 0);
                // use args here as a native Javascript array.

                assert.equal(args.length, 4);
                done();
            };
            // crux
            mongoHelper.updateWorkItemCalculations(db, getCallbackNotExpectedToBeInvoked(done));

            // simulate server collection response
            db.collectionFn_functions[0](null, mockWorkItemCollection);
        });

    });

    describe('#updateWorkItemCalculations calc verify()', function () {

        var calculationUpdateWorker = function (workItem, calculated, done) {


            mockWorkItemCollection.findReturnObj = {
                sort:function () {
                    return {
                        each:function (fn) {

                            // work item as returned by iterator
                            fn(null, workItem);
                        }
                    }
                }
            };


            // Verify via update call
            mockWorkItemCollection.update = function () {
                // get the args from the arguments
                var args = Array.prototype.slice.call(arguments, 0);
                // use args here as a native Javascript array.

                assert.deepEqual(args[0],
                    { _id:workItem._id });

                assert.deepEqual(args[1],
                    {
                        $set:{
                            "calculated":calculated
                        }
                    });


                assert.deepEqual(args[2],
                    { safe:true });

                assert.equal(typeof args[3], "function");

                done();

            };
            // crux
            mongoHelper.updateWorkItemCalculations(db, getCallbackNotExpectedToBeInvoked(done));

            // simulate server collection response
            db.collectionFn_functions[0](null, mockWorkItemCollection);

        };

        it('each item processing (empty)', function (done) {

            var workItem = {
                _id:"id0123456789" // has to be 12 chars if it is a string
            };

            var calculated = {
                monthsUntilCashAward:"",
                dropDays:"",
                monthsActive:"",
                monthsSinceDropped:""
            };

            calculationUpdateWorker(workItem, calculated, done);
        });

        it('each item processing (dropDays)', function (done) {

            var now = moment();
            var eightDaysAgo = now.clone().subtract(8, 'days');

            var workItem = {
                _id:"id0123456789", // has to be 12 chars if it is a string
                notificationDate:eightDaysAgo.format()
            };

            var calculated = {
                monthsUntilCashAward:"",
                dropDays:8,
                monthsActive:"",
                monthsSinceDropped:""
            };

            calculationUpdateWorker(workItem, calculated, done);


        });

        it('each item processing (dropDays future)', function (done) {

            var now = moment();
            var notification = now.clone().add(1, 'days');

            var workItem = {
                _id:"id0123456789", // has to be 12 chars if it is a string
                notificationDate:notification.format()
            };

            var calculated = {
                monthsUntilCashAward:"",
                dropDays:"",
                monthsActive:"",
                monthsSinceDropped:""
            };

            calculationUpdateWorker(workItem, calculated, done);
        });




        it('each item processing (calculateMonthsSinceDropped)', function (done) {

            var now = moment();
            var endDate = now.clone().subtract(4, 'months');

            var workItem = {
                _id:"id0123456789", // has to be 12 chars if it is a string
                serviceEndDate:endDate.format()
            };

            var calculated = {
                monthsUntilCashAward:"",
                dropDays:"",
                monthsActive:"",
                monthsSinceDropped:5
            };

            calculationUpdateWorker(workItem, calculated, done);
        });

        it('each item processing (calculateMonthsSinceDropped future)', function (done) {

            var now = moment();
            var endDate = now.clone().add(1, 'days');

            var workItem = {
                _id:"id0123456789", // has to be 12 chars if it is a string
                serviceEndDate:endDate.format()
            };

            var calculated = {
                monthsUntilCashAward:"",
                dropDays:"",
                monthsActive:"",
                monthsSinceDropped:""
            };

            calculationUpdateWorker(workItem, calculated, done);
        });







        it('each item processing (calculateMonthsTillCashAward)', function (done) {

            var now = moment();
            var cashbackDate = now.clone().add(3, 'months');

            var workItem = {
                _id:"id0123456789", // has to be 12 chars if it is a string
                cashbackDueDate:cashbackDate.format()
            };

            var calculated = {
                monthsUntilCashAward:3,
                dropDays:"",
                monthsActive:"",
                monthsSinceDropped:""
            };

            calculationUpdateWorker(workItem, calculated, done);
        });

        it('each item processing (calculateMonthsTillCashAward future)', function (done) {

            var now = moment();
            var cashbackDate = now.clone().subtract(1, 'days');

            var workItem = {
                _id:"id0123456789", // has to be 12 chars if it is a string
                cashbackDueDate:cashbackDate.format()
            };

            var calculated = {
                monthsUntilCashAward:"",
                dropDays:"",
                monthsActive:"",
                monthsSinceDropped:""
            };

            calculationUpdateWorker(workItem, calculated, done);
        });



        /* Months active:  From ACME-82:
         * Months Active
         If  (((serviceEndDate null) or (ServiceEndDate > today)) and ((today > ServiceStartDate) and (ServiceStartDate not Null))) then
         Months Active = months (ServiceStartDate – Today)
         Else
         Months Active = blank
         End If
         */


        it('each item processing (calculateMonthsActive no end)', function (done) {

            var now = moment();
            var startDate = now.clone().subtract(3, 'months');

            var workItem = {
                _id:"id0123456789", // has to be 12 chars if it is a string
                serviceStartDate:startDate.format(),
                serviceEndDate: null
            };

            var calculated = {
                monthsUntilCashAward:"",
                dropDays:"",
                monthsActive:4,
                monthsSinceDropped:""
            };

            calculationUpdateWorker(workItem, calculated, done);
        });

        it('each item processing (calculateMonthsActive future end)', function (done) {

            var now = moment();
            var startDate = now.clone().subtract(5, 'months');
            var endDate = now.clone().add( 1, "days" );

            var workItem = {
                _id:"id0123456789", // has to be 12 chars if it is a string
                serviceStartDate:startDate.format(),
                serviceEndDate: endDate.format()
            };

            var calculated = {
                monthsUntilCashAward:"",
                dropDays:"",
                monthsActive:6,
                monthsSinceDropped:""
            };

            calculationUpdateWorker(workItem, calculated, done);
        });


        it('each item processing (calculateMonthsActive past end)', function (done) {

            var now = moment();
            var startDate = now.clone().subtract(5, 'months');
            var endDate = now.clone().subtract( 1, "days" );

            var workItem = {
                _id:"id0123456789", // has to be 12 chars if it is a string
                serviceStartDate:startDate.format(),
                serviceEndDate: endDate.format()
            };

            var calculated = {
                monthsUntilCashAward:"",
                dropDays:"",
                monthsActive:"",
                monthsSinceDropped:1
            };

            calculationUpdateWorker(workItem, calculated, done);
        });


        it('each item processing (calculateMonthsActive future start)', function (done) {

            var now = moment();
            var startDate = now.clone().add(1, 'days');

            var workItem = {
                _id:"id0123456789", // has to be 12 chars if it is a string
                serviceStartDate:startDate.format()
            };

            var calculated = {
                monthsUntilCashAward:"",
                dropDays:"",
                monthsActive:"",
                monthsSinceDropped:""
            };

            calculationUpdateWorker(workItem, calculated, done);
        });
    }); // updateWorkItemCalculations describe


});