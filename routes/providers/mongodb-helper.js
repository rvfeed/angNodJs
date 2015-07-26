/**
 * Created with JetBrains WebStorm.
 * User: mikey
 * Date: 5/2/13
 * Time: 6:23 AM
 *
 * Helper file to do the work for provider-mongodb.js, but remove the dependency on an actual
 * database to all for focused unit testing and refactoring.
 */

var collectionOptions = {w: 1, strict: true };
var constants = require('../constants.js');

var moment = require('moment');
var ObjectID = require('mongodb').ObjectID;
var queryHelper = require('../query-helper.js');


var getCollectionFromDB = function (db, collectionName, callback) {

    db.collection(collectionName, collectionOptions, callback);
};

var pastWorkItemLog = function (db, workItem, callback) {
    var workItemsToLog = [];
    var campaignRow = {"event": "Past Work Item Action", "byWhom": "Past Work Item Cron Job", "from": "WorkItems", "fromId": null,
        "to": "PastWorkItems", "toId": "", "workItemId": workItem["_id"].toString(),
        "action": "Assign", "status": "Success"};
    workItemsToLog.push(campaignRow);

    console.log("workItemsToLog = " + workItemsToLog.length);

    getCollectionFromDB(db, constants.AuditCollection, function (error, AuditCollection) {
        if (error) {
            callback(error);
        } else {
            for (var i = 0; i < workItemsToLog.length; i++) {
                var workItem = workItemsToLog[i];
                var date = moment(new Date());
                workItem["date"] = date["_d"];

                if (typeof workItem.workItemId === 'string') {
                    workItem.workItemId = new ObjectID(workItem.workItemId);
                }
                AuditCollection.save(workItem, function (error, result) {
                    if (error) {
                        callback(error);
                    }
                    else {
                        callback(null, result);
                    }
                });
            }
        }
    });
}

exports.getPlusMinus3Days = function () {

    var nowDate = moment().format("MM/DD/YYYY");
    var plus3Days = moment().add('days', 3).format("MM/DD/YYYY");
    var minus3Days = moment().subtract('days', 3).format("MM/DD/YYYY");
    return {nowDate: new Date(nowDate), plus3Days: new Date(plus3Days), minus3Days: new Date(minus3Days)};
};

/**
 * Get the user data for the specified user name
 *
 * @param db mongo database object to use
 * @param userName userName to find
 * @param callback function signature (error, dataFromFind)
 */
exports.getUserDataForUserName = function (db, userName, callback) {

    getCollectionFromDB
    (db, constants.UserDataCollection,

        function (error, userDataCollection) {
            if (error) {
                callback(error);
            } else {
                userDataCollection.find({userName: userName}).toArray(callback);
            }
        });
};


/**
 * Get all the user data in the db
 *
 * @param db mongo database object to use
 * @param callback function signature (error, dataFromFind)
 */
exports.getUserData = function (db, callback) {

    getCollectionFromDB(db, constants.UserDataCollection,

        function (error, userDataCollection) {
            if (error) {
                callback(error);
            } else {
                userDataCollection.find().toArray(callback);
            }
        });
};


/** Section for campaign summaries
 *
 *
 *
 *
 */

//noinspection JSValidateJSDoc
/**
 * Push all the summaries for single campaign to the campaign (INTERNAL FN)
 *
 * parameters object (all required):
 *  - **workItemCollection** {Collection) Work Item Collection monogodb object.
 *  - **campaignCollection** {Collection) Campaigns Collection monogodb object.
 *  - **campaign** {object}, the campaign to summarize.
 *  - **agentUserNames** (Array) if present, list of agents to generate agentwise summary for
 *  - **callback** {function}, error callback.
 *
 * @param {object} params, the parameters (see above)
 */
exports.summarizeOneCampaign = function (params) {

    // TODO: Whole method needs testing and possibly refactoring

    console.log("aggregation running for campaign '" + params.campaign.name + "'");

    // summaries defined by EPData api in dropStatusMapped

    // TODO: fold  summarizeOneCampaign and campaignCalculationByCategory together

    // Need to create a new params object literal each call so the parameter will be encapsulated
    campaignCalculationByCategory(
        {
            workItemCollection: params.workItemCollection,
            campaign: params.campaign,
            callback: params.callback,
            campaignCollection: params.campaignCollection,
            agentUserNames: params.agentUserNames
        });

};

