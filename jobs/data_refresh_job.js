var config = require('../config/acme_config');
var sysInfo = require('./models/sys_info');
var async = require('async');
var request = require('request');

var getUrl = function(domain, port, path){
	return 'http://' + domain  + ( port == 80 ? '' : ':'+ port ) + path;
}

var UserDataRefresh = function(){
	this.runner = function(call_back){
		console.log("Refreshing user data...");
		var url = getUrl(config.acme_api, config.acme_api_port, '/userdata/refresh');
		request.get(
			url,
			function(error, response, body){


				var responseCode = response ? response.statusCode : 'undefined response';

				console.log("UserDataRefresh, error: '" + error + "'" );
				console.log("UserDataRefresh, responseCode: '" + responseCode + "'" );
				console.log("UserDataRefresh, body: '" + body + "'" );

				if (!error && response.statusCode == 200) {
					console.log('Refreshing user data... Done.');
					call_back();
					return;
				}
			}
		);
	}
}

var MasterDataRefresh = function(){
	this.runner = function(call_back){
		console.log("Refreshing master data...");

		var endpoints = [
			{"url":'/masterdata/refresh/utilities', "desc": "utilities"},
			{"url":'/masterdata/refresh/dropstatuses', "desc": "drop statuses"},
			{"url":'/masterdata/refresh/states', "desc": "states"},
			{"url":'/masterdata/refresh/partners', "desc": "partners"}
		]

		var i = -1;
		async.whilst(
			function () { 
				return i < endpoints.length - 1;
			},

			function (my_callback) {
				i += 1;
				end_point = endpoints[i];
				var url = getUrl(config.acme_api, config.acme_api_port, end_point.url);
				request.get(
					url,
					function(error, response, body){
						var responseCode = response ? response.statusCode : 'undefined response';

						console.log("MasterDataRefresh, error: '" + error + "'" );
						console.log("MasterDataRefresh, responseCode: '" + responseCode + "'" );
						console.log("MasterDataRefresh, body: '" + body + "'" );

						if (!error && response.statusCode == 200) {
							console.log("Refreshing " + end_point.desc + "... Done.");
							my_callback();
						}
					}
				);
			},

			function (err) {
				if(err) console.log(err);
				call_back();
			}
		);

	}
}

module.exports = {
	UserDataRefresh: new UserDataRefresh(),
	MasterDataRefresh: new MasterDataRefresh()
}; 