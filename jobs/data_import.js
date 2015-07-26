var config = require('../config/acme_config');
var Step = require('step');
var request = require('request');

var DataImport = function () {

    var getUrl = function (domain, port, path) {
        return 'http://' + domain + ( port == 80 ? '' : ':' + port ) + path;
    };

    this.runner = function (callback) {

        var url = getUrl(config.acme_api, config.acme_api_port, '/import');

        console.log("WorkItem Import job calling url: '%s'", url);

        request.get(url, function (error, response, body) {

            try {
                if (error) {
                    console.error("Error from work item import api: " + error);
                    callback(error);
                } else {
                    console.log("WorkItem Import body: " + body);

                    body = JSON.parse(body);
                    if (body.status) {
                        console.log("WorkItem Import: Please do HTTP GET at /jobstatus?jobId=" + body.jobId + " for the status");

                        var statusUrl = getUrl(config.acme_api, config.acme_api_port, "/jobstatus?jobId=" + body.jobId);

                        console.log("WorkItem Import: status url is " + statusUrl);

                        request.get(statusUrl, function (statusError, statusResponse, statusBody) {
                            console.log("WorkItem Import: jobStatus body is " + JSON.stringify(statusBody));

                        });

                    }
                    else
                        console.log("WorkItem Import status: " + body.message);
                    callback();
                }
            }
            catch (e) {
                console.error("WorkItem Import: Exception with api response, " + e);
                callback(e);
            }
        });
    }
};


module.exports = new DataImport();