var Server = require('mongodb').Server;
var MongoClient = require('mongodb').MongoClient;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

var constants = require('../constants.js');
var moment = require('moment');

var queryHelper = require('../query-helper.js');
var mongoHelper = require('./mongodb-helper');

// Flow control libraries, not sure if we need both
var Step = require('step');
var async = require('async');


// TODO: Remove after refactor?
var collectionOptions = {w: 1, strict: true };

Provider = function (dbName, host, port) {

    var check = function (name) {

        that.db.collection(name, collectionOptions, function (err) {
            if (err) {
                console.error("collection does not exist at startup: " + name + ", " + err);
            } else {
                console.log("Collection OK for: " + name);
            }
        });
    };

    console.log("Provider-Mongo initializing:  dbName: '" + dbName +
        "' host: '" + host +
        "' port: '" + port +
        "' ");

//    console.error("Example error (in mongo provider init) at " + moment().format( "h:mm:ss.SSS" ) );

    var mongoClient = new MongoClient(new Server(host, port, {auto_reconnect: true}, {}));

    var that = this;

    mongoClient.open(function (err, mongoClient) {
        console.log("mongoClient, opened");

        if (err) {
            throw err;
        }

        that.db = mongoClient.db(dbName);

        // check all collections
        for (var key in constants) {
            check(constants[key]);
        }

    });

    console.log("Provider initialized.");
};

exports.Provider = Provider;


// ACME DB calls defined here

// TODO: Remove after refactor
//get general collection from DB.  Expect the collection to exist and fail if it does not.
Provider.prototype.getCollectionFromDB = function (collectionName, callback) {

//    console.log( "getCollectionFromDB for " + collectionName );

    this.db.collection(collectionName, collectionOptions, callback);
};

//get work item data from WorkItem Collection
Provider.prototype.getWorkItems = function (params, callback) {
    mongoHelper.getWorkItems(this.db, params, callback);

};

//get all the expired campaigns
Provider.prototype.EndOfTheCampaignProcessDb = function (callback) {
    var expiredCampIds = [];
    var db = this.db;
    this.getCollectionFromDB(constants.CampaignsCollection, function (error, campaigns_collection) {
        if (error) {
            callback(error);
        } else {
            var nowDate = mongoHelper.currentDate();

            campaigns_collection
                .find({endDate: {"$lt": new Date(nowDate)}})
                .toArray(function (err, CampaignsList) {
                    if (error) {
                        callback(error);
                    } else {

                        var expiredCampLength = CampaignsList.length;
                        for (var t = 0; t < expiredCampLength; t++) {
                            expiredCampIds.push(CampaignsList[t]._id);
                        }
                        mongoHelper.EndOfTheCampaignProcessHelper(db, expiredCampIds, callback)

                    }
                });
        }
    });

};

//get queue log item data from Queuelog Collection
Provider.prototype.getQueueLog = function (params, callback) {
    mongoHelper.getQueueLog(this.db, params, callback);

};

/**
 * Get the hold bucket statistics (for an agent).  Provide the number of items on hold,
 * as well as the number of items needing attention (having a reminder date within 3 days of now)
 *
 * @param params Params for query, currently only the agent's userName
 * @param callback callback (error, data) for returning data to the request
 */
Provider.prototype.getHoldBucketStatistics = function (params, callback) {

    mongoHelper.getHoldBucketStatistics(this.db, params, callback);
};