function timestamp() {
    return "@" + moment().format("h:mm:ss.SSS");
}


/** // TODO: Finish documentation
 * params needs:
 * campaignId
 * agentUserNames: params.agentUserNames
 * groupId
 * workItemCollection
 * parentCallback (only for errors)
 * dataCallback ( for results )
 * @param params
 */
var campaignAggregateHelper = function (params) {

    // TODO: Whole method needs testing and possibly refactoring

    var match = {
        "$match": {
            campaignId: params.campaignId }
    };


    // TODO: incorrect group aggregation (multiple counting of masters)
    var group = {
        "$group": {
            _id: params.groupId,
            workItems: {$sum: 1},
            kWh: {$sum: "$annualkWh"},
            associatedAccounts: {$sum: "$meters"},
            associatedAccountskWh: {$sum: "$aggregatekWh"}
        }
    };


    var project = {$project: {
        _id: 0,
        kWh: "$kWh",
        workItems: "$workItems",
        associatedAccounts: "$associatedAccounts",
        associatedAccountskWh: "$associatedAccountskWh",
        category: "$_id.dropStatusMapped"
    }
    };

    // agentUserNames: params.agentUserNames array of agents in campaign
    if (params.agentUserNames && params.agentUserNames.length > 0) {
        match.$match.repUserName = {
            $in: params.agentUserNames
        };

        // group id may or may not be defined
        group.$group._id = group.$group._id || {};
        group.$group._id.repUserName = "$repUserName";

        project.$project.agent = "$_id.repUserName";
    }

    console.log("match query is " + JSON.stringify(match));

    params.workItemCollection.aggregate(
        match,
        group,
        project,
        function (e6a, results) {
            if (e6a) {
                params.parentCallback(e6a);
            } else {

                params.dataCallback(results);
            }
        });

};


//noinspection JSValidateJSDoc
/**
 * Push a single campaign summary element into the campaign's adminSummary array (INTERNAL FN)
 *
 * parameters object (all required):
 *  - **dropCategory** {object}, the drop category, including subfields
 *     -- category -- the display name of the category
 *     -- order the visual sort order
 *     -- list the array of drop statuses to include in this category
 *  - **agentUserNames** (object) null for admin, or agentUserNames to summarize for
 *  - **workItemCollection** {Collection) Work Item Collection monogodb object.
 *  - **campaignCollection** {Collection) Campaigns Collection monogodb object.
 *  - **campaign** {object}, the campaign to summarize.
 *  - **callback** {function}, error callback.
 *
 * @param params, the parameters (see above)
 */
var campaignCalculationByCategory = function (params) {

    // TODO: Whole method needs testing and possibly refactoring
    var idString =
        "timeId:[" + params.campaign.name +
            "]-[" + JSON.stringify(params.agentUserNames) +
            "]";

    console.log(timestamp() + ", aggregating for " + idString);

    var dataCallback = function (data) {

        console.log("Data callback (total) with " + JSON.stringify(data));

        var categoriesCallback = function (categoryData) {
            console.log("Data callback (categories) with " + JSON.stringify(categoryData));

            if (data && data.length > 0) {
                for (var j = 0; j < data.length; j++) {
                    data[j].category = "total";

                    categoryData.push(data[j]);
                }
            }

            for (var i = 0; i < categoryData.length; i++) {
                var item = categoryData[i];

                switch (item.category) {
                    case "total":
                        item.category = "Total";
                        item.order = 6;
                        break;
                    case "saved":
                        item.category = "Saved";
                        item.order = 1;
                        break;
                    case "lost":
                        item.category = "Lost";
                        item.order = 2;
                        break;
                    case "contacted":
                        item.category = "Contacted";
                        item.order = 3;
                        break;
                    case "not contacted":
                        item.category = "Not Contacted";
                        item.order = 4;
                        break;
                    case "other":
                        item.category = "Other";
                        item.order = 5;
                        break;

                    default:
                        console.error("unknown category: " + JSON.stringify(item));
                }

                console.log("[" + params.campaign.name +
                    "] category item: " + JSON.stringify(item));
            }

            console.log("Final category data: " + JSON.stringify(categoryData));

            var updateDocument = null;
            if (params.agentUserNames && params.agentUserNames.length > 0) {
                updateDocument = {
                    $set: {
                        agentSummary: categoryData
                    }
                };
            } else {
                updateDocument = {
                    $set: {
                        adminSummary: categoryData
                    }
                };
            }

            if (updateDocument) {
                var updateCallback = function (error) {

                    // Only callback for error
                    if (error) {
                        console.error("Problem updating campaign! " + error);
                        params.parentCallback(error);
                    } else {

                    }
                };

                params.campaignCollection.update(
                    {_id: params.campaign._id},
                    updateDocument,
                    updateCallback
                );
            }
        };

        var categoryParams = {
            campaignId: params.campaign._id,
            agentUserNames: params.agentUserNames,
            groupId: {dropStatusMapped: "$dropStatusMapped"},
            workItemCollection: params.workItemCollection,
            parentCallback: params.callback,
            dataCallback: categoriesCallback
        };

        campaignAggregateHelper(categoryParams);
    };

    var totalParams = {
        campaignId: params.campaign._id,
        agentUserNames: params.agentUserNames,
        groupId: null,
        workItemCollection: params.workItemCollection,
        parentCallback: params.callback,
        dataCallback: dataCallback
    };

    campaignAggregateHelper(totalParams);

};


