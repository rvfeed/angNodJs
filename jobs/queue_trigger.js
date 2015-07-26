var config = require('../config/acme_config');
var Step = require('step');
var request = require('request');

var QueueTrigger = function () {

    var getUrl = function (domain, port, path) {
        return 'http://' + domain + ( port == 80 ? '' : ':' + port ) + path;
    };

    this.runner = function (callback) {

        var url = getUrl(config.acme_api, config.acme_api_port, '/activate/mq');
        console.log("Wake the queue processor calling url: '%s'", url);

        request.get(url, function (error, response, body) {

            try {
                if (error) {
                    callback(error);
                } else {
                    console.log(body);
                    body = JSON.parse(body);
                    callback();
                }
            }
            catch (e) {
                callback(e);
            }
        });
    }
};


module.exports = new QueueTrigger();