//get count matching user query filter
Provider.prototype.getFilterRecordCount = function (params, callback) {

    // campaignId

    var campaignId = params.campaign;

    var that = this;

    var holder = { callback: callback };

    var userName = params.agentId;
    var checkGenPopFlag = true;

    console.log("get work items, request user '" + userName + "' " +
        campaignId ? "campaign '" + campaignId + "'" : "GenPop" + "check" + checkGenPopFlag);

    this.getUserDataForUserName(userName, function (error, userData) {
        if (error) {
            console.log('Error getting user data: ' + JSON.stringify(error));
            callback(error);
        } else {

            var configuration = getConfiguration(userData);
            var queryFilter = {};
            //ACME-498: check for configuration &  queryFilter existence in case of new user
            if (configuration && configuration.filters) {
                queryFilter = queryHelper.makeFilterQueryObject(configuration.filters);
            }
            console.log("query filter : " + JSON.stringify(queryFilter));
            that.getCollectionFromDB(constants.GenPopCollection, function (error, workItemCollection) {
                if (error) {
                    holder.callback(error);
                } else {

                    var objectId = null;
                    if (campaignId) {
                        checkGenPopFlag = false;
                        objectId = new ObjectID(campaignId);
                        queryFilter.campaignId = objectId;
                    }

                    if (params.role == "AGENT") {
                        checkGenPopFlag = false;
                        if (params.hold == 1) {
                            queryFilter.holdBucket = { $elemMatch: { agent: userName } };

                        } else if (params.attention == 1) {

                            var plusMinus3Days = mongoHelper.getPlusMinus3Days();

                            console.log("plusMinus3Days---" + JSON.stringify(plusMinus3Days));

                            queryFilter.holdBucket = { $elemMatch: {agent: userName, reminderDate: { $gte: plusMinus3Days.minus3Days, $lte: plusMinus3Days.plus3Days} } };
                        } else {
                            queryFilter.repUserName = userName;
                        }
                    }else if(!campaignId){
                        // query for admin login and genpop page
                            queryFilter.dropStatusMapped =
                                queryFilter.dropStatusMapped || {$ne:"saved"};
                            queryFilter.campaignId = null;
                        }


                    console.log("Querying with count: " + JSON.stringify(queryFilter));

                    // Find the work items and when they are returned, pass them into the evaluate work
                    // item function which will return to client
                    workItemCollection
                        .find(queryFilter)
                        .count(function (countError, data) {
                            if (countError) {
                                console.log("db count, error: " + error);

                                holder.callback(countError);
                            } else {
                                console.log("db count, data: " + JSON.stringify(data));

                                holder.callback(null, {count: data});
                            }

                        });
                }
            });

        }

    });


};


//update the 'calculated' subdocument for all work items
Provider.prototype.updateDailyCalculations = function (callback) {

    if (this.db) {
        console.log("updateDailyCalculations starting the calculations");

        mongoHelper.updateWorkItemCalculations(this.db, callback);
    } else {
        callback("db not yet initialized");
    }

};

// TODO Remove after refactor
var getConfiguration = function (userData) {

    if (userData && userData.length === 1) {
        var userDoc = userData[0];

        // ACME-482: converted configuration as an object from array
        //so check configuration availability

        if (userDoc && userDoc.configuration) {
            return userDoc.configuration;
        }
    }
};


/**
 * Get all the user data
 * @param callback function signature (error, dataFromFind)
 */
Provider.prototype.getUserData = function (callback) {
    mongoHelper.getUserData(this.db, callback);
};

/**
 * Get the user data for the specified user name
 *
 * @param userName userName to find
 * @param callback function signature (error, dataFromFind)
 */
Provider.prototype.getUserDataForUserName = function (userName, callback) {
    mongoHelper.getUserDataForUserName(this.db, userName, callback);
};


//Update UserData Collection (saving GenPop page filter options in UserData Collection)
Provider.prototype.updateUserData = function (configurationData, params, userName, callback) {

    this.getCollectionFromDB(constants.UserDataCollection, function (error, userdata_collection) {
        if (error) {
            callback(error);
        } else {

            console.log("updateUserData (for '" + userName +
                "') with config " + JSON.stringify(configurationData.filters));
            console.log("params are " + JSON.stringify(params));

            userdata_collection.update(
                {userName: userName},
                {"$set": {"configuration.filters": configurationData.filters}},
                {safe: true},
                callback);
        }
    });
};


//Update user grid Collection (saving GenPop page grid options in UserData Collection for the specified user
// Grid data must be in an array in case the grid configuration contains a field with a $ such as
// a mongo query object.
Provider.prototype.updateUserGridData = function (gridConfiguration, userName, callback) {

    this.getCollectionFromDB(constants.UserDataCollection, function (error, userdata_collection) {
        if (error) {
            callback(error);
        } else {

            console.log("updateUserGridData (for '" + userName +
                "') with config " + JSON.stringify(gridConfiguration));
//            console.log( "params are " + JSON.stringify(params) );

            userdata_collection.update(
                {userName: userName},
                {"$set": {"configuration.grid": gridConfiguration}},
                {safe: true},
                callback);
        }
    });
};
//get Master Data from db
Provider.prototype.getMasterData = function (callback) {

    this.getCollectionFromDB(constants.MasterDataCollection, function (error, masterdata_collection) {
        if (error) {
            callback(error);
        } else {
            masterdata_collection.find().toArray(function (err, MasterData) {
                if (error) {
                    callback(error);
                } else {
                    callback(null, MasterData);
                }
            });
        }
    });
};