/**
 * Get the hold bucket statistics (for an agent).  Provide the number of items on hold,
 * as well as the number of items needing attention (having a reminder date within 3 days of now)
 *
 * @param db mongodb database object upon which to operate
 * @param params Params for query, currently only the agent's userName
 * @param callback callback (error, data) for returning data to the request
 */
exports.getHoldBucketStatistics = function (db, params, callback) {

    var plusMinus3Days = this.getPlusMinus3Days();

    var getStatisticsForAgent = function (params, workItemCollection) {


        if (!params || !params.agentId) {
            callback("agentId parameter missing: " + JSON.stringify(params));
        }
        else {
            //preparing +/- 3 days from now


            var statistics = {};

            workItemCollection
                .aggregate(
                // Skip all items without a hold bucket
                { $match: {holdBucket: {$ne: null}}},
                { $unwind: "$holdBucket" },
                { $match: {
                    "holdBucket.agent": params.agentId
                }},
                { $group: { _id: null,
                    agentHoldWorkItems: { $sum: 1 } } },
                function (err, count) {
                    if (err) {
                        console.log("holdBucket-aggregation1 err = " + err);
                        callback(err);
                    } else {

                        // Expect an array of length 1 containing object
                        // { _id: null,
                        //   agentHoldWorkItems: <count data>
                        // }
                        if (count && count.length === 1) {
                            statistics.agentHoldWorkItems = count[0].agentHoldWorkItems;
                        } else {
                            statistics.agentHoldWorkItems = 0;
                            console.error("Unexpected count returned for holdBucket aggregate: " + JSON.stringify(count));
                        }

                        workItemCollection.find(
                            {holdBucket: {
                                $ne: null,
                                $elemMatch: {
                                    agent: params.agentId,
                                    reminderDate: {
                                        $gte: plusMinus3Days.minus3Days,
                                        $lte: plusMinus3Days.plus3Days}
                                }
                            }
                            })
                            .count(function (countError, data) {


                                if (countError) {
                                    console.log("Second holdBucket find count, error: " + countError);
                                    callback(countError);
                                } else {
                                    console.log("Second holdBucket find count, data: " +
                                        JSON.stringify(data));

                                    statistics.attentionRequiredItems = data;

                                    callback(null, statistics);
                                }

                            });
                        console.log("For " + params.agentId + ", loaded getHoldBucketStatistics: " +
                            JSON.stringify(statistics));
                    }
                }
            ); // End of aggregate call

        }
    };


    console.log("getHoldBucketStatistics: params are " + JSON.stringify(params));

    getCollectionFromDB(db, constants.GenPopCollection,
        function (error, workItemCollection) {

            console.log("error '" +
                error + "' collection '" + workItemCollection +
                "' ");

            if (error) {
                callback(error);
            } else {
                getStatisticsForAgent(params, workItemCollection);
            }
        });
};



