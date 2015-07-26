/**
 * Module dependencies.
 */

var express = require('express');
var passport = require('passport');

var http = require('http');
var util = require('util');

var moment = require('moment');

var config = require('./config/acme_config');
var api = require('./routes/api');

var jobs_manager = require('./jobs/jobs_manager');

// TODO: remove reference when rabbit complete as should only be in api.js
var rabbitMQ = require('./routes/rabbit-mq-api');

// Path reference in the config file defines the source of the provider
// That source must provide the ProviderLogin object
var providerLogin = require(config.loginProvider).ProviderLogin;
var loginProvider = new providerLogin();

passport.serializeUser(loginProvider.serializeUser);

passport.deserializeUser(loginProvider.deserializeUser);

passport.use(config.loginStrategy, loginProvider.passportStrategy);

var cronJob = require('cron').CronJob;

var app = express();

var MemoryStore = express.session.MemoryStore
var sessionStore = new MemoryStore();

app.configure(function () {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    app.use(express.logger('dev'));  //tiny, short, default
    app.use(express.cookieParser());
    app.set('port', config.server_port);
    app.use(express.favicon());
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.session({
        key: 'express.sid',
        secret: 'acme_ui',
        store: sessionStore,
        cookie: {
            maxAge: config.sessionTimeout
        }
    }));

    app.use(function (req, res, next) {
        console.log('logging - %s %s', req.method, req.url);
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '-1');
        next();
    });
    // Initialize Passport
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(app.router);
    app.use(express.static(__dirname + '/app', { maxAge:0 }));
    app.use(express.errorHandler({dumpExceptions:true, showStack:true, showMessage:true}));
});


app.post('/login', loginProvider.postLogin, loginProvider.postLoginCallback);

app.get('/logout', loginProvider.logout);

app.get('/unauthorized', function(req, res){
    res.render('unauthorized');
});

app.all('*', loginProvider.appAll);

app.get('/api/user', api.GetLoginUser);

app.get('/api/MasterData', api.MasterData);
app.get('/api/getWorkItems/:campaignId?', api.getWorkItems);
app.get('/api/UserData', api.UserData);
app.get('/api/SavedFiltersData/:name?', api.getSavedFiltersData);
app.post('/api/SaveFilters', api.SaveFilters);
app.post('/api/SaveGridConfiguration', api.SaveGridConfiguration);

app.post('/api/SaveCampaign', api.SaveCampaign);
app.post('/api/SaveCampaignOrder', api.SaveCampaignOrder);
app.post('/api/UpdateWorkItem', api.UpdateWorkItem);
app.post('/api/changeAgent', api.changeAgent);
app.get('/api/listCampaigns', api.listCampaigns);
app.get('/api/getCampaignById/:id', api.getCampaignById);
app.get('/api/deleteCampaign/:id', api.DeleteCampaign);

app.post('/api/logWorkItem', api.LogWorkItem);

app.get('/api/listCampaignsByAgent/:id?', api.getCampaignsByAgent);
//app.get('/api/workItemDetails/:id?', api.getWorkItemDetails);

//TODO: need to merge both campaign rules in one db call.
app.post('/api/getGenPopSummary', api.getGenPopSummary);  //run campaign edit rule
app.post('/api/saveCampaignRule', api.saveCampaignRule);

app.get('/api/getFilterRecordCount/:campaignId?', api.getFilterRecordCount);

//to get total items in the hold bucket and attention required count
app.get('/api/getHoldBucketStatistics', api.getHoldBucketStatistics);

// TODO: temporary until the rules cron job is running
app.get('/api/fireRules', api.runCampaignRules);

// Not shown in the UI but leave the API calls available for testing
app.get('/api/fireCalcs', api.calculateFields);
app.get('/api/fireCampaignCalcs', api.updateCampaignCalculations);
app.get('/api/agentsWorkItemsSummary', api.agentsWorkItemsSummary);

// CSV download
app.get('/api/csvDownload', api.csvDownload);
app.get('/api/getQueueLog/', api.getQueueLog)


var server = http.createServer(app).listen(app.get('port'), function () {
    console.log("Startup at " + moment().format());
    console.log("ACME server listening on port " + app.get('port'));

/*
    var dailyCalculationsJob = new cronJob({
        cronTime:config.cron_dailyCalculations,
        onTick:function () {
            // Runs every day at 12:10 am
            console.log("Calculating daily fields, job start " + moment().format());
            api.calculateFields();
        },
        start:false
    });

    dailyCalculationsJob.start();

    var campaignWorkItemAgentSummaryCalcJob = new cronJob({
        cronTime:config.cron_campaignSummarizationCalcs, // every hour, start at :59
        onTick:function () {
            console.log("Calculating the Work Item summary by Campaign & Agent job @ " + moment().format());
            api.updateCampaignCalculations();
        },
        start:false
    });

    campaignWorkItemAgentSummaryCalcJob.start();


    var rulesEngineFiring = new cronJob({
        cronTime:config.cron_rulesEngineFiring, // every 10 min
        onTick:function () {
            console.log("Calculating campaign rules @ " + moment().format());
            api.runCampaignRules();
        },
        start:false
    });

    rulesEngineFiring.start();

    var EndOfTheCampaignProcess = new cronJob({
        cronTime:config.cron_endOfTheCampaignFiring, // 12:59 am each day
        onTick:function () {
            api.EndOfTheCampaignProcess();
        },
        start:false
    });

    EndOfTheCampaignProcess.start();
*/
    if (config.run_data_api) {
        jobs_manager.startImportJob();
        jobs_manager.startUserDataRefreshJob();
        jobs_manager.startMasterDataRefreshJob();
//        jobs_manager.activateQueue();
    }
});

