var events = require('events');
var mongoose = require('mongoose');
var Schema = require('mongoose').Schema;

var config = require('../../config/acme_config');

var mongodb_conn_str = "mongodb://" + config.mongodb_ip + ":" +config.mongodb_port + "/" + config.mongodb_name;
var db = mongoose.createConnection(mongodb_conn_str);

var util = require('util');


var LAST_IMPORT_TIME = 'last_import_time';


var SysInfo = function(){
	var self = this;

	events.EventEmitter.call(this);

	this.schema = Schema(
	{ 
		key: String,
		value: String
	},  { collection: 'SystemInfo' });

	this.model = db.model('SysInfo', self.schema);

	this.getLastImportTime = function(callback){
		this.model.findOne({'key': LAST_IMPORT_TIME}, function(err, doc){
			if (err) {
				console.log(err);
				callback;
			}

			var last_import_time = new Date(18000000);
			if(doc !== null && doc.value !== undefined && doc.value.length > 0){
	  			last_import_time = new Date(Number(doc.value));
	  		}

			callback(err, last_import_time.getTime());
		});
	};

	this.saveLastImportTime = function(date){
		var info = new self.model();

		info.key = LAST_IMPORT_TIME;
		info.value = date;

		var upsertData = info.toObject();
		delete upsertData._id;

		self.model.update({key: LAST_IMPORT_TIME}, upsertData, {upsert: true}, function(err){
			if (err) {
				console.log(err);
		  		self.emit("e_last_import_time_save_failed", {err: err, date: date});
		  		return;
		  	}

		  	self.emit("e_last_import_time_saved", {err: err, date: date});
	    });
	};
}

util.inherits(SysInfo, events.EventEmitter);

module.exports = new SysInfo();