//get only current date not time (to match with campaign start/end dates)
exports.currentDate = function () {

    // TODO seems cumbersome, there may be a better way with more native moment functions
    var curDate = moment(moment().format("MM/DD/YYYY"));
    return curDate.toDate().toISOString();
};


exports.calculateAgentSavedSummary = function (db, callback) {

    // need a work item collection & campaign collection at hand
    // Grab all the active campaigns
    //  start date <= midnight last night/this morning
    //       and
    //  end date >= midnight tonight/tomorrow morning (ET)

    // for each campaign, aggregate the work items in 'saved' category
    //   (this will change to mapping status) by repUserName
    //   project dropRep (rep's name)

//    save as campaign.savedSummaryByAgent
    getCollectionFromDB(
        db,
        constants.CampaignsCollection,
        function (e1, campaignCollection) {

            if (e1) {
                console.error("Problem getting campaign collection: " + e1);
                callback(e1);
            } else {
                getCollectionFromDB(
                    db,
                    constants.GenPopCollection,
                    function (e2, workItemCollection) {
                        if (e2) {
                            console.error("problem getting work item collection: " + e2);
                            callback(e2);
                        } else {

                            var queryDoc = {};

                            var eachCampaignFunction = function (e3, campaignItem) {
                                if (e3) {
                                    console.error("problem getting campaign item: " + e3);
                                    callback(e3);
                                } else {
                                    if (campaignItem) {
                                        // valid item, work with it
                                        performAgentSummaryOnCampaign(
                                            campaignItem, workItemCollection, campaignCollection, callback);

                                    } else {
                                        // have iterated all campaigns, and reached the end
                                        callback(null);
                                    }
                                }

                            };
                            // OK go to town
                            campaignCollection.find(queryDoc).each(eachCampaignFunction);
                            // end of campaign find
                        }
                    }); // end of get work item collection
            }

        });// end of get campaign collection call

};

var performAgentSummaryOnCampaign = function (campaignItem, workItemCollection, campaignCollection, callback) {


    console.log("performAgentSummaryOnCampaign c[%s], start[%s], end[%s], agents:[%s]",
        campaignItem.name,
        campaignItem.startDate,
        campaignItem.endDate,
        JSON.stringify(campaignItem.agents)
    );

    var aggregateMatch = {
        $match: {
            campaignId: campaignItem._id,
            dropRep: {
                $ne: "", $exists: true
            },
            repUserName: {
                $ne: "", $exists: true
            },
            dropStatusMapped: "saved"
        }
    };

    // TODO: Incorrect aggregation of master accounts!
    var aggregateGroup =
    {
        "$group": {
            _id: {
                userName: "$repUserName"
            },
            fullName: {$first: "$dropRep" },
            totalWorkItems: {$sum: 1},
            savedAggregatekWh: {$sum: "$aggregatekWh"}
        }
    };


    var aggregateProject = {
        $project: {
            _id: 0,
            userName: "$_id.userName",
            fullName: "$fullName",
            totalWorkItems: "$totalWorkItems",
            savedAggregatekWh: "$savedAggregatekWh"
        }
    };

    var aggregateSort = {
        $sort: {
            savedAggregatekWh: -1
        }
    };

    var aggregateDataCallback = function (error, data) {
        if (error) {
            console.error("problem with aggregation call: " + error);
            callback(error);
        } else {

            console.log("performAgentSummaryOnCampaign c[" + campaignItem.name +
                "] with data '" + JSON.stringify(data) + "'");

            var updateQuery = {
                _id: campaignItem._id
            };

            var now = moment().format();

            var updateDoc = {
                $set: {
                    agentSavedList: data,
                    updateDate: now
                }
            };

            var options = {safe: true};

            campaignCollection.update(updateQuery, updateDoc, options, callback);

        }
    };

    workItemCollection.aggregate(
        aggregateMatch,
        aggregateGroup,
        aggregateProject,
        aggregateSort,
        aggregateDataCallback);
};


/**
 Daily Calculation routines

 */

var calculateDropDays = function (item) {

    var today = moment();

    var notificationDate = moment(item.notificationDate);

    if (notificationDate && notificationDate.isValid() && notificationDate.isBefore(today)) {

        return Math.floor(today.diff(notificationDate, 'days', true));

    } else {
        return '';
    }
};

