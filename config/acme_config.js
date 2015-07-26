/*
This config file is only used by local dev envionment.
It will be replaced by the config file under the config folder.
*/

var config = {};

config.application_domain = "localhost";
config.server_port = 3001;
config.mongodb_ip = 'localhost';
config.mongodb_name = "ACME";
config.mongodb_port = 27017;
config.loginProvider = './routes/providers/provider-local-login';
config.loginStrategy = 'local';

module.exports = config;