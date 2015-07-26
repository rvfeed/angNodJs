var job_lock = require("./job_lock");
var cronJob = require('cron').CronJob;
var moment = require('moment');
var data_import = require('./data_import');
var data_refresh = require('./data_refresh_job');
var queue_trigger = require('./queue_trigger');

var Jobs = function(){
//	var IMPORT_JOB_LOCK_FILE = "import_job.lock";
	var USER_DATA_REFRESH_JOB_LOCK_FILE = "user_data_refresh_job.lock";
	var MASTER_DATA_REFRESH_JOB_LOCK_FILE = "master_data_refresh_job.lock";

	var import_job = new cronJob({
		cronTime: '*/10 * * * *',
		onTick: function () {

//			console.log("Work Item import cron wake @" + moment().format());
			data_import.runner(function( error ){
                console.log("WorkItem Import cron callback @" + moment().format());

                if( error ) {
                    console.error( "WorkItem Import cron error: " + error );
                }
            });
		},
		start: false
	});

	var userdata_refresh_job = new cronJob({
		cronTime: '*/11 * * * *',
		onTick: function () {
			if(job_lock.isLocked(USER_DATA_REFRESH_JOB_LOCK_FILE)){
                console.log("USER_DATA_REFRESH_JOB_LOCK_FILE present, not refreshing @ " + moment().format());

                return;
			}else{
				job_lock.acquireLock(USER_DATA_REFRESH_JOB_LOCK_FILE);
			}

			console.log("Running the user data refresh process now, job started at " + moment().format());
			data_refresh.UserDataRefresh.runner(function(){
                console.log("USER_DATA_REFRESH_JOB_LOCK_FILE releasing at " + moment().format());
				job_lock.releaseLock(USER_DATA_REFRESH_JOB_LOCK_FILE);
			});
		},
		start: false
	});

	var masterdata_refresh_job = new cronJob({
		cronTime: '*/15 * * * *',
		onTick: function () {
			if(job_lock.isLocked(MASTER_DATA_REFRESH_JOB_LOCK_FILE)){
                console.log("MASTER_DATA_REFRESH_JOB_LOCK_FILE present, not refreshing @ " + moment().format());

                return;
			}else{
				job_lock.acquireLock(MASTER_DATA_REFRESH_JOB_LOCK_FILE);
			}

			console.log("Running the master data refresh process now, job started at " + moment().format());
			data_refresh.MasterDataRefresh.runner(function(){
                console.log("MASTER_DATA_REFRESH_JOB_LOCK_FILE releasing at " + moment().format());

                job_lock.releaseLock(MASTER_DATA_REFRESH_JOB_LOCK_FILE);
			});
		},
		start: false
	});

	var activate_queue = new cronJob({
		cronTime: '*/10 * * * *',
		onTick: function () {
			queue_trigger.runner(function( error ){
                console.log("Activate queue cron callback @" + moment().format());

                if( error ) {
                    console.error( "Activate queue cron error: " + error );
                }
            });
		},
		start: false
	});


	this.startImportJob = function(){
		import_job.start();
	};

	this.startUserDataRefreshJob = function(){
		userdata_refresh_job.start();
	};

	this.startMasterDataRefreshJob = function(){
		masterdata_refresh_job.start();
	};

	this.activateQueue = function(){
		activate_queue.start();
	};
};

module.exports =  new Jobs();