var calculateMonthsSinceDropped = function (item) {

    var result = '';

    try {
        if (item.serviceEndDate) {
            var today = moment();

            var serviceEnd = moment(item.serviceEndDate);

            if (serviceEnd && serviceEnd.isValid() && serviceEnd.isBefore(today)) {
                result = Math.ceil(today.diff(serviceEnd, 'months', true));
            }
        }

    } catch (e) {

        console.log("Error in calculateMonthsSinceDropped: " + e);

        result = 'error';
    }

    return result;
};

var calculateMonthsTillCashAward = function (item) {

    var result = '';

    try {
        if (item.cashbackDueDate) {
            var today = moment();

            var cashDue = moment(item.cashbackDueDate);

            if (cashDue && cashDue.isValid() && cashDue.isAfter(today)) {
                result = Math.ceil(cashDue.diff(today, 'months', true));
            }
        }

    } catch (e) {

        console.log("Error in calculateMonthsTillCashAward: " + e);

        result = 'error';
    }

    return result;
};

var calculateMonthsActive = function (item) {

    var today = moment();

    var serviceEnd = moment(item.serviceEndDate);
    var serviceStartMoment = moment(item["serviceStartDate"]);

    var validServiceEnd = ( item.serviceEndDate === null ||
        ( serviceEnd && serviceEnd.isValid() && serviceEnd.isAfter(today) ) );

    var validServiceStart = ( item["serviceStartDate"] !== null &&
        serviceStartMoment && serviceStartMoment.isValid() && today.isAfter(serviceStartMoment)  );

    if (validServiceEnd && validServiceStart) {

        return Math.ceil(today.diff(serviceStartMoment, 'months', true));

    } else {
        return '';
    }
};

exports.updateWorkItemCalculations = function (db, callback) {

    console.time("updateWorkItemCalculations");

    console.log("updateWorkItemCalculations starting at " + moment().format());

    var count = 0;
    var saveCount = 0;

    db.collection(constants.GenPopCollection, collectionOptions, function (error, workItemCollection) {
        if (error) {
            callback(error);
        } else {

            // Iterate over the work item collection.  If you don't interate on a sort, you may or may
            // not hit each record twice, as the modification can put the document at the end of the collection,
            // so apparently the cursor will hit it twice (suspected but not 100% verified, bc why bother?)
            // The calculation is idempotent, so there's no harm except time.  However iterating the cursor
            // over a sort keeps the number counts the same as the db rowcount and keeps it all nice and
            // async.

            // Choose the id for the sort as it's guaranteed to be there and be indexed.  Drop status date is
            // very likely but not guaranteed to work.
            workItemCollection
                .find()
                .sort({'_id': -1})
                .each(function (err, item) {
                    if (!err) {
                        if (item) {
                            count++;

                            var calculated = {};

                            calculated.monthsUntilCashAward = calculateMonthsTillCashAward(item);
                            calculated.dropDays = calculateDropDays(item);
                            calculated.monthsActive = calculateMonthsActive(item);
                            calculated.monthsSinceDropped = calculateMonthsSinceDropped(item);

                            if (count % 10000 === 0) {
                                console.log("count " + count + " at " + moment().format());
                                console.log(" item drop status date is " + item.dropStatusDate);
                                console.log(" item id is " + item._id);
                            }

                            workItemCollection.update(
                                {_id: item["_id"] },
                                {$set: {calculated: calculated} },
                                {safe: true},
                                function (err) {

                                    saveCount++;

                                    if (err) {
                                        console.warn("Update problem!" + err.message);
                                    } else {
                                        if (saveCount % 10000 === 0) {
                                            console.log("successful update count " + saveCount + " at " + moment().format());
                                        }
                                    }
                                });

                        } else {
                            // Null item signifies the end of the collection or so I gather...
                            console.log("after find " + count + " at " + moment().format());
                            console.timeEnd("updateWorkItemCalculations");

                            callback(null);
                        }
                    } else {
                        console.log("error at count " + count + " at " + moment().format());
                        console.timeEnd("updateWorkItemCalculations");

                        callback(err);
                    }
                });
        }
    });


};


/**
 Fundamental work item query

 TODO: This has been moved here and testing is started (in getWorkItemSpec.js), but the refactor is
 not complete, only enough to test the functionality of ACME-504 (Mikey, 2013-05-08)
 */

