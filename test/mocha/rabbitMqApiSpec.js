/**
 * Created with JetBrains WebStorm.
 * User: mikey
 * Date: 4/29/13
 * Time: 9:14 AM
 */
// Dependencies:
// global install of mocha (npm install -g mocha)

// This file will remove then insert a new test-generated work item before each test
// and therefore can test modifications to that WI

var assert = require('assert');
var moment = require('moment');

var rabbit = require('../../routes/rabbit-mq-api');
var config = require('../../config/acme_config');
var amqp = require( 'amqp');

function messageLooper(count, done) {
    var returnCount = 0;

    for (var j = 0; j < count; j++) {

        var message = {
            "test":"This is a loop test",
            "j":j,
            "count":count,
            "timestamp":moment().format()
        };


        var callback = function (error) {

//            loggy("loop callback with return count " +
//                returnCount + ", error '" + error + "' ");

            if (error) {

            loggy("loop callback error with return count " +
                returnCount + ", error '" + error + "' ");

                return done(error);
            } else {
                returnCount++;
                if (returnCount === count) {
                    loggy("Success, counts match.");

                    return done();
                }
                else {
                    return null;
                }
            }

        }
        rabbit.PutQueue(message, callback);
    }
}

describe('rabbitMqApiSpec', function () {

    describe('#test()', function () {
//        loggy("inner describe");


//        it('Send 1e5 messages', function (done) {
//            loggy("POC, send 1e5 messages");
//
//            var count = 1e5;
//
//            messageLooper(count, done);
//        }); // end of it()
//
//        it('Send 5000 messages', function (done) {
//            loggy("POC, send 5000 messages");
//
//            var count = 5000;
//            messageLooper(count, done);
//        }); // end of it()


        it('Send 100 messages', function (done) {
            loggy("POC, send 100 messages");

            var count = 100;
            messageLooper(count, done);
        }); // end of it()


        it('Send 10 messages', function (done) {
            loggy("POC, send 10 messages");

            var count = 10;
            messageLooper(count, done);
        }); // end of it()


        it('Send one message', function (done) {
            loggy("POC, send one message");

            var message = {
                "test": "This is a single test",
                "timestamp": moment().format()
            };

            rabbit.PutQueue( message,  done );

        }); // end of it()


        it('gets messages', function (done) {
            loggy("POC, gets messages");

            var res = {
                send:function (status, message) {
                    console.log("Mock send with status [" + status +
                        "] & Message [" + message +
                        "].");

                    setTimeout(function () {
                        console.log("hope the flush is done, calling done() ");
                        done();
                    }, 1000);
                }
            };

            // FYI simple example of queue reading moved to tests

            var GetQueue = function (req, res) {
                var options = {
                    host:config.message_ip,
                    port:config.message_port
                };
                console.log("creating connection with options: " + JSON.stringify(options));
                var connection = amqp.createConnection(options);

                connection.on('error', function (error) {
                    // TODO: research error handling as errors seem to trigger infinite loop
                    console.log("amqp error (get): " + error);

                    callback(error);

                    connection.end();
                });

                connection.on('ready', function () {

                    connection.exchange(
                        config.message_exchange_name,
                        config.message_exchangeOptions2,
                        function () {

                            connection.queue(
                                config.message_queue_name,
                                config.message_queueOptions2,
                                function (queue) {

                                    queue.bind(config.message_exchange_name, '');
                                    console.log("config Waiting for logs");

                                    queue.subscribe(function (msg) {
                                        console.log(" Queue listener, [got] (@ %s) message: %s",
                                            moment().format('h:mm:ss:S'),
                                            JSON.stringify(msg));

                                        console.log("full message: " + JSON.stringify(msg));
                                    });

                                    res.send(200, "Queue subscribed");
                                })
                        });
                });
            };







            GetQueue(null, res);

        }); // end of it()

//        it('Send 1e5 messages', function (done) {
//            loggy("POC, send 1e5 messages");
//
//            var count = 1e5;
//
//            messageLooper(count, done);
//        }); // end of it()

    }); // end of inner describe

}); // end of outer describe

function loggy(log) {
    console. log(moment().format('hh.mm.ss.SSS') + "-RMAS: " + log);
}