//Get all campaigns list
Provider.prototype.getAllCampaigns = function (callback) {

    this.getCollectionFromDB(constants.CampaignsCollection, function (error, campaigns_collection) {
        if (error) {
            callback(error);
        } else {
            var nowDate = mongoHelper.currentDate();

            console.log("Now Date **************** " + new Date(nowDate));
            console.log("Now Date ISO string**************** " + nowDate);

            campaigns_collection
                .find({endDate: {"$gte": new Date(nowDate)}})
                .sort({ order:1 })
                .toArray(function (err, CampaignsList) {
                    if (error) {
                        callback(error);
                    } else {
                        callback(null, CampaignsList);
                    }
                });
        }
    });
};

//Get Campaign details  By ID
Provider.prototype.getCampaignById = function (id, callback) {

    var that = this;

    this.getCollectionFromDB(constants.CampaignsCollection, function (error, campaigns_collection) {
        if (error) {
            callback(error);
        } else {
            var oid = new ObjectID(id);
            campaigns_collection.find({_id: oid}).toArray(function (err, Campaign) {
                if (err) {
                    console.log("getCampaignById error " + err);
                    callback(err);
                } else {
//                     console.log("getCampaignById success ");
                    console.log("Loaded campaign: " + JSON.stringify(Campaign));

                    callback(null, Campaign);
                }
            });
        }
    });
};

// TODO: temporary


function objectHelperLogger(thingy) {

    if (thingy != null) {
        for (var key in thingy) {

            var thingType = typeof thingy[key];

            if (thingType === 'function') {
//            console.log('skipping function ' + key);
            } else if (thingType === 'object') {
                console.log("thingy key '" + key +
                    "' is val '" + JSON.stringify(thingy[key]) +
                    "' object, so recursing... ");

                console.log('Prototype of ' + key +
                    ' is ' + Object.prototype.toString.apply(thingy[key]));

                objectHelperLogger(thingy[key]);

                console.log('done with ' + key);
//
            } else {
                console.log("thingy key '" + key +
                    "' is val '" + JSON.stringify(thingy[key]) +
                    "' type '" + typeof thingy[key] +
                    "'");
            }
        }
    } else {
        console.log("Thingy is null");
    }
}


//Delete Campaign
Provider.prototype.deleteCampaign = function (id, callback) {

    this.getCollectionFromDB(constants.CampaignsCollection, function (error, campaigns_collection) {
        if (error) {
            callback(error);
        } else {
            var oid = new ObjectID(id);
            campaigns_collection.remove({_id: oid}, function (err, result) {
                if (err) {
                    console.log("campaign_collection.delete: err = " + err);
                } else {
                    console.log("campaign_collection.delete: result = " + result);
                    callback(null, result);
                }
            });
        }
    });
};

function isObjectEmpty(object) {
    var isEmpty = true;
    for (var key in object) {
        isEmpty = false;
        break; // exiting since we found that the object is not empty
    }
    return isEmpty;
}