exports.getWorkItems = function (db, params, callback) {

    // gen pop query from UI:
    // GET /api/getWorkItems?direction=asc&limit=10&offset=0&sort=cashbackDueDate 304 1307ms

    // admin campaign item query
//    GET /api/getWorkItems/5183ca033384670000000001?direction=asc&limit=10&offset=0&sort=cashbackDueDate

    // campaignId

    var campaignId = params.campaign;

//    var that = this;

    var userName = params.userName;
    var userRole = params.userRole;
    var checkGenPopFlag = true;
    var plusMinus3Days = this.getPlusMinus3Days();
    console.log("get work items, params: " + JSON.stringify(params));

    this.getUserDataForUserName(db, userName, function (error, userData) {
        if (error) {
            console.log('Error getting user data: ' + JSON.stringify(error));
            callback(error);
        } else {

            var configuration = getConfiguration(userData);
            var queryFilter = {};
            var sort = { };

            sort[params.sort] = params.direction;
            //console.log("user details...."+JSON.stringify(params));

            //ACME-498: check for configuration &  queryFilter existence in case of new user
            if (configuration && configuration.filters) {
                queryFilter = queryHelper.makeFilterQueryObject(configuration.filters);
            }

            console.log("query filter in mongodb-helper file ---" + JSON.stringify(queryFilter));
            getCollectionFromDB(db,
                constants.GenPopCollection,
                function (error, workItemCollection) {
                    if (error) {
                        callback(error);
                    } else {

                        var objectId = null;
                        if (campaignId) {
                            checkGenPopFlag = false;
                            objectId = new ObjectID(campaignId);
                            queryFilter.campaignId = objectId;
                        }

                        if (userRole == "AGENT") {
                            checkGenPopFlag = false;

                            if (params.hold) {

                                queryFilter.holdBucket = { $elemMatch: { agent: params.userName } };

                            } else if (params.attention) {



                                console.log("plusMinus3Days---" + JSON.stringify(plusMinus3Days));

                                queryFilter.holdBucket = { $elemMatch: { agent: params.userName, reminderDate: { $gte: plusMinus3Days.minus3Days, $lte: plusMinus3Days.plus3Days} } };
                            } else {
                                queryFilter.repUserName = userName;
                            }

                        }else if(!campaignId){
                            // query for admin login and genpop page
                            queryFilter.dropStatusMapped =
                                queryFilter.dropStatusMapped || {$ne:"saved"};
                            queryFilter.campaignId = null;
                        }

                        console.log("Querying with : " + JSON.stringify(queryFilter));
                        console.log("sorting with: " + JSON.stringify(sort));
                        console.log('params limit: ' + params.limit + ' offset: ' + params.offset);

                        workItemCollection
                            .find(queryFilter)
                            .sort(sort)
                            .limit(Number(params.limit))
                            .skip(Number(params.offset))
                            .toArray(callback);
                    }
                });
        }

    });


};

//move all the work items which are under expired campaigns
exports.EndOfTheCampaignProcessHelper = function (db, campaigns, callback) {

    getCollectionFromDB(db,
        constants.GenPopCollection,
        function (error, workItemCollection) {
            if (error) {
                callback(error);
            } else {
                var query = { campaignId: {$in: campaigns}  };
                var rowCounter = 0;
                workItemCollection
                    .find(query)
                    .each(function (error, workItem) {

                        if (workItem) {
                            rowCounter++;
                            getCollectionFromDB(db,
                                constants.PastWorkItemsCollection,
                                function (error, PastWorkItemsCollection) {

                                    if (error) {
                                        callback(error);
                                    } else {
                                        var pastWorkItem_id = workItem["_id"];
                                        workItem.pastWorkItem_id = pastWorkItem_id;
                                        delete workItem["_id"];
                                        PastWorkItemsCollection.insert(workItem, function () {
                                            workItemCollection.update(
                                                {_id: workItem["_id"] },
                                                {$set: {"campaignId": null } },
                                                {safe: true},
                                                function (err, result) {
                                                    if (err) {
                                                        console.warn("insert past work item problem!" + err.message);
                                                    } else {
                                                        pastWorkItemLog(db, workItem, callback);
                                                    }
                                                });
                                        });
                                    }
                                });
                        }
                    });

            }

        });
}


