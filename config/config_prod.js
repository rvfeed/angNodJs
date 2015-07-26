/*
 This config file is only used by local dev envionment.
 It will be replaced by the config file under the config folder.

 This file is under version control in github but is not read directly by the app
 The contents must be copied (and updated to reflect the appropriate settings)
 or symlinked to acme_config.js
 */

var config = {};

// Application server and general settings
config.application_domain = "localhost";
config.server_port = 3001;

// database host & settings
config.mongodb_ip = 'localhost';
config.mongodb_name = "ACME";
config.mongodb_port = 27017;

// security provider settings
config.loginProvider = './routes/providers/provider-oauth-login';
config.loginStrategy = 'EnergyPlus';
config.sessionTimeout = 28800 * 1000; // 8 hours

// Agent assignment queue settings
config.message_ip = 'localhost';
config.message_port = '5672';
config.message_exchange_name = 'SalesManagementExchange';
config.message_queue_name = 'SalesManagementQueue';

//data API
//config.acme_api = 'http://ep-cm-api-dev';
//config.acme_api_port = 80;

config.admin_role_ad = 'GG EP Inside Sales Admin DEVQA';
config.agent_role_ad = 'GG EP Inside Sales Agents DEVQA';
config.admin_role = 'ADMIN';
config.agent_role = 'AGENT'

config.oauth_host = 'http://epiis01';
config.oauth_clientID = 'ACME_UI';
config.oauth_clientSecret = '5834f17b3cbb3bac1451d716555efbdd9c4dca38';

config.oauth_auth_server = config.oauth_host + '/OAuthProvider';
config.oauth_token = config.oauth_auth_server + '/oauth/token';
config.oauth_authorize = config.oauth_auth_server + '/oauth/authorize';

config.oauth_resource_endpoint = '/OAuthResourceServer';
config.oauth_user_profile = '/DataApi.svc/web/userinfo';
config.oauth_scope = config.oauth_resource_endpoint + config.oauth_user_profile;
config.oauth_profile_url = config.oauth_host + config.oauth_scope;

config.oauth_callbackURL ='http://10.52.52.163:' + config.server_port + '/';

// Cron scheduling
config.cron_dailyCalculations = '10 0 * * *'; // 12:10 am each day
config.cron_campaignSummarizationCalcs = '59 */1 * * *'; // once an hour at 0:59
config.cron_rulesEngineFiring = '*/6 * * * *'; // 6 times an hour or every 10 min
config.cron_endOfTheCampaignFiring = '59 0 * * *'; // 12:59 am each day


module.exports = config;