// Create new campaign and update existing campaign
Provider.prototype.SaveCampaignData = function (campaignData, callback) {
    this.getCollectionFromDB(constants.CampaignsCollection, function (error, campaign_collection) {
        if (error) {
            console.log("error getting collection");
            callback(error);
        } else {

            console.time("saveCampaign");
            console.log("Save starting at " + moment().format());

            if (campaignData["_id"] != null) {
                campaignData["_id"] = new ObjectID(campaignData["_id"]);
            }


//            var date =  campaignData.startDate;
//
//            console.log("save-startDate            changed: " + date);
//            if (typeof date != "string") {
//
//                try {
//                    console.log("save-startDate        getFullYear: " + date.getFullYear());
//                    console.log("save-startDate           getMonth: " + date.getMonth());
//                    console.log("save-startDate            getDate: " + date.getDate());
//                    console.log("save-startDate           getHours: " + date.getHours());
//                    console.log("save-startDate         getMinutes: " + date.getMinutes());
//                    console.log("save-startDate  getTimezoneOffset: " + date.getTimezoneOffset());
//                    console.log("save-startDate        toISOString: " + date.toISOString());
//                    console.log("save-startDate        toUTCString: " + date.toUTCString());
//                } catch (error) {
//                    console.log("oops: error is " + error);
//                }
//            }else {
//                console.log( "was a string" );
//            }

            // Dates are JS dates in the UI but get serialized to strings (UTC date string) when sent to the server
            // Convert back to Date objects before saving to persist the correct format
            var startDate = new Date(campaignData.startDate);
            var endDate = new Date(campaignData.endDate);

//            console.log( "Saving start date: " + startDate );

            campaignData.startDate = startDate;
            campaignData.endDate = endDate;

            console.log("campaignData1 = " + JSON.stringify(campaignData));

            console.log("inspecting (campaignData[\"rules\"][0]): |" + campaignData["rules"][0] + "|");

            if (!isObjectEmpty(campaignData["rules"][0])) {

                console.log("typeof rules is " + typeof campaignData.rules);
                console.log("typeof rules[0] is " + typeof campaignData.rules[0]);

                try {
                    var thingy = JSON.parse(campaignData["rules"]);
                    campaignData["rules"] = thingy;
                }
                catch (e) {
                    console.log("Whoops, couldn't parse: " + e);
                }
            }

            console.log("campaignData2 = " + JSON.stringify(campaignData));

            campaign_collection.save(campaignData, function (err, result) {
                if (err) {

                    console.log("campaign_collection.save: err = " + err);
                    console.timeEnd("saveCampaign");

                } else {
                    console.log("campaign_collection.save: result = " + result);
                    console.timeEnd("saveCampaign");
                    callback(null, result);
                }
            });
        }
    });
};

Provider.prototype.SaveCampaignDataOrder = function (campaignData, callback) {
    this.getCollectionFromDB(constants.CampaignsCollection, function (error, campaign_collection) {


        if (error) {
            console.log("db get collection error! " + error);

            callback(error);
        } else {
            for (var i = 0; i < campaignData.length; i++) {

                var order = null;
                var campaign = campaignData[i];

                if (campaign["_id"] != null) {
                    campaign["_id"] = new ObjectID(campaign["_id"]);
                }
                delete campaign["checked"];
                console.log("Saving order: " + campaign["_id"]);
                campaign_collection.update(
                    {"_id": campaign["_id"]},
                    {"$set": {
                        "order": campaign["order"]
                    }
                    }, false,
                    callback
                );

            }


        }
    });
};

// TODO: reconcile with UpdateWorkItem below
// Assign Work Item to Campaign
Provider.prototype.updatePendingAgent = function (item, callback) {
    this.getCollectionFromDB(constants.GenPopCollection, function (error, workItemCollection) {

        if (error) {
            console.log("db get collection error! " + error);

            callback(error);
        } else {

            var objectId = getObjectIdFromWorkItemId(item.workItemId);

            // set acmeData.pendingAgent structure: { userName, fullname }
            workItemCollection.update(
                {"_id": objectId},
                {"$set": {
                    "acmeData.pendingAgent": item.pendingAgent
                }
                }, false,
                callback
            );
        }
    });
};


// TODO: reconcile with updatePendingAgent above
// Assign Work Item to Campaign
Provider.prototype.UpdateWorkItem = function (workItems, user, callback) {
    this.getCollectionFromDB(constants.GenPopCollection, function (error, WorkItemsCollection) {

        if (error) {
            console.log("db get collection error! " + error);

            callback(error);
        } else {
            for (var i = 0; i < workItems.length; i++) {

                var objectId = null;
                var workItem = workItems[i];

                if(user.role == "AGENT"){
                    try {
                        if (workItem["holdBucket"] != null) {
                            var workItemLength = workItem["holdBucket"].length;
                            for(var j=0; j<workItemLength; j++){
                                if(workItem["holdBucket"][j].agent == user.userName){
                                    workItem["holdBucket"][j].reminderDate =  new Date(workItem["holdBucket"][j].reminderDate);
                                }
                            }
                        }
                    } catch (e) {
                        console.error("Problem with hold bucket code: ", e);
                    }
                }
                if (workItem["_id"] != null) {
                    workItem["_id"] = new ObjectID(workItem["_id"]);
                }
                if (workItem["campaignId"]) {
                    objectId = new ObjectID(workItem["campaignId"]);
                }

                workItem["campaignId"] = objectId;
                delete workItem["checked"];


                // TODO: We should never update dropRep & repUserName, only API will do this.

                WorkItemsCollection.update(
                    {"_id": workItem["_id"]},
                    {"$set": {
                        "campaignId": workItem["campaignId"],
                        "dropRep": workItem["dropRep"],
                        "repUserName": workItem["repUserName"],
                        "holdBucket": workItem["holdBucket"]
                    }
                    }, false,
                    callback
                );
            }
        }
    });
};


