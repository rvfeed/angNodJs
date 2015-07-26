/*
 * Serve JSON to our AngularJS client
 */


//var express = require('express');
var provider = require('./providers/provider-mongodb').Provider;
var moment = require('moment');
var rabbitMQ = require('./rabbit-mq-api');
var csvProvider = require('./providers/provider-csv');

var config = require('../config/acme_config');
var db = new provider(config.mongodb_name, config.mongodb_ip, config.mongodb_port);

// get the user data

exports.GetLoginUser = function (req, res) {
    res.json(req.user);
};

exports.calculateFields = function (req, res) {

    // TODO: put optional request response handling in

    console.log("api.calculateFields starting");

    db.updateDailyCalculations(function (error) {

        if (error) {
            console.log("updateDailyCalculations error at " + moment().format());
            console.log("updateDailyCalculations error: " + JSON.stringify(error));
        } else {

            console.log("updateWorkItemCalculations done.");
        }
    });

    if (res) {
        res.send(200, "Calculations batch job running on server");
    }

};

// get work item data
exports.getWorkItems = function (req, res) {

    console.log(moment().format() + "-api get Work Items starting");

    var campaignId = req.params.campaignId;
    var limit = req.query.limit || 100;
    var offset = req.query.offset || 0;
    var sort = req.query.sort || '';

    var direction = ( req.query.direction && req.query.direction.toLowerCase() === 'desc')
        ? -1 : 1;


    console.log("Hold in query is :" + req.query.hold)
    var hold = (req.query.hold != undefined) ? req.query.hold : false;
    var attention = (req.query.attention != undefined) ? req.query.attention : false;

    var params = { campaign: campaignId,
        limit: limit,
        offset: offset,
        sort: sort,
        direction: direction,
        hold: hold,
        attention: attention,
        userName: req.user.userName,
        userRole: req.user.role};

    console.log("api get work items: got query " + JSON.stringify(req.query));
    console.log("api get work items: sending parms  " + JSON.stringify(params));

    var currentRes = res;

    db.getWorkItems(params, function (error, GenPop) {

        if (error) {
            currentRes.send(500, error);
        } else {
            currentRes.json({
                GenPopData: GenPop
            });
        }
    });
};

exports.EndOfTheCampaignProcess = function () {
    console.log("EndOfTheCampaignProcess starts at " + moment().format());
    db.EndOfTheCampaignProcessDb(function (error, result) {
        if (error) {
            console.log("EndOfTheCampaignProcess error at " + moment().format());
            console.log("EndOfTheCampaignProcess error: " + JSON.stringify(error));
        } else {
            console.log("EndOfTheCampaignProcess ended at " + moment().format());
        }
    });
}

exports.getQueueLog = function (req, res) {

    var limit = req.query.limit || 100;
    var sort = req.query.sort || '';
    var direction = ( req.query.direction && req.query.direction.toLowerCase() === 'desc')
        ? -1 : 1;

    var params = {
        limit: limit,
        sort: sort,
        direction: direction
        };

    console.log("api get log items: got query " + JSON.stringify(req.query));
    console.log("api get log items: sending parms  " + JSON.stringify(params));

    var currentRes = res;

    db.getQueueLog(params, function (error, QueueLog) {

        if (error) {
            currentRes.send(500, error);
        } else {
            currentRes.json({
                QueueLogData: QueueLog
            });
        }
    });
};

