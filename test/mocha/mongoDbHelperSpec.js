/**
 * Created with JetBrains WebStorm.
 * User: mikey
 * Date: 5/2/13
 * Time: 8:53 AM
 */
// Dependencies:
// global install of mocha (npm install -g mocha)

var assert = require('assert');
var moment = require('moment');

var mongoHelper = require('../../routes/providers/mongodb-helper');
var constants = require('../../routes/constants.js');


function loggy(log) {
    console.log(moment().format('hh.mm.ss.SSS') + "-mdhs: " + log);
}


describe('mongoDbHelperSpec.js', function () {

    var db;
    var mockCollection;


    // setup & misc helpers:
    var unusedName = "unused";
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
            }
        };
    };

    loggy("mongoDbHelperSpec starting");

    beforeEach(function () {
        //loggy("global beforeEach...");

        mockCollection = makeMockCollectionObject();

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

    describe('#getUserDataForUserName()', function () {
        //loggy("inner describe");

        it('should get the collection by name', function (done) {

            // crux
            mongoHelper.getUserDataForUserName(db,
                unusedName, getCallbackNotExpectedToBeInvoked(done));

            // asserts
            assert.equal(db.collectionFn_names.length, 1);

            assert.equal(db.collectionFn_names[0], constants.UserDataCollection);

            done();
        });

        it('should error if collection errors', function (done) {

            // crux
            mongoHelper.getUserDataForUserName(db, unusedName,
                getCallbackWithExpectedError(collectionError, done));

            assert.equal(db.collectionFn_functions.length, 1);

            // simulate server error
            db.collectionFn_functions[0](collectionError);
        });


        it('should find by userName only', function (done) {

            var name = "find-userName";

            // Happy path through this test is via verifying the query doc call
            mockCollection.verifyQuery = function (doc) {
                assert.deepEqual(doc, {userName:name});

                done();
            };

            // crux
            mongoHelper.getUserDataForUserName(db, name, getCallbackNotExpectedToBeInvoked(done));

            // simulate server collection response
            db.collectionFn_functions[0](null, mockCollection);
        });


        it('should pipe to array', function (done) {

            var name = "pipeToArray";

            // Happy path through this test is via verifying the query doc call
            mockCollection.findReturnObj = {
                toArray:function () {
                    //loggy( "Mock toArray()");

                    done();
                }
            };

            // crux
            mongoHelper.getUserDataForUserName(db, name, getCallbackNotExpectedToBeInvoked(done));

            // simulate server collection response
            db.collectionFn_functions[0](null, mockCollection);
        });

        it('should use parameter callback', function (done) {

            var name = "pipeToArray";
            var callback = function (error) {
                if (error) {
                    done(error);

                }
            };

            // Happy path through this test is via verifying the query doc call
            mockCollection.findReturnObj = {
                toArray:function (toArrayCallback) {
                    assert.equal(toArrayCallback, callback);

                    done();
                }
            };

            // crux
            mongoHelper.getUserDataForUserName(db, name, callback);

            // simulate server collection response
            db.collectionFn_functions[0](null, mockCollection);
        });

    }); // getUserDataForUserName describe


    describe('#getUserData()', function () {
        //loggy("inner describe");

        it('should get the collection by name', function (done) {

            // crux
            mongoHelper.getUserData(db,
                getCallbackNotExpectedToBeInvoked(done));

            // asserts
            assert.equal(db.collectionFn_names.length, 1);

            assert.equal(db.collectionFn_names[0], constants.UserDataCollection);

            done();
        });

        it('should error if collection errors', function (done) {

            // crux
            mongoHelper.getUserData(db,
                getCallbackWithExpectedError(collectionError, done));

            assert.equal(db.collectionFn_functions.length, 1);

            // simulate server error
            db.collectionFn_functions[0](collectionError);
        });


        it('should find all users', function (done) {

            // Happy path through this test is via verifying the query doc call
            mockCollection.verifyQuery = function (doc) {
                assert.equal(doc, null);

                done();
            };

            // crux
            mongoHelper.getUserData(db, getCallbackNotExpectedToBeInvoked(done));

            // simulate server collection response
            db.collectionFn_functions[0](null, mockCollection);
        });


        it('should pipe to array', function (done) {

            // Happy path through this test is via verifying the query toArray call
            mockCollection.findReturnObj = {
                toArray:function () {
                    //loggy( "Mock toArray()");

                    done();
                }
            };

            // crux
            mongoHelper.getUserData(db, getCallbackNotExpectedToBeInvoked(done));

            // simulate server collection response
            db.collectionFn_functions[0](null, mockCollection);
        });

        it('should use parameter callback', function (done) {

            var callback = function (error) {
                if (error) {
                    done(error);
                }
            };

            // Happy path through this test is via verifying the query toArray call
            mockCollection.findReturnObj = {
                toArray:function (toArrayCallback) {
                    assert.equal(toArrayCallback, callback);

                    done();
                }
            };

            // crux
            mongoHelper.getUserData(db, callback);

            // simulate server collection response
            db.collectionFn_functions[0](null, mockCollection);
        });
    });  // getUserData describe


    describe('#getHoldBucketStatistics()', function () {
        //loggy("inner describe");

        it('should get the collection by name', function (done) {

            var params = {};

            // crux
            mongoHelper.getHoldBucketStatistics(db, params,
                getCallbackNotExpectedToBeInvoked(done));

            // asserts
            assert.equal(db.collectionFn_names.length, 1);

            assert.equal(db.collectionFn_names[0], constants.GenPopCollection);

            done();
        });

        it('should error if collection errors', function (done) {

            var params = {};

            // crux
            mongoHelper.getHoldBucketStatistics(db, params,
                getCallbackWithExpectedError(collectionError, done));

            assert.equal(db.collectionFn_functions.length, 1);

            // simulate server error
            db.collectionFn_functions[0](collectionError);
        });


        it('should validate params', function (done) {

            var params = {};

            // crux
            mongoHelper.getHoldBucketStatistics(db, params,
                getCallbackWithExpectedError("agentId parameter missing: {}", done));
            // simulate server collection response
            db.collectionFn_functions[0](null, mockCollection);
        });

        it('should validate null params', function (done) {

            var params = null;

            // crux
            mongoHelper.getHoldBucketStatistics(db, params,
                getCallbackWithExpectedError("agentId parameter missing: null", done));
            // simulate server collection response
            db.collectionFn_functions[0](null, mockCollection);
        });

        it('should call aggregate with correct parameter array', function (done) {

            // Happy path through this test is via verifying the aggregate call upon the
            //  mock collection returned below
            mockCollection.verifyQuery = function (args) {
                // expect 4 args in order
                // 1: match
                // 2: unwind
                // 3: 2nd match
                // 4: group
                // 5: callback function for data

                assert.equal(args.length, 5);

                assert.deepEqual(args[0], { $match:{holdBucket:{$ne:null}}});
                assert.deepEqual(args[1], { $unwind:"$holdBucket" });
                assert.deepEqual(args[2], { $match:{
                    "holdBucket.agent":"fred"
                }});
                assert.deepEqual(args[3], { $group:{ _id:null,
                    agentHoldWorkItems:{ $sum:1 } } });

                done();
            };

            var params = { agentId:'fred' };

            // crux
            mongoHelper.getHoldBucketStatistics(db, params, getCallbackNotExpectedToBeInvoked(done));

            // simulate server collection response
            db.collectionFn_functions[0](null, mockCollection);
        });


        it('should find with correct queryDoc', function (done) {

            // Happy path through this test is via verifying the aggregate call upon the
            //  mock collection returned below
            mockCollection.verifyQuery = function (args) {

                loggy("In first mockCollection.verifyQuery...");

                // Hmm, is this too tricky, to reset the mock verifier while in the mock verifier...
                mockCollection.verifyQuery = function (queryDoc) {
                    loggy("In second/inner mockCollection.verifyQuery...");

                    // think about the date testing logic
                    var today = moment().startOf('day');    // set to 12:00 am today
                    var lowerBound = new Date(today.clone().subtract(3, 'days').format("MM/DD/YYYY"));
                    var upperBound = new Date(today.clone().add(3, 'days').format("MM/DD/YYYY"));


                    assert.deepEqual(queryDoc,
                        {
                            holdBucket:{
                                $ne:null,
                                $elemMatch:{
                                    agent:'fred2',
                                    reminderDate:{
                                        $gte:lowerBound,
                                        $lte:upperBound
                                    }
                                }
                            }
                        });

                    done();
                };

                // define an empty count function to avoid a null reference exception
                mockCollection.findReturnObj = {
                    count:function () {
                    }
                };

                args[4](null, []);

            };

            var params = { agentId:'fred2' };

            // crux
            mongoHelper.getHoldBucketStatistics(db, params, getCallbackNotExpectedToBeInvoked(done));

            // simulate server collection response
            db.collectionFn_functions[0](null, mockCollection);
        });


        it('should return from find / count with data', function (done) {

            // Happy path through this test is via verifying the aggregate call upon the
            //  mock collection returned below
            mockCollection.verifyQuery = function (args) {

                // Hmm, is this too tricky, to reset the mock verifier while in the mock verifier...
                mockCollection.verifyQuery = function () {
                };

                // define an empty count function to avoid a null reference exception
                mockCollection.findReturnObj = {
                    count:function (fn) {
                        fn(null, 5);
                    }
                };

                args[4](null, []);

            };

            var params = { agentId:'fred2' };

            var clientCallback = function (error, results) {
                if (error) {
                    done(error)
                } else {

                    assert.deepEqual(results, {"agentHoldWorkItems":0,"attentionRequiredItems":5});

                    done()

                }
            };

            // crux
            mongoHelper.getHoldBucketStatistics(db, params, clientCallback);

            // simulate server collection response
            db.collectionFn_functions[0](null, mockCollection);
        });


        it('should return find errors to callback', function (done) {

            // Happy path through this test is via verifying the aggregate call upon the
            //  mock collection returned below
            mockCollection.verifyQuery = function (args) {

                // Hmm, is this too tricky, to reset the mock verifier while in the mock verifier...
                mockCollection.verifyQuery = function () {
                };

                // define the count function which will return error / results
                mockCollection.findReturnObj = {
                    count:function (fn) {
                        fn("find error");
                    }
                };

                args[4](null, []);

            };

            var params = { agentId:'fred2' };

            // crux
            mongoHelper.getHoldBucketStatistics(db, params,
                getCallbackWithExpectedError("find error", done));

            // simulate server collection response
            db.collectionFn_functions[0](null, mockCollection);
        });

        it('should return aggregate errors in callback', function (done) {

            // Happy path through this test is via verifying the error returned here
            mockCollection.verifyQuery = function (args) {
                args[4]("mysterious db error");
            };

            var params = { agentId:'fred2' };

            // crux
            mongoHelper.getHoldBucketStatistics(db, params,
                getCallbackWithExpectedError("mysterious db error", done));

            // simulate server collection response
            db.collectionFn_functions[0](null, mockCollection);
        });


    }); // getHoldBucketStatistics describe


    describe('#calculateAgentSavedSummary() (basic error handling)', function () {
        //loggy("inner describe");

        it('should get campaign collection first', function (done) {


            // crux
            mongoHelper.calculateAgentSavedSummary(db,
                getCallbackNotExpectedToBeInvoked(done));

            // asserts
            assert.equal(db.collectionFn_names.length, 1);

            assert.equal(db.collectionFn_names[0], constants.CampaignsCollection);

            done();
        });

        it('should error if campaign collection returns error', function (done) {

            // crux
            mongoHelper.calculateAgentSavedSummary(db,
                getCallbackWithExpectedError(collectionError, done));

            assert.equal(db.collectionFn_functions.length, 1);

            // simulate server error
            db.collectionFn_functions[0](collectionError);
        });

        it('should get work item collection after campaigns', function (done) {
            // crux
            mongoHelper.calculateAgentSavedSummary(db,
                getCallbackNotExpectedToBeInvoked(done));

            assert.equal(db.collectionFn_names.length, 1);

            // simulate server response (
            db.collectionFn_functions[0](null, {});

            assert.equal(db.collectionFn_names.length, 2);

            assert.equal(db.collectionFn_names[0], constants.CampaignsCollection);
            assert.equal(db.collectionFn_names[1], constants.GenPopCollection);


            done();
        });

        it('error from work item collection return handled', function (done) {
            // crux
            mongoHelper.calculateAgentSavedSummary(db,
                getCallbackWithExpectedError("work item collection error", done));

            assert.equal(db.collectionFn_functions.length, 1);

            // simulate server response (
            db.collectionFn_functions[0](null, {});

            assert.equal(db.collectionFn_functions.length, 2);

            db.collectionFn_functions[1]("work item collection error");
        });

    }); // calculateAgentSavedSummary() (basic error handling) describe


    describe('#calculateAgentSavedSummary() (query)', function () {

        var campaignsCollection;
        var workItemsCollection;

        beforeEach(function () {
            //noinspection UnnecessaryLocalVariableJS
            campaignsCollection = mockCollection;

            campaignsCollection.update = function() {
                throw "should initialize update() in test";
            };


            workItemsCollection = makeMockCollectionObject();
        });

        it('should query campaigns when it has both collections', function (done) {

            // Define so as not to explode
            campaignsCollection.findReturnObj = {
                each:function () {
                }
            };

            // Happy path through this test is via verifying the query call upon the
            //  mock campaignsCollection returned below

            // TODO: Come back to this after setting status flag
            // var expectedQuery = { status: ACTIVE }
            var expectedQuery = {}; // for now

//            var now = moment();
//
//            var validStartDate = now.clone().startOf( 'day');
//            var validEndDate = validStartDate.clone().add( 1, 'days' );
//
//            var expectedQuery = {
//                startDate: {'$gte': validStartDate}
//            }
            campaignsCollection.verifyQuery = function (args) {

                assert.deepEqual(args, expectedQuery);

                done();
            };


            // crux
            mongoHelper.calculateAgentSavedSummary(db, getCallbackNotExpectedToBeInvoked(done));

            // simulate server campaignsCollection response
            db.collectionFn_functions[0](null, campaignsCollection);

            // then simulate server workItemsCollection response
            db.collectionFn_functions[1](null, workItemsCollection);
        });

        it('should pipe to each()', function (done) {

            // happy path to done() is via the each call
            campaignsCollection.findReturnObj = {
                each:function () {
                    done();
                }
            };

            // crux
            mongoHelper.calculateAgentSavedSummary(db, getCallbackNotExpectedToBeInvoked(done));

            // simulate server campaignsCollection response
            db.collectionFn_functions[0](null, campaignsCollection);

            // then simulate server workItemsCollection response
            db.collectionFn_functions[1](null, workItemsCollection);
        });


        it('each() error handling', function (done) {

            // happy path to done() is via the each() response error
            campaignsCollection.findReturnObj = {
                each:function (fn) {
                    // fn error should go back to callback
                    fn("each error");
                }
            };

            // crux
            mongoHelper.calculateAgentSavedSummary(db,
                getCallbackWithExpectedError("each error", done));


            // simulate server campaignsCollection response
            db.collectionFn_functions[0](null, campaignsCollection);

            // then simulate server workItemsCollection response
            db.collectionFn_functions[1](null, workItemsCollection);
        });


        it('each returns to parent callback with null campaign', function (done) {

            campaignsCollection.findReturnObj = {
                each:function (fn) {

                    // simulate the end of each iteration by returning nulls
                    fn(null, null);
                }
            };

            // happy path to done() is via each calling back to the
            //   callback from the calculateAgentSavedSummary invocation

            // crux
            mongoHelper.calculateAgentSavedSummary(db, done);

            // simulate server campaignsCollection response
            db.collectionFn_functions[0](null, campaignsCollection);

            // then simulate server workItemsCollection response
            db.collectionFn_functions[1](null, workItemsCollection);
        });


        it('each calls aggregate on work item', function (done) {

            var campaign = {};

            campaignsCollection.findReturnObj = {
                each:function (fn) {

                    // simulate the return of a campaign
                    fn(null, campaign);
                }
            };

            // happy path to done() is seeing an invocation of work item aggregation
            workItemsCollection.verifyQuery = function () {

                done();

            };

            // crux
            mongoHelper.calculateAgentSavedSummary(db, getCallbackNotExpectedToBeInvoked(done));

            // simulate server campaignsCollection response
            db.collectionFn_functions[0](null, campaignsCollection);

            // then simulate server workItemsCollection response
            db.collectionFn_functions[1](null, workItemsCollection);
        });


        it('uses appropriate aggregation params', function (done) {

            var campaign = { _id: "blah blah" };

            campaignsCollection.findReturnObj = {
                each:function (fn) {

                    // simulate the return of a campaign
                    fn(null, campaign);
                }
            };

            // happy path to done() is seeing an invocation of work item aggregation
            workItemsCollection.verifyQuery = function (args) {

                assert.deepEqual(args[0],
                    {
                        $match:{
                            campaignId:"blah blah",
                            dropRep:{$ne:"", $exists:true},
                            repUserName:{$ne:"", $exists:true},
                            dropStatusMapped:
                                "saved" }
                    });


                assert.deepEqual(args[1],
                    {
                        "$group":{
                            _id:{
                                userName:"$repUserName"
                            },
                            fullName:{$first:"$dropRep" },
                            totalWorkItems:{$sum:1},
                            savedAggregatekWh:{$sum:"$aggregatekWh"}
                        }
                    });

                assert.deepEqual(args[2],
                    {
                        $project:{
                            _id:0,
                            userName:"$_id.userName",
                            fullName:"$fullName",
                            totalWorkItems:"$totalWorkItems",
                            savedAggregatekWh:"$savedAggregatekWh"
                        }
                    });

                assert.deepEqual( args[3], {
                    $sort: {
                        savedAggregatekWh:-1
                    }
                } );

                assert.equal( typeof args[4], "function" );

                assert.equal(args.length, 5);

                done();

            };

            // crux
            mongoHelper.calculateAgentSavedSummary(db, getCallbackNotExpectedToBeInvoked(done));

            // simulate server campaignsCollection response
            db.collectionFn_functions[0](null, campaignsCollection);

            // then simulate server workItemsCollection response
            db.collectionFn_functions[1](null, workItemsCollection);
        });



        it('aggregate errors return to callback', function (done) {

            var errrrrrrs = "Aggregate function kablooeyd";

            campaignsCollection.findReturnObj = {
                each:function (fn) {
                    // simulate the return of a campaign
                    fn(null, {});
                }
            };

            // happy path to done() is seeing an invocation of work item aggregation
            workItemsCollection.verifyQuery = function (args) {
                args[4](errrrrrrs);
            };

            // crux
            mongoHelper.calculateAgentSavedSummary(db, getCallbackWithExpectedError(errrrrrrs, done));

            // simulate server campaignsCollection response
            db.collectionFn_functions[0](null, campaignsCollection);

            // then simulate server workItemsCollection response
            db.collectionFn_functions[1](null, workItemsCollection);
        });


        it('aggregate response triggers campaign update', function (done) {

            campaignsCollection.findReturnObj = {
                each:function (fn) {

                    // simulate the return of a campaign
                    fn(null, {});
                }
            };

            workItemsCollection.verifyQuery = function (args) {
                args[4](null, {});
            };

            // happy path to done()
            campaignsCollection.update = function() {
                // get the args from the arguments
                var updateArgs = Array.prototype.slice.call(arguments, 0);

                // use updateArgs here as a native Javascript array.
                assert.equal( 4, updateArgs.length );
                done();
            };

            // crux
            mongoHelper.calculateAgentSavedSummary(db, getCallbackNotExpectedToBeInvoked(done));

            // simulate server campaignsCollection response
            db.collectionFn_functions[0](null, campaignsCollection);

            // then simulate server workItemsCollection response
            db.collectionFn_functions[1](null, workItemsCollection);
        });



        it('aggregate responses are saved with correct arguments', function (done) {

            var aggData = [ "one", "two", "three" ];

            var campaign = { _id: "blah blah" };

            campaignsCollection.findReturnObj = {
                each:function (fn) {

                    // simulate the return of a campaign
                    fn(null, campaign);
                }
            };

            workItemsCollection.verifyQuery = function (args) {
                args[4](null, aggData);
            };

            // happy path to done()
            campaignsCollection.update = function() {
                // get the args from the arguments
                var updateArgs = Array.prototype.slice.call(arguments, 0);

                assert.deepEqual(updateArgs[0], { _id:campaign._id });

                assert.deepEqual(updateArgs[1], { '$set':{
                    agentSavedList:aggData,
                    updateDate: moment().format()
                }});

                assert.deepEqual(updateArgs[2], {safe:true});

                assert.equal( typeof updateArgs[3], "function" );

                // use updateArgs here as a native Javascript array.
                assert.equal(4, updateArgs.length);

                done();
            };

            // crux
            mongoHelper.calculateAgentSavedSummary(db, getCallbackNotExpectedToBeInvoked(done));

            // simulate server campaignsCollection response
            db.collectionFn_functions[0](null, campaignsCollection);

            // then simulate server workItemsCollection response
            db.collectionFn_functions[1](null, workItemsCollection);
        });


        it('campaign update after aggregation error reported', function (done) {

            var errorMessage = "update failed, alas.";

            campaignsCollection.findReturnObj = {
                each:function (fn) {

                    // simulate the return of a campaign
                    fn(null, {});
                }
            };

            workItemsCollection.verifyQuery = function (args) {
                args[4](null, {});
            };

            // happy path to done()
            campaignsCollection.update = function () {
                // get the args from the arguments
                var updateArgs = Array.prototype.slice.call(arguments, 0);

                updateArgs[3](errorMessage);
            };

            // crux
            mongoHelper.calculateAgentSavedSummary(db,
                getCallbackWithExpectedError(errorMessage, done));

            // simulate server campaignsCollection response
            db.collectionFn_functions[0](null, campaignsCollection);

            // then simulate server workItemsCollection response
            db.collectionFn_functions[1](null, workItemsCollection);
        });


        // TODO: Is multiple callbacks one per campaign what we want here?
        it('campaign update all successful calls back', function (done) {

            campaignsCollection.findReturnObj = {
                each:function (fn) {

                    // simulate the return of a campaign
                    fn(null, {});
                }
            };

            workItemsCollection.verifyQuery = function (args) {
                args[4](null, {});
            };

            // happy path to done()
            campaignsCollection.update = function () {
                // get the args from the arguments
                var updateArgs = Array.prototype.slice.call(arguments, 0);

                updateArgs[3](null, "1" );
            };

            // crux
            mongoHelper.calculateAgentSavedSummary(db, done);

            // simulate server campaignsCollection response
            db.collectionFn_functions[0](null, campaignsCollection);

            // then simulate server workItemsCollection response
            db.collectionFn_functions[1](null, workItemsCollection);
        });



    }); // calculateAgentSavedSummary describe


});