/**
 * Update Audit with work items log
 *    update audit collections in below cases
 *      -   When work item assigned to campaign( from one campaign/genpop to anotherCamapign/genpop )
 *      -   When work item assigned to agent
 *      -   When Work items assignment is done by Rules Engine
 *
 */

Provider.prototype.LogWorkItem = function (itemsToAudit, callback) {
    this.getCollectionFromDB(constants.AuditCollection, function (error, auditCollection) {
        if (error) {
            callback(error);
        } else {

            for (var i = 0; i < itemsToAudit.length; i++) {
                var auditItem = itemsToAudit[i];
                var date = moment(new Date());
                auditItem["date"] = date["_d"];
                if (auditItem["event"] == "Work Item Action") {
                    if (auditItem["fromId"]) {
                        auditItem["fromId"] = new ObjectID(auditItem["fromId"]);
                    }
                    if (auditItem["toId"]) {
                        auditItem["toId"] = new ObjectID(auditItem["toId"]);
                    }
                }

                auditItem.workItemId = getObjectIdFromWorkItemId(auditItem.workItemId);

                auditCollection.save(auditItem, callback );
            }
        }
    });
};

var getObjectIdFromWorkItemId = function (workItemId) {
    if (typeof workItemId === 'string') {
        return new ObjectID(workItemId);
    } else {
        return workItemId
    }
};

/**
 * Get Campaigns list by Agent
 *    check for agent
 *    get the campaigns list by agent return them
 *
 *
 */

Provider.prototype.getCampaignsListByAgent = function (agent, callback) {

    console.log("getCampaignsListByAgent for userName " + agent);

    this.getCollectionFromDB(constants.CampaignsCollection, function (error, campaigns_collection) {
        if (error) {
            callback(error);
        } else {

            var nowDate = mongoHelper.currentDate();
            campaigns_collection.aggregate(
                { $unwind: "$agents" },
                { $match: {"agents.name": agent, endDate: {"$gte": new Date(nowDate)}, startDate: {"$lte": new Date(nowDate)}} },
                { $sort : { order: 1 } },
                function (err, campaigns) {
                    if (err) {
                        console.log("CampaignsCollection: by agent :  err = " + err);
                        callback(err);
                    } else {
//                        console.log("For " + agent + ", loaded campaigns: " +
//                            JSON.stringify(campaigns));
                        callback(null, campaigns);
                    }
                });
        }
    });
};


/**
 * Get GenPop Summary by applying campaign rule
 *    process the rule from ui and build valid mongo db query and run the query against genpop
 *    to get the summary
 *
 *    - Get the Rules object from ui
 *    - Build valid mongo db query from that rules object
 *    - Search for workitems based on query against work items collection
 *    - return the summary as summaryBeforeRule and summaryAfterRule
 *
 */

Provider.prototype.getGenPopSummaryByCampaignRule = function (rule, callback) {

    this.getCollectionFromDB(constants.GenPopCollection, function (error, workItem_collection) {
        if (error) {
            callback(error);
        } else {
            var details = [];
            var query = {};
            console.log("run rules:    incoming query is " + JSON.stringify(rule));

            query = mongoHelper.buildQueryObject(rule);

            query["campaignId"] = null;
            query["dropStatusMapped"] = {$ne: "saved"};
            console.log("run rules: transformed query is " + JSON.stringify(query));

            console.time("overallAggregation");
            console.time("genPopAggregation");
            // Aggregate all of GenPop.  This could be cached certainly
            workItem_collection.aggregate(
                { $match: { campaignId: null, dropStatusMapped: {$ne: "saved"}}},
                {
                    "$group": {
                        _id: "",
                        totalWorkItems: {$sum: 1},
                        totalAnnualKwh: {$sum: "$annualkWh"},
                        totalAssociatedAccounts: {$sum: "$meters"},
                        totalAggregateKwh: {$sum: "$aggregatekWh"}
                    }
                },
                function (err, results) {
                    if (err) {
                        console.log("aggregate: err = " + err);
                        callback(err);
                    } else {
                        console.timeEnd("genPopAggregation");
                        details.push({summaryBeforeRule: results});
                        workItem_collection.aggregate(
                            { $match: query},
                            {
                                "$group": {
                                    _id: "",
                                    totalWorkItems: {$sum: 1},
                                    totalAnnualKwh: {$sum: "$annualkWh"},
                                    totalAssociatedAccounts: {$sum: "$meters"},
                                    totalAggregateKwh: {$sum: "$aggregatekWh"}
                                }
                            },
                            function (err, results) {
                                if (err) {
                                    console.log("TotalAssociatedAccounts: TotalAggregateKwh:  err = " + err);
                                    callback(err);
                                } else {
                                    details.push({summaryAfterRule: results});

                                    console.timeEnd("overallAggregation");

                                    callback(null, details);
                                }
                            });
                    }
                });
        }
    });
};