exports.csvDownload = function (req, res) {

    if ( req.user && req.user.role === config.admin_role ) {
        var fields = req.query.fields;

        // CSV FYI: http://pastie.org/2174475
        // from https://groups.google.com/forum/?fromgroups=#!topic/express-js/eZTVTXkhIU4

        console.log(moment().format() + "-api csvDownload data starting");

        var campaignId = req.params.campaignId;
        var limit = req.query.limit || 50000;
        var offset = req.query.offset || 0;
        var sort = req.query.sort || 'accountNumber';

        var direction = ( req.query.direction && req.query.direction.toLowerCase() === 'desc')
            ? -1 : 1;

        var params = { campaign:campaignId,
            limit:limit,
            offset:offset,
            sort:sort,
            direction:direction,
            userName:req.user.userName,
            userRole:req.user.role};

        console.log("csvDownload: got query " + JSON.stringify(req.query));
        console.log("csvDownload: sending parms  " + JSON.stringify(params));

        var currentRes = res;


        db.getWorkItems(params, function (error, items) {

            if (error) {

                console.error("CSV error! " + error);

                console.log(JSON.stringify(error));

                currentRes.send(500, error);
            } else {

                if (items && items.length) {
                    console.log(" csv download got data: " + items.length);

                    res.contentType('csv');

                    // TODO: Parameterize file name with campaign name or user name or date or something
                    res.setHeader('Content-disposition', 'attachment; filename=WorkItems.csv');

                    csvProvider.processToCsv(fields, items, function (data) {
                        res.send(200, data);
                    });
                } else {
                    console.log('csv dl data not as expected: "' + JSON.stringify(items) + '"');
                    res.send(500);
                }

            }
        });
    } else {
        // 401 Unauthorized
        res.send( 401, "Unauthorized for export" );
    }

};

exports.getFilterRecordCount = function (req, res) {

    console.log(moment().format() + "-api.getFilterRecordCount data starting");

    var campaignId = req.params.campaignId;
    var agentId = req.user.userName;

    if (req.query.role) {
        var role = req.query.role;
    }

    var hold = (req.query.hold != undefined) ? req.query.hold : false;
    var attention = (req.query.attention != undefined) ? req.query.attention : false;

    var params = {
        campaign: campaignId,
        agentId: agentId,
        hold: hold,
        role: role,
        attention: attention
    };

    var currentRes = res;


    db.getFilterRecordCount(params, function (error, count) {

        if (error) {
            console.log("error getting count! " + error);

            currentRes.send(500, error);
        } else {
            currentRes.json(count);
        }
    });
};

// get Master Data
exports.MasterData = function (req, res) {
    db.getMasterData(function (error, MasterData) {
        res.json({
            MasterData: MasterData
        });
    });

};


// get User Data
exports.UserData = function (req, res) {
    db.getUserData(function (error, UserData) {
        res.json({
            UserData: UserData
        });
    });

};

// get Saved Filters for user
exports.getSavedFiltersData = function (req, res) {
    var userName = req.user.userName;

    db.getUserDataForUserName(userName, function (error, UserData) {
        res.json({
            UserData: UserData
        });
    });
};

//Save Grid Configuration data for user
// User comes from request via passport
// grid data comes from request body

exports.SaveGridConfiguration = function (req, res) {

    var configurationData = req.body;
    var user = req.user;
//    var params = req.params;

    db.updateUserGridData(configurationData, user.userName, function (error, result) {

        console.log("updateUserData called back, error '" +
            error + "' result '" + result + "'");

        // TODO: better error handling
        if (result == 1) {
            res.json(200, {
                result: result
            });
        } else {
            res.json(500, {
                result: error
            });
        }
    });
};


//Save Filters data
exports.SaveFilters = function (req, res) {

    var configurationData = req.body;
    var user = req.user;
    var params = req.params;

    db.updateUserData(configurationData, params, user.userName, function (error, result) {

        console.log("updateUserData called back, error '" +
            error + "' result '" + result + "'");

        // TODO: better error handling
        if (result == 1) {
            res.json({
                result: result
            });
        } else {
            res.json({
                result: error
            });
        }
    });
};


//Save Campaign data
exports.SaveCampaign = function (req, res) {

    var campaignData = req.body;


    // Saving campaign
    for (var key in campaignData) {

        if (campaignData.hasOwnProperty(key)) {
            var thingy = campaignData[key];

            console.log("SaveCampaign key '" + key +
                "' type '" + typeof thingy +
                "' val '" + JSON.stringify(thingy) +
                "' ");
        } else {
            console.log("Skipping key '" + key + "'");
        }
    }


    db.SaveCampaignData(campaignData, function (error, result) {

        if (error) {
            res.send(501, error);
        } else {
            if (result == 1) {

                res.send(200, "OK (Save Campaign)");

            } else {
                res.json({
                    Campaign: result
                });
            }
        }
    });
};