var getConfiguration = function (userData) {

    var result = null;

    if (userData && userData.length === 1) {
        var userDoc = userData[0];

        // ACME-482: converted configuration as an object from array
        //so check configuration availability

        if (userDoc && userDoc.configuration ) {
            result = userDoc.configuration;
        }
    }

    return result;
};

/**
 * Build valid mongo db query based on  rule object
 *    if the rule is manual rule then
 *         - build valid mongo db query by decoding encoded manual rule string
 *
 *    if the rule is visual rule then
 *         - build valid mongo db query by processing  those filter fields
 *
 *
 *   Returns valid mongo db query
 *
 */

// TODO: test, does not have to be exported if getGenPopSummaryByCampaignRule is moved
exports.buildQueryObject = function(rule) {
    var query = null;

    if (rule && rule.manualRule) {
        var queryString = decodeURIComponent(rule.manualRule);
        query = JSON.parse(queryString);
    } else if (rule && rule.visualRule) {
        var visualRuleFilters = rule.visualRule;
        query = queryHelper.makeVisualRuleQueryObject(visualRuleFilters);
    }

    return query;
};

// TODO: Unit test as best as possible (leftover by Mikey, ACME-574).  A better name wouldn't hurt
// TODO: Document

exports.processOneCampaignForRules = function (params) {
    return function (callback) {
        var campaign = params.campaign;
        var workItemCollection = params.workItemCollection;


        if (campaign) {
            console.log("cn: o: Processing rule: %j",
                campaign.name, campaign.order, campaign.rules);

            // TODO: Refactor in here
            var campaignName = campaign.name;
            var campaignId = campaign._id;

            var query = exports.buildQueryObject(campaign.rules);

            console.log("built query is: %j", query);
            if (query) {
                // Add in genpop criteria, no campaign id & not saved
                query.campaignId = null;
                query.dropStatusMapped = query.dropStatusMapped || {$ne:'saved'};

                console.log("Final work item query is: %j", query);

                var instructions = {
                    $set: {
                        campaignId: campaignId,
                        rulesInitialAssignment: true
                    }
                };

                var options =  {
                    w: 1, // write concern = wait for confirmation
                    multi:true // multiple doc update
                };

                var results = function( error, numberUpdated ) {
                    console.log( "write results callback for cn [%s] with e '%j' and number '%s'",
                        campaignName,
                        error, numberUpdated );

                    console.timeEnd( "updating-" + campaignName );

                    if (error) {
                        callback(error);
                    } else {
                        callback(null,
                            {
                                results:numberUpdated,
                                campaignId:campaignId,
                                campaignName:campaignName,
                                info:"valid rules query"
                            });
                    }


                };

//                var startTime = moment();
                console.time( "updating-" + campaignName );

                workItemCollection.update( query, instructions, options, results );

            } else {
                console.log("No query");
                callback(null,
                    {
                        results:0,
                        campaignId: campaignId,
                        campaignName: campaignName,
                        info: "no valid rules query"
                    });
            }
        } // else no campaign
    }
};

// TODO: Unit test as best as possible (leftover by Mikey, ACME-574).  A better name wouldn't hurt
// TODO: Document