/**
 * Update campaign collection by updating campaign rule
 *    check for campaign id
 *    update the campaign with specifeid campaign id with campaign rules
 *
 *
 */

Provider.prototype.updateCampaignRule = function (campaign, callback) {
    this.getCollectionFromDB(constants.CampaignsCollection, function (error, campaign_collection) {

        if (error) {
            console.log("db get collection error! " + error);

            callback(error);
        } else {

            campaign["_id"] = new ObjectID(campaign["_id"]);

            campaign_collection.update(
                {"_id": campaign["_id"]},
                {"$set": { "rules": campaign["rules"]}},
                {safe: true},
                function (err, result) {
                    if (err) {
                        console.log("campaign_collection.update error:  " + err);
                        console.log("campaign_collection.update code:  " + err.code);
                        callback(err);
                    } else {
                        console.log("campaign_collection updated: " + result);
                        callback(null, result);
                    }

                });
        }
    });
};


/**
 * Function to sweep work items into campaigns from GenPop regularly.  Work Items are
 * evaluated for matching campaign rules in order of campaign priority (evaluate campaigns with
 * lower numeric order first)
 *
 * @param callback
 * @param agentAssignmentCallback
 */
Provider.prototype.updateGenPopByCampaignRuleStep = function (callback, agentAssignmentCallback) {

    // TODO: Refactor this into the helper class and unit test as best as possible (leftover by Mikey, ACME-574)

    // TODO: Finish documentation

    var self = {};
    self.dbProvider = this;

    console.log( "updateGenPopByCampaignRuleStep invoked" );

    Step( function getCampaigns() {
            console.log( "Getting campaign collection" );
            self.dbProvider.getCollectionFromDB(constants.CampaignsCollection, this );
        },
        function getWorkItems( err, campaignCollection ) {
            if( err ) throw err;

            console.log( "campaignCollection is " + campaignCollection );
            console.log( "Getting work item collection" );

            self.campaignCollection = campaignCollection;

            self.dbProvider.getCollectionFromDB(constants.GenPopCollection, this );
        },
        function getActiveCampaigns( err, workItemCollection ) {
            if( err ) throw err;

            console.log( "workItemCollection is " + workItemCollection );

            self.workItemCollection = workItemCollection;

            console.log( "Getting active campaigns" );

            var today = moment();

            // active = start date before (lte) today && end date after today
            var query = {
                startDate: {$lte: today.toDate() },
                endDate: {$gte: today.clone().subtract( 1, 'days').toDate() }
            }

            console.log( "Query is '%j'", query );

            self.campaignCollection.find( query).sort( {order: 1 }).toArray( this );
        },
        function processCampaigns( err, campaignList ){
            if( err ) throw err;

            if( campaignList ) {
                console.log( "Found %s campaigns", campaignList.length );

                var seriesArray = [];


                campaignList.forEach( function( campaign ) {
                    console.log( "Making series function for C: o: %s, s: %s, e: %s, n: %s id %s",
                        campaign.order, campaign.startDate, campaign.endDate, campaign.name,
                        campaign._id );

                    // TODO: a better name for helper function
                    var campaignFn = mongoHelper.processOneCampaignForRules( {
                        campaign: campaign,
                        workItemCollection: self.workItemCollection
                    } );

                    // TODO: a better name for other helper function
                    var campaignCleanupFn = mongoHelper.processOneCampaignForPostRuleCleanup( {
                        campaign: campaign,
                        workItemCollection: self.workItemCollection,
                        logWorkItemCallback:function (data, callback) {
                            self.dbProvider.LogWorkItem([data], function (error, results) {
                                if (error) {
                                    callback(error);
                                } else {
                                    console.log("item " + data.workItemId +
                                        " logged, result = " + JSON.stringify(results));
                                }
                            });
                        },
                        agentAssignmentCallback: agentAssignmentCallback
                    } );

                    seriesArray.push( campaignFn );
                    seriesArray.push( campaignCleanupFn );
                });

                console.log( "prepared series length: " + seriesArray.length );

                async.series( seriesArray, this );


            } else {
                console.log( "No campaigns!" );
            }


        },
        function seriesCallback(err, results) {
            console.log("async.series callback e: %j, r's %j", err, results);

            if( results && results.length > 0 ) {
                results.forEach( function( result ) {

                } );
            }

            callback(err, results);
        }

    );

    console.log( "updateGenPopByCampaignRuleStep after step" );

};



