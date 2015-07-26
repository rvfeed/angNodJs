/**
 * Created with JetBrains WebStorm.
 * User: mikey
 * Date: 5/7/13
 * Time: 5:18 PM
 */
// Dependencies:
// global install of mocha (npm install -g mocha)

var assert = require('assert');
var moment = require('moment');

var mongoHelper = require('../../routes/providers/mongodb-helper');
var constants = require('../../routes/constants.js');


function loggy(log) {
    console.log(moment().format('hh.mm.ss.SSS') + "-gwis: " + log);
}


// TODO eventually refactor some common db helper setup

describe('getWorkItemSpec.js', function () {

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

    loggy("getWorkItemSpec starting");

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

    describe('#getWorkItems() (basic error handling)', function () {
        //loggy("inner describe");

        it('should get user data first', function (done) {

            var params = {
                userName: 'freddy'
            };

            // crux
            mongoHelper.getWorkItems( db, params,
                getCallbackNotExpectedToBeInvoked(done));

            // TODO: Review spies, but for now don't worry about the get user data path

            // asserts
            assert.equal(db.collectionFn_names.length, 1);
            assert.equal( db.collectionFn_names[0], constants.UserDataCollection );


            done();
        });

        it('should return user data', function (done) {

            // initialize the return
            // minimal user data needed to show
            var userData = [{
//                userName: 'freddy',
                configuration: [{}]
            }];

            // return user data
            mockCollection.findReturnObj = {
                    toArray:function (toArrayCallback) {

                        assert.equal( db.collectionFn_names.length, 1, "before return" );
                        toArrayCallback( null, userData);
                        assert.equal( db.collectionFn_names.length, 2, "after return" );
                        assert.equal( db.collectionFn_names[1], constants.GenPopCollection );

                        done();
                    }
            };

            var params = {
                userName: 'freddy',
                sort: 'account',
                direction: 1
            };

            // crux
            mongoHelper.getWorkItems( db, params,
                getCallbackNotExpectedToBeInvoked(done));

            // send the mock collection to the user data fn
            db.collectionFn_functions[0](null, mockCollection );
        });


        it('should query work item collection', function (done) {

            var workItemCollection = makeMockCollectionObject();

            // A rich and varied thingy:
            workItemCollection.findReturnObj = {
                sort: function() {

                    // Exit if we get here at all
                    done();

                    return {
                        limit: function() {
                            return {
                                skip: function() {
                                    return {
                                        toArray: function() {}
                                    };
                                }
                            };
                        }
                    };
                }
            };


            // initialize the return
            // minimal user data needed to show
            var userData = [{
//                userName: 'freddy',
                configuration: [{}]
            }];

            // return user data
            mockCollection.findReturnObj = {
                toArray:function (toArrayCallback) {

                    // return valid user data to the user callback
                    toArrayCallback( null, userData);

                    // then return a valid work item collection
                    db.collectionFn_functions[1](null, workItemCollection);
                }
            };

            var params = {
                userName: 'freddy',
                sort: 'account',
                direction: 1
            };

            // crux
            mongoHelper.getWorkItems( db, params,
                getCallbackNotExpectedToBeInvoked(done));

            // send the mock collection to the user data fn
            db.collectionFn_functions[0](null, mockCollection );
        });


        it('should query correctly', function (done) {

            var workItemCollection = makeMockCollectionObject();

            // A rich and varied thingy:
            workItemCollection.findReturnObj = {
                limit: function() {
                    return this;
                },
                skip: function() {
                    return this;
                },
                toArray: function() {
                    return this;
                },
                sort: function() {
                    return this;
                }
            };

            workItemCollection.verifyQuery = function( queryDoc ) {

                // only one find
                assert.deepEqual( queryDoc, {campaignId:null,"dropStatusMapped":{"$ne":"saved"}} );

                done();

            };


            // initialize the return
            // minimal user data needed to show
            var userData = [{
//                userName: 'freddy',
                configuration: [{}]
            }];

            // return user data
            mockCollection.findReturnObj = {
                toArray:function (toArrayCallback) {

                    // return valid user data to the user callback
                    toArrayCallback( null, userData);

                    // then return a valid work item collection
                    db.collectionFn_functions[1](null, workItemCollection);
                }
            };

            var params = {
                userName: 'freddy',
                sort: 'account',
                direction: 1
            };

            // crux
            mongoHelper.getWorkItems( db, params,
                getCallbackNotExpectedToBeInvoked(done));

            // send the mock collection to the user data fn
            db.collectionFn_functions[0](null, mockCollection );
        });


    }); // getWorkItems(1) (basic error handling) describe


    describe('#getWorkItems(2)-campaignwise', function () {

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


        it('should query for campaign', function (done) {
            var ObjectID = require('mongodb').ObjectID;

            var workItemCollection = makeMockCollectionObject();

            // A rich and varied thingy:
            workItemCollection.findReturnObj = {
                limit: function() {
                    return this;
                },
                skip: function() {
                    return this;
                },
                toArray: function() {
                    return this;
                },
                sort: function() {
                    return this;
                }
            };

            workItemCollection.verifyQuery = function( queryDoc ) {

                // only one find
                // Long hex string translation of 'ab1234567890'
                assert.deepEqual( queryDoc, {campaignId: ObjectID( 'ab1234567890')} );

                done();

            };


            // initialize the return
            // minimal user data needed to show
            var userData = [{
//                userName: 'freddy',
                configuration: [{}]
            }];

            // return user data
            mockCollection.findReturnObj = {
                toArray:function (toArrayCallback) {

                    // return valid user data to the user callback
                    toArrayCallback( null, userData);

                    // then return a valid work item collection
                    db.collectionFn_functions[1](null, workItemCollection);
                }
            };

            var params = {
                userName: 'freddy',
                sort: 'account',
                direction: 1,
                campaign: "ab1234567890"
            };

            // crux
            mongoHelper.getWorkItems( db, params,
                getCallbackNotExpectedToBeInvoked(done));

            // send the mock collection to the user data fn
            db.collectionFn_functions[0](null, mockCollection );
        });

    }); // getWorkItems 2 describe


});