exports.processOneCampaignForPostRuleCleanup = function (params) {
    return function (callback) {
        var campaign = params.campaign;
        var workItemCollection = params.workItemCollection;
        var logWorkItemCallback = params.logWorkItemCallback;
        var agentAssignmentCallback = params.agentAssignmentCallback;

        if (campaign) {
            var campaignName = campaign.name;
            var campaignId = campaign._id;

            var selector = {
                campaignId: campaignId,
                rulesInitialAssignment: true
            };

            var agentList = campaign.agents;
            var roundRobinCounter = 0;


            var results = function (error, workItem) {

                if (error) {
                    console.error( "processOneCampaignForPostRuleCleanup: " +
                        "Error processing work item" + error );

                    callback(error);
                } else if( workItem ) {
                    // process item
                    console.log( "cleaning up item " + workItem.accountNumber );

                    // Audit the work item assignment
                    var auditRow = {
                        "event":"Work Item Action",
                        "byWhom":"Rules Engine",
                        "from":"GenPop",
                        "fromId":null,
                        "to":campaign.name,
                        "toId":campaignId.toString(),
                        "workItemId":workItem._id.toString(),
                        "action":"Assign",
                        "status":"Success"
                    };

                    logWorkItemCallback( auditRow, callback );

                    // Check for agent assignment
                    if (agentList && agentList.length > 0 && isNullOrEmpty(workItem.repUserName)) {
                        roundRobinCounter++;
                        var pendingAgent = agentList[ roundRobinCounter % agentList.length ];


                        // TODO: Common with block in controller.js, how to keep in sync??
                        // info needed for assignment:
                        var assignmentInfo = {
                            // Data required for rabbit
                            eventID:workItem.eventID,
                            energyPlusID:workItem.energyPlusID,
                            dropOriginSystem:workItem.dropOriginSystem,
                            dropStatusMapped:workItem.dropStatusMapped,

                            pendingAgent:{
                                userName:pendingAgent.name,
                                fullName:pendingAgent.fullName
                            },

                            // Data required for logging
                            event:"Agent Action",
                            oldAgentUsername:workItem.repUserName,
                            oldAgentFullname:workItem.dropRep,

                            // Data required for updating
                            // make into a string to be the same data type as coming in from UI
//                                                            workItemId:JSON.stringify (workItem["_id"])
                            workItemId:workItem["_id"]
                        };

                        console.log("assigning to agent: " + JSON.stringify(assignmentInfo));

                        // Assignment callback will handled auditing and setting the pending
                        //  agent flag
                        agentAssignmentCallback(assignmentInfo);
                    }
                }
                else { // done with iteration, do something sensible

                    var document = {
                        $unset:{
                            rulesInitialAssignment:1
                        }
                    };

                    var options =  {
                        w: 1, // write concern = wait for confirmation
                        multi:true // multiple doc update
                    };

                    var results = function( error, numberUpdated ) {
                        console.log( "cleanup results callback for cn [%s] with e '%j' and number '%s'",
                            campaignName,
                            error, numberUpdated );

                        console.timeEnd( "cleanup updating-" + campaignName );

                        if (error) {
                            callback(error);
                        } else {
                            callback(null,
                                {
                                    results:numberUpdated,
                                    campaignId:campaignId,
                                    campaignName:campaignName,
                                    agentsAssigned: roundRobinCounter,
                                    info:"cleanup after rules batch assignment"
                                });
                        }


                    };

                    console.time( "cleanup updating-" + campaignName );

                    workItemCollection.update( selector, document, options, results );
                }


            };

            workItemCollection.find(selector).each( results );


        } // else no campaign
    }
};

// TODO: Test(?)

var isNullOrEmpty = function( item ) {
    if( item && item != '' ) {
        return false;
    } else {
        return true;
    }

};

exports.getQueueLog = function (db, params, callback) {

var queryFilter = {};

    getCollectionFromDB(db,
        constants.QueueLogCollection,
        function (error, queueLogCollection) {
            if (error) {
                callback(error);
            } else {

                var sort = { };
                sort[params.sort] = params.direction;
                queryFilter =  {"$or": [{ "RemovePendingAgentItem": true }, { "Success": false }]};
                queueLogCollection
                    .find(queryFilter)
                    .sort(sort)
                    .limit(Number(params.limit))
                    .toArray(callback);
            }
        });

};

exports.agentsWorkItemsSummaryDbCallHelper = function(db, callback){
var db = db;
    getCollectionFromDB(db,
        constants.UserDataCollection,
        function (error, userDataCollection) {
            if (error) {
                callback(error);
            } else {

                var sort = { };
                sort["firstName"] = 1;

             var   queryFilter =  { roles: "AGENT"  };
                userDataCollection
                    .find(queryFilter)
                    .sort(sort)
                    .each(function (err, item) {
                            if (!err) {
                                if (item) {
                                    getCollectionFromDB(db,   constants.CampaignsCollection,
                                        function (error, campaignsCollection) {
                                            if (error) {
                                                callback(error);
                                            } else {
                                                var query = {};
                                                query.agents = {$elemMatch : {name : item.userName}};
                                                query.startDate = {}
                                                campaignsCollection.find()
                                            }
                                            });
                                }
                            }
                        });
            }
        });

}