//update the 'work item calculations'  for all Campaigns


/**
 * Campaignwise summary calculations
 *   All the work items in the campaign should be summarized by the drop status categories defined in the
 *   MasterData collection 'DropCategories'.  Additionally 'Other' should include all drop statuses not listed
 *   and 'Total' should include all work items.
 *   - Get the drop categories from the MasterData collection
 *   - Get the work item collection for later use
 *   - Get all campaigns from the campaign collection.
 *   - For each campaign:
 *        - Remove the previous cached adminSummary
 *        - Invoke sub functions to recalculate the adminSummary for this campaign
 *
 * (revised as per ACME-381, 4-23-2013)
 *
 * @param callback A callback for errors, although this is expected to run in the background
 * on the server, so errors can only really be handled by the server log or monitoring
 */
Provider.prototype.updateCampaignCalculations2 = function (callback) {

    // get the category keys
    var that = this;

    /**
     * Inner helper function to reduce the callback nesting scope.
     *
     * Get all the campaigns (or some subset perhaps in the future and :
     * a) remove existing summaries
     * b) summarize by total work items
     * c) summarize by agents currently assigned to campaign
     *
     * @param campaignCollection  mongo collection object for campaigns
     * @param workItemCollection mongo collection object for work items
     */
    function workWithCampaignCollection(campaignCollection, workItemCollection) {

        // var query = {endDate:{"$gte":today}, startDate:{"$lte":today}};
        var query = {}; // all campaigns

        campaignCollection
            .find(query)
            .each(function (e4, campaign) {
                if (e4) {
                    callback(e4);
                } else {
                    if (campaign) {

                        // Remove the current adminSummary:
                        campaignCollection.update(
                            { _id: campaign._id },
                            { $unset: {
                                adminSummary: 1,
                                agentSummary: 1
                            }
                            },
                            function (e5) {
                                if (e5) {
                                    callback(e5);
                                } else {
                                    var params = {
                                        campaign: campaign,
                                        callback: callback,
                                        workItemCollection: workItemCollection,
                                        campaignCollection: campaignCollection
                                    };

                                    // admin summary (all work items)
                                    mongoHelper.summarizeOneCampaign(params);

                                    // TODO: figure out agents

                                    var agentUserNames = [];

                                    // agent-wise summary (for agent items only
                                    if (campaign.agents && campaign.agents.length >= 1) {
                                        for (var ai = 0; ai < campaign.agents.length; ai++) {
                                            agentUserNames.push(campaign.agents[ai].name);
                                        }

                                        mongoHelper.summarizeOneCampaign({
                                            agentUserNames: agentUserNames,
                                            campaign: campaign,
                                            callback: callback,
                                            workItemCollection: workItemCollection,
                                            campaignCollection: campaignCollection
                                        });


                                    }
                                }

                            });

                    } else {
                        console.log("summary calculations are done");
                        // done
                        callback();
                    }
                }
            }); // end of campaign query
    }

//    this.getCollectionFromDB(constants.MasterDataCollection, function (e1, masterDataCollection) {
//
//        if (e1) {
//            callback(e1);
//        }
//        else {
//            masterDataCollection.findOne({key:'DropCategories'}, function (e2, data) {
//                if (e2) {
//                    callback(e2);
//                }
//                else {
//
//                    if ( data && data.value ) {

//                        var dropCategoryList = data.value;
//                        console.log("got dropCategoryList: " + JSON.stringify(dropCategoryList));

    that.getCollectionFromDB(constants.GenPopCollection, function (e5, workItemCollection) {
        if (e5) {
            callback(e5);
        } else {
            that.getCollectionFromDB(constants.CampaignsCollection, function (e3, campaignCollection) {
                if (e3) {
                    callback(e3);
                }
                else {
                    workWithCampaignCollection(
//                                            dropCategoryList,
                        campaignCollection,
                        workItemCollection);
                }

            }); // End of get campaign collection request

        }
    }); // end get gen pop

//                    } else {
//                        console.log( "Error with MasterData, DropCategories not found!" );
//                        callback( "MasterData incorrect" );
//                    }
//
//                } // end else masterdata find error
//
//            }); // end MasterData findOne function call setup
//        }
//
//    });


};