//Save Campaign Order
exports.SaveCampaignOrder = function (req, res) {

    var campaignData = req.body;
    db.SaveCampaignDataOrder(campaignData, function (error, result) {
        if (result == 1) {
            res.send(200);
        } else {
            res.send(200);
            res.json({
                Campaign: result
            });
        }

    });
};

//Assign Work item to Campaign
exports.UpdateWorkItem = function (req, res) {

    var workItems = req.body;
    var user = req.user;
    db.UpdateWorkItem(workItems, user, function (error, result) {

        if (error) {
            console.log("api UpdateWorkItem error! " + error);

            // TODO: There should be some kind of error response here.
        }
        else {
            // The result from the db is usually (always?) '1', which gets interpreted
            // as a status code.  Since we don't use this on the client, just send 200 OK.

            console.log("api UpdateWorkItem success with result " + result);

            res.send(200);
        }

    });
};


// encapsulate item so indexing doesn't change it.
var processAgentChangeItem = function (item, userName, callback) {

    // Set a timestamp property
    item.timeStamp = moment().format();

    rabbitMQ.PutQueue(item, function (error) {
        if (error) {
            console.error("Error from rabbit: " + error);
            console.error("message data was " + JSON.stringify(item));

            callback(error);
        } else {
            console.log("Message published");

            db.updatePendingAgent(item, function (updateError) {
                if (updateError) {
                    console.error("Error updating pending agent record after " +
                        "message published, item was " + JSON.strifigy(item));

                    callback(updateError);
                } else {
                    console.log("update pending agent work item call returned");
                    // TODO: Happy path, log action

                    // TODO check wiki, Action?
                    // TODO check wiki, Status?
                    // TODO: id or userName, prefer userName
                    var row = {"event": "Agent Action",
                        "byWhom": userName,
                        "from": item.oldAgentFullname,
                        "fromId": item.oldAgentUsername,
                        "to": item.pendingAgent.fullName,
                        "toId": item.pendingAgent.userName,
                        "workItemId": item.workItemId,
                        "action": "assignment request", "status": "pending"};

                    db.LogWorkItem([row], function (logError) {
                        if (logError) {
                            console.error("Error with audit log action item was: " +
                                JSON.stringify(row));

                            callback(logError);
                        } else {
                            console.log("agent update processed");

                            callback(null);
                        }
                    });

                }
            });

        }
    });
};


//Request agent change via rabbit
exports.changeAgent = function (req, res) {

    var updateCount = 0;

    var userName = req.user.userName;
    var data = req.body;


    if (data && data.length && data.length > 0) {
        var len = data.length;

        console.log("Processing agent change request by " + userName + " count = " + len);

        for (var i = 0; i < len; i++) {
            processAgentChangeItem(data[i], userName, function (error) {
                if (error) {

                    console.log("changeAgent: Error with agent processing: " + JSON.stringify(error));

                    res.send(500, error);
                } else {
                    updateCount++;
                    console.log("updated, count is " + updateCount + " of " + len);

                    if (updateCount === len) {
                        res.json({successCount: updateCount });
                    }
                }
            });
        }

        console.log("Done spawning async agent assign requests");

    } else {
        console.error("message data incorrect: " + JSON.stringify(data));
        res.send(500, "data incorrect");
    }

};

//Get Campaigns List
exports.listCampaigns = function (req, res) {
    db.getAllCampaigns(function (error, CampaignsList) {
        res.json({
            CampaignsList: CampaignsList
        });
    });
};

//Get Campaign by Id
exports.getCampaignById = function (req, res) {
    var id = req.params.id;
    db.getCampaignById(id, function (error, Campaign) {
        res.json({
            Campaign: Campaign
        });
    });
};

