/*
 * Serve Queue access to our AngularJS client
 */

// 2013-04-03 Copied lock stock & barrel from the prototype,
// updating config location & names

//var express = require('express');
var amqp = require('amqp');
var config = require('../config/acme_config');
var moment = require('moment');


config.message_publishOptions2 = { // list available options
    deliveryMode: 2 // 1 is non-persistent (default), 2 is persistent
// ,	mandatory: false // default is false
// ,	immediate: false // default is false
// ,	contentType: 'application/octet-stream' // default is application/octet-stream
//, 	contentEncoding: null, // default is null
// ,	headers: {} // default is {}
// ,	priority: 5 // 0-9
    // Not declaring replyTo: used for naming a reply queue
};

config.message_queueOptions2 = {
    durable: true
    ,	autoDelete: false
    ,	exclusive: false
};

config.message_exchangeOptions2 = { // list all options
    type: 'direct' // direct, fanout, or topic (default)
// ,	passive: false // default is false, used to check if an exchange is defined
,	durable: true // default is false, durable exchanges persist server restart
,	confirm: true // default is false, if true, channel will send ack
    ,	autoDelete: false // default is true, delete exchange if no more queues bound
// ,	noDeclare: false // default is false, used in deleting unknown exchanges
};

var exchange = null;
var connecting = false;

var publishOnExchange = function( message, callback ){

    exchange.publish('', message, config.message_publishOptions2, function( error ) {
        // error is true false, true indicates a problem.  Node convention is to return null
        //   not false in the instance of no error (or at least so say the mocha tests...)
        var result = null;

        if( error ) {
            console.log( "Error publishing message: " + JSON.stringify( message ) );
            result = error;
        } else {
            console.log( "PutQueue Sent %s", JSON.stringify(message));
        }

//        console.log( "Closing connection" );

//        connection.end();

        callback( result );
    } );
};

var getConnectionAndExchange = function (message, callback) {
    var options = {
        host:config.message_ip,
        port:config.message_port
    };
    console.log("creating connection with options: " + JSON.stringify(options));
    var connection = amqp.createConnection(options);

    connection.on('error', function (error) {

        // TODO: research error handling as errors seem to trigger infinite loop
        console.log("amqp error (put): " + error);

        connection.end();

        callback(error);
    });

    connection.on('ready', function () {

        console.log("PutQueue connection ready.");

        connection.exchange(
            config.message_exchange_name,
            config.message_exchangeOptions2,
            function (_exchange) {

                console.log("PutQueue exchange ready.");

                connection.queue(
                    config.message_queue_name,
                    config.message_queueOptions2,
                    function (queue) {

                        queue.bind(config.message_exchange_name, '');

                        console.log( "Setting connecting to false" );
                        connecting = false;

                        exchange = _exchange;

                        console.log("PutQueue exchange and queue ready @ " + moment().format());

                        publishOnExchange(message, callback);

                    });

            });
    });
};

// Used for debugging only
//var timeoutCount = 0;


/**
 * Put messages on the agent assignment queue
 *
 * 4/29/13: Add in simple connection caching to tolerate potential large loads from
 * rule based agent assignment gone awry.  A simple ladder choice,
 * a) if we have an exchange, publish on the exchange.
 * b) if no exchange, if actively connecting, then "park" the message request while the IO event loops complete
 * c) if no exchange and not connecting, then connect
 * c1) will set connecting to true upon start
 * c2) will set connecting to false and cache the exchange once hooked up
 *
 * @param message  Message to post
 * @param callback Callback to handle errors (there's no positive return value, but the callback will be invoked with null upon successful message post confirmation
 * @constructor
 */
exports.PutQueue = function (message, callback) {

//    console.log("PutQueue request to put on rabbit queue: " + JSON.stringify(message));

    try {
        if (exchange) {
//            console.log("Using cached exchange");
            publishOnExchange(message, callback);
        } else {
            if( connecting ) {
                // Delay a bit and come back in here

                // Used for debugging only
//                timeoutCount ++ ;
//                console.log(  moment().format('hh.mm.ss.SSS') +
//                    ": rabbit connecting, setting delay timeout (count= " + timeoutCount +
//                    ")..." );
//
//                var callbackTimeoutCount = timeoutCount;
                var that = this;

                // setTimeout for recursive calls is deprecated for node 0.10 +
                setImmediate( function(){

                    // Used for debugging only
//                    console.log( moment().format('hh.mm.ss.SSS') +
//                        ": setImmediate for rabbit connection firing, callbackTimeoutCount= " +
//                        callbackTimeoutCount );

                    that.PutQueue( message, callback );
                } );

            } else {
                getConnectionAndExchange(message, callback);

                console.log( "Setting connecting to true" );
                connecting = true;
            }
        }
    } catch (e) {

        console.log("got error with message, " + e);
        callback(e);
    }

};
