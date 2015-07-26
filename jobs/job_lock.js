var fs = require('fs');

var JobLock = function(){
	this.isLocked = function(lock_name){
		try{
			var flag = fs.existsSync(__dirname + "/locks/" + lock_name);
			return flag;
		}catch(e){
			console.log(e);
			return false;
		}
	}

	this.acquireLock = function(lock_name){
		try{
			var fd = fs.openSync(__dirname + "/locks/" + lock_name, 'w');
			fs.closeSync(fd);
		}catch(e){
			console.log(e);
		}
	}

	this.releaseLock = function(lock_name){
		try{
			fs.unlinkSync(__dirname + "/locks/" + lock_name);
		}catch(e){
			console.log(e);
		}
	}
}

module.exports =  new JobLock();