//Delete Campaign
exports.DeleteCampaign = function (req, res) {
    var id = req.params.id;
    db.deleteCampaign(id, function (error, Campaign) {
        res.json({
            Campaign: Campaign
        });
    });
};

// Update Audit collection with work items log
exports.LogWorkItem = function (req, res) {

    var workItemsToLog = req.body;
    db.LogWorkItem(workItemsToLog, function (error, result) {
        if (error) {
            console.log(error);
        }
        else {
            res.send(result);
        }

    });
};

exports.getHoldBucketStatistics = function (req, res) {

    console.log(moment().format() + "-api.getHoldBucketStatistics data starting");

    var agentId = req.user.userName;
    var params = {
        agentId: agentId
    };
    var currentRes = res;

    db.getHoldBucketStatistics(params, function (error, count) {

        if (error) {
            console.log("error getting count! " + error);
            currentRes.send(500, error);
        } else {
            currentRes.json(count);
        }
    });
};

//Get Campaign by Agent
exports.getCampaignsByAgent = function (req, res) {

    var agentId = req.user.userName;

    db.getCampaignsListByAgent(agentId, function (error, campaigns) {
        res.json({
            CampaignsList: campaigns
        });
    });
};

//Get genPop summary by applying campaign rule
exports.getGenPopSummary = function (req, res) {

    // TODO: Error handling

    var query = req.body;
    console.log("req.body type in api js = " + typeof( query ));

    console.log("req.body in api js = " + JSON.stringify(query));

    db.getGenPopSummaryByCampaignRule(query, function (error, details) {

        console.log("getGenPopSummary for query " +
            JSON.stringify(query) + "was " + JSON.stringify(details));

        res.json({
            Details: details
        });
    });
};

//Save Campaign Rule
exports.saveCampaignRule = function (req, res) {

    var campaign = req.body;

    // Saving campaign
    for (var key in campaign) {
        var thingy = campaign[key];

        console.log("saveCampaignRule key '" + key +
            "' type '" + typeof thingy +
            "' val '" + JSON.stringify(thingy) +
            "' ");
    }

    console.log("save campaign rule with campaign " + JSON.stringify(campaign));

    db.updateCampaignRule(campaign, function (error, result) {
        if (result == 1) {
            res.json({
                result: result
            });
        } else {
            res.json({
                result: error
            });
        }
    });
};


exports.runCampaignRules = function (req, res) {

    console.log("api.runCampaignRules starting");

    var infoCallback = function (error, result) {

        if (error) {
            console.error("Error in runCampaignRules: " + JSON.stringify(error));
        } else {
            console.log("updateGenPopByCampaignRule callback.  Result: " + JSON.stringify(result));
        }
    };

    var agentAssignmentCallback = function (assignmentInfo) {
        console.log("agent assign by rules: " + JSON.stringify(assignmentInfo));

        processAgentChangeItem(assignmentInfo, "rules engine", function (error) {
            if (error) {
                console.log("agentAssignmentCallback: Error with agent processing: " + JSON.stringify(error));
            } else {
                console.log("agentAssignmentCallback success for " + assignmentInfo.workItemId);
            }
        });
    };

    db.updateGenPopByCampaignRuleStep(infoCallback, agentAssignmentCallback);

    if (res) {
        res.send(200, "Rules for work item assignment batch job running on server");
    }
};

exports.updateCampaignCalculations = function (req, res) {

    console.log("api.updateCampaignCalculations starting");

    var infoCallback = function (error, result) {

        if (error) {
            console.log("Error in updateCampaignCalculations: " + JSON.stringify(error));
        } else {
            console.log("updateCampaignCalculations done.  Result: " + JSON.stringify(result));
        }
    };


    db.updateCampaignCalculations(infoCallback);

    if (res) {
        res.send(200, "Updating Campaign Calculations  batch job running on server");
    }
};

exports.agentsWorkItemsSummary = function(req, res){

    db.agentsWorkItemsSummaryDbCall(function (error, details) {

        console.log("getGenPopSummary for query "
            + "was " + JSON.stringify(details));

        res.json({
            Details: details
        });
    });
}