//update the 'work item calculations'  for all Campaigns

Provider.prototype.updateCampaignCalculations = function (callback) {

    console.log("invoking revised summary routine");
    this.updateCampaignCalculations2(function (error) {
        if (error) {
            console.error("problem with calculation summary routine!" + error);
        }
    });

    mongoHelper.calculateAgentSavedSummary(this.db, function (error1, success1) {
        if (error1) {
            console.error("problem in agent summary" + error1)
        } else {
            console.log("calculateAgentSavedSummary success: " + success1);
        }
    });

};

Provider.prototype.agentsWorkItemsSummaryDbCall = function (callback) {

    var self = {};
    self.dbProvider = this;

    console.log( "updateGenPopByCampaignRuleStep invoked" );

    Step(  function getUserData() {

            console.log( "Getting userData collection" );
            self.dbProvider.getCollectionFromDB(constants.UserDataCollection, this );
        },     function getActiveAgents( err, userDataCollection ) {

        if( err ) throw err;
            var sort = { };
            sort["firstName"] = 1;
            self.userDataCollection = userDataCollection;

            var   queryFilter =  { isActive : true, roles: "AGENT"  };
            userDataCollection
                .find(queryFilter)
                .sort(sort)
                .toArray(this)
        },
        function getCampaigns(err, activeAgents) {
            self.userData = activeAgents;
            console.log( "Getting campaign collection" );
            self.dbProvider.getCollectionFromDB(constants.CampaignsCollection, this );
             },
        function getActiveCampaigns(err, campaigns_collection) {
            var agents = self.userData;
            var agent = [];
            agents.forEach(function(value){
                agent.push(value.userName);
            })
            console.log("agents+++"+JSON.stringify(agent));
            var nowDate = mongoHelper.currentDate();
            var query = {};
            query.agents = { $elemMatch : {name : {$in: agent } } };
            query.endDate = {"$gte": new Date(nowDate)};
            query.startDate = {"$lte": new Date(nowDate)};
            campaigns_collection.find(query).toArray(this);

        },
        function getWorkItems( err, activeCampaigns ) {
            if( err ) throw err;


            console.log( "Getting work item collection" );
            self.dbProvider.getCollectionFromDB(constants.GenPopCollection, this );
        },function getWorkItemsForAgent(err, workItem_collection){
            if( err ) throw err;
            var agents = self.userData;
            var details =[];
            var   queryFilter =  { isActive : true, roles: "AGENT"  };
            self.userDataCollection
                .find(queryFilter)
                .each(function(err, item){
console.log("item,"+JSON.stringify(item));
if(item!=null){
            workItem_collection.aggregate(
                { $match : {dropStatus : "not contacted", repUserName:item.userName}},
                {  "$group": {
                        _id: "$repUserName",
                        totalWorkItems: {$sum: 1}
                    }
                },
                function (err, results) {
                    if (err) {
                        console.log("aggregate: err = " + err);
                        callback(err);
                    } else {
                        console.log("00000000000000"+JSON.stringify(results));
                        details.push({agentUserName: results});

                    }

                });
}
                });
            callback(err, details);

        }



    );

/*    mongoHelper.agentsWorkItemsSummaryDbCallHelper(this.db, function (error1, callback) {
        if (error1) {
            console.error("problem in agent summary" + error1)
        } else {
            console.log("calculateAgentSavedSummary success: " + (callback.length));
        }
    });*/

};



