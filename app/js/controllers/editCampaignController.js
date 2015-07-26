/**
 * Created with IntelliJ IDEA.
 * User: spoujula
 * Date: 1/5/13
 * Time: 11:36 AM
 * To change this template use File | Settings | File Templates.
 */
'use strict';

/**
 * common controller for Edit and Copy Campaign pages
 *
 * @param $scope
 * @param $http
 * @param $location
 * @param $routeParams
 * @param $filter
 * @param informerService
 * @constructor
 */
function EditCampaignCtrl($scope, $http, $location, $routeParams, $filter, informerService,htmlOutService) {

//    console.log( 'Edit campaign controller starting ' + $routeParams.id );
    $scope.loadingFlag = true;
    $scope.loadingStatus = "Controller initialization";
    // Initialize basic empty data and event handlers
    var d = new Date();
    var order = d.valueOf();
    $scope.campaign = {name: "", startDate: "", endDate: "", rules: {},
        status: "Active", type: "Other", description: "", agents: [], order: order };
    $scope.campaignTypes = {};
    $scope.activeCampsList = [];
    $scope.newCampOrder = 0;

    /**
     * retrieves list of campaigns from db, set new order to them and also set new order value to copy campaign.
     */
    $scope.setNewOrderToCampaigns = function () {

        $scope.loadingStatus = "Controller getAllCampaigns";

        //retrieves list of campaigns from db
        $http.get('/api/listCampaigns').
            success(function (campaignsData) {
                $scope.campaignsList = campaignsData.CampaignsList;

                for (var i = 0; i < $scope.campaignsList.length; i++) {
                    var campaign = $scope.campaignsList[i];
                    var campaignEndDate = moment(campaign.endDate);
                    var todayDate = moment(new Date());

                    //listing only active and future campaigns
                    if (campaignEndDate.isAfter(todayDate, 'days') ||
                        campaignEndDate.isSame(todayDate, 'days')) {
                        $scope.activeCampsList.push(campaign);
                    }
                }


               // $scope.activeCampsList = $filter('orderBy')($scope.activeCampsList, "order", false);

                var flag = false;
                for (var i = 0; i < $scope.activeCampsList.length; i++) {

                    //set new order value to actual campaign (Main campaign before copying it)
                    if ($scope.activeCampsList[i]._id == $routeParams.id) {
                        flag = true;

                        //if campaign is not ordered previously, set the new order else set its previous order
                        $scope.activeCampsList[i].order = (parseInt($scope.activeCampsList[i].order) > 9999999999) ? parseInt(i) + 1 : $scope.activeCampsList[i].order;
                        //set copied campaigns' order with increasing actual campaign order value by '1' to get it just below the actual campaign
                        $scope.newCampOrder = parseInt(i) + 2;
                        continue;
                    }

                    if (flag) {
                        // set new order value the campaign which are below the actual campaign
                        $scope.activeCampsList[i].order = parseInt(i) + 2;
                    }
                }

            }).
            error(function () {
            });
    };

    //to show the date picker when user clicks on the date textbox
    $scope.showPicker = function (selector) {
        $(selector).datepicker('show')
    };

    datePickerChangeHandler('#startDate', $scope, 'startDate', 0, '#startDateText');
    datePickerChangeHandler('#endDate', $scope, 'endDate', 1, '#endDateText');

    datePickerTypeHandler('#startDate', $scope, 'startDate', 0, '#startDateText');
    datePickerTypeHandler('#endDate', $scope, 'endDate', 1, '#endDateText');
    /**
     * select all the agents when user clicks on the select all check box
     */
    $scope.selectAllAgents = function ($event) {
        var checkbox = $event.target;
        var selectd = checkbox.checked;
        var agentLength = $scope.allAgents.length;
        for (var i = 0; i < agentLength; i++) {
            $scope.allAgents[i].checked = selectd;
        }
    };

    /**
     * Define a function to get the DB master data (entry point invoked at end of function definitions)
     */
    $scope.getMasterDataFromDB = function () {

        $scope.loadingStatus = "Controller getMasterDataFromDB";

        $http.get('/api/MasterData').
            success(function (masterData) {
                $scope.MasterData = masterData.MasterData;
                for (var i = 0; i < $scope.MasterData.length; i++) {
                    var row = $scope.MasterData[i];
                    if (row["key"] == "CampaignTypes") {
                        $scope.campaignTypes = row["value"];
                    }
                }
                // Load the campaign data next
                $scope.getCampaignById();
            }).
            error(function () {
            });
    };

    /**
     * Define a function to get the UserData data
     */
    $scope.getUserDataFromDB = function () {

        $scope.loadingStatus = "Controller getUserDataFromDB";
        $http.get('/api/UserData').
            success(function (userData) {
                $scope.userData = userData.UserData;

                console.log("Loaded userData, l=" + $scope.userData.length);
                // Make a list of agents in the UserData
                $scope.allAgents = [];

                var length = $scope.userData.length;
                for (var i = 0; i < length; i++) {
                    var user = $scope.userData[i];
                    if (user.roles) {
                        for (var j = 0; j < user.roles.length; j++) {
                            if (user.roles[j] === "AGENT") {
                                user.checked = false;
                                // Check for campaign-associated agents
                                if ($scope.campaign.agents) {
                                    var campUserLength = $scope.campaign.agents.length;
                                    for (var k = 0; k < campUserLength; k++) {
                                        if (user.userName === $scope.campaign.agents[k].name) {
                                            user.checked = true;
                                        }
                                    }
                                }

                                if (user.checked || user.isActive) {
                                    $scope.allAgents.push(user);
                                }

                                j = user.roles.length;
                            }
                        }
                    }
                }
                $scope.allAgents = $filter('orderBy')($scope.allAgents, "fullName", false);
                $scope.loadingFlag = false;
                $scope.loadingStatus = '';

            }).
            error(function () {
            });
    };

    if ($routeParams.page == "copy") {
        //in the case of copy campaign set new order to all the campaigns
        $scope.setNewOrderToCampaigns();
    }

    /**
     * Function to get a campaign from the id parameter (in the route)
     */
    $scope.getCampaignById = function () {

        $scope.loadingStatus = "Controller getCampaignById";

        if ($routeParams.id != null) {
            $http.get('/api/getCampaignById/' + $routeParams.id).
                success(function (data) {
                    $scope.campaign = data.Campaign[0];

                    //in the case of copy campaign, set new campaign details of the copy campaign
                    if ($routeParams.page == "copy") {
                        var startDate = new Date(moment($scope.campaign.endDate));

                        //set new date to copy campaign
                        startDate.setDate(startDate.getDate() + 1);
                        $scope.campaign.startDate = startDate;
                        var newEndDate = new Date(moment($scope.campaign.startDate));

                        //set plus one month to copy campaign
                        newEndDate.setMonth(newEndDate.getMonth() + 1);
                        $scope.campaign.endDate = newEndDate;

                        // get date in the given format
                        var now = new Date();
                        var nowDate = $filter('date')(now, "M/d/yyyy HH:mm:ss");
                        var newCampName = $scope.campaign.name.replace(new RegExp(" [0-9]{1,2}/[0-9]{1,2}/[0-9]{4} [0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2}", "g"), "");

                        //set copy campaign name as actual campaign name plus current date
                        $scope.campaign.name = newCampName + " " + nowDate;
                    }

                    $scope.campaign.startDate = moment($scope.campaign.startDate).format("MM/DD/YYYY");
                    $scope.campaign.endDate = moment($scope.campaign.endDate).format("MM/DD/YYYY");

                    //set campign date values in MM/DD/YYYY formatto resolve time zone issue
                    $("#startDateText").val(moment($scope.campaign.startDate).format("MM-DD-YYYY"));
                    $('#endDateText').val(moment($scope.campaign.endDate).format("MM-DD-YYYY"));

                    //set date pickers with new value
                    $('#startDate').datepicker('setValue', moment($scope.campaign.startDate).format("MM-DD-YYYY"));
                    $('#endDate').datepicker('setValue',moment($scope.campaign.endDate).format("MM-DD-YYYY"));

                    var campaignRule = $scope.campaign.rules;
                    if (campaignRule.manualRule) {
                        $scope.manualRule = decodeURIComponent(campaignRule.manualRule);
                        var isEmpty = isObjectEmpty($scope.manualRule);
                        if (!isEmpty) {
                            $scope.finalFilters = [];
                            $scope.showManualRuleTextArea = true;
                            $scope.showManualRule = true;
                            $scope.showVisualRuleFilterData = false;
                            $scope.showTransformRule = false;
                        }
                    }

                    else if (campaignRule.visualRule) {
                        $scope.manualRule = JSON.stringify({});
                        var visualRule = campaignRule.visualRule;
                        var condition = visualRule.and ? "and" : "or";
                        $scope.selectedCondition = condition;
                        $scope.finalFilters = visualRule[condition];
                        $scope.showManualRuleTextArea = false;
                        $scope.showVisualRuleFilterData = true;
                        $scope.showTransformRule = true;
                        $scope.showManualRule = false;
                    }else{
                        $scope.manualRule = JSON.stringify({});
                        $scope.showManualRuleTextArea = true;
                        $scope.showManualRule = true;
                        $scope.showVisualRuleFilterData = false;
                        $scope.showTransformRule = false;
                    }
                    // Load the user data next
                    $scope.getUserDataFromDB();
                }).
                error(function () {
                });
        } else {
            // just load the user data now
            $scope.showManualRuleTextArea = true;
            $scope.showManualRule = true;
            $scope.showVisualRuleFilterData = false;
            $scope.showTransformRule = false;

            //set unix timestamp as an order for newly added campaign
            $scope.campaign.order = parseInt(order);
            $scope.getUserDataFromDB();
        }
    };
    $scope.errstartDateFlag = false;
    $scope.errendDateFlag = false;
    // Validation routine
    $scope.validateCampaignDetails = function () {
        $scope.nameErrorMsg = false;
        $scope.startDateErrorMsg = false;
        $scope.endDateErrorMsg = false;
        $scope.dateRangeErrorMsg = false;

        var errorFlag = false;
        var startDate = $scope.campaign.startDate;
        var endDate = $scope.campaign.endDate;

        if ($scope.campaign["name"] == null || $scope.campaign["name"] == "") {
            $scope.nameErrorMsg = true;
            errorFlag = true;
        }
        if (startDate == null || startDate == "") {

            $scope.startDateErrorMsg = true;
            errorFlag = true;
        }else if (endDate == null || endDate == "") {
            $scope.startDateErrorMsg = false
            $scope.endDateErrorMsg = true;
            errorFlag = true;
        }

        if (( startDate != null && startDate != "" ) && ( endDate != null && endDate != "" )) {

            if (moment(startDate).isAfter(moment(endDate))) {
                $scope.dateRangeErrorMsg = true;
                errorFlag = true;
            }
        }

        return errorFlag;
    };

     /**
     * Save edit or copy campaign
     */
    $scope.validateAndSaveCampaign = function () {

        var flag =false;
        $scope.loadingStatus = "Controller saveCampaign";


        if ($scope.validateCampaignDetails()) {
            flag =false;
            $scope.errCampMsg = "";
            console.log("invalid campaign, not saving");
        } else {
            if (dateValidateFn($scope, '#startDate', 'startDate', 0, '#startDateText')) {
                if (dateValidateFn($scope, '#endDate', 'endDate', 0, '#endDateText')) {
                    flag = true;
                }
            }
            if(!flag){
                $scope.endDateErrorMsg = false;
                $scope.startDateErrorMsg = false;
                $scope.dateRangeErrorMsg = false;
            }
        }

        if(flag){
            $scope.saveCampaign();
        }
    };

    //saves campaign with the details entered in the campign page
    $scope.saveCampaign = function(){
        // Check for selected agents
        var newAgentList = [];
        var agentLength = $scope.allAgents.length;
        for (var j = 0; j < agentLength; j++) {
            if ($scope.allAgents[j].checked) {
                newAgentList.push(
                    {
                        name: $scope.allAgents[j].userName,
                        fullName: $scope.allAgents[j].fullName
                    });
            }
        }

        $scope.campaign.agents = newAgentList;

        if ($routeParams.page == "copy") {
            //set new campaign order to copy campaign
            $scope.campaign.order = $scope.newCampOrder;
            //deleting id of the caopy campaign to save as a new campaign in db
            delete $scope.campaign["_id"];
            delete $scope.campaign["adminSummary"];
            delete $scope.campaign["agentSavedList"];
            delete $scope.campaign["agentSummary"];
            for (var j = 0; j < $scope.activeCampsList.length; j++) {
                //deleting new order field which is added in the case of ordering
                delete $scope.activeCampsList[j]["newOrder"];
            }

            //first save the all the campaigns with new order except copy campaign
            $http.post('/api/SaveCampaignOrder', $scope.activeCampsList).
                success(function (data) {
                    //later call function to save copy campaign
                    $scope.saveNewCampaign();
                    console.log("success");
                }).
                error(function () {
                    console.log("error");
                });
        } else {
            // Saving new edit campaign values in db
            for (var key in $scope.campaign) {
                var thingy = $scope.campaign[key];

                console.log("api/SaveCampaign key '" + key +
                    "' type '" + typeof thingy +
                    "' val '" + JSON.stringify(thingy) +
                    "' ");
            }

            //alert(JSON.stringify($scope.campaign));
            $http.post('/api/SaveCampaign', $scope.campaign).
                success(function (data) {
                    $location.path("/listCampaigns");
                }).
                error(function (error) {
                    console.log("At: " + moment().format() +
                        ", save camp. post ERROR with error " + JSON.stringify(error));
                    informerService.inform("There was a problem saving the campaign.");
                });
        }
    }
    /**
     * save copy campaign as a new campaign in db
     */
    $scope.saveNewCampaign = function () {

        $scope.loadingStatus = "Controller saveNewCampaign";

        // Saving campaign
        for (var key in $scope.campaign) {
            var thingy = $scope.campaign[key];

            console.log("api/SaveCampaign (new) key '" + key +
                "' type '" + typeof thingy +
                "' val '" + JSON.stringify(thingy) +
                "' ");
        }

        $http.post('/api/SaveCampaign', $scope.campaign).
            success(function (data) {
                $location.path("/listCampaigns");
            }).
            error(function (error) {
                console.log("At: " + moment().format() +
                    ", save camp. post ERROR with error " + JSON.stringify(error));
                informerService.inform("There was a problem saving the campaign.");
            });
    };

    /**
     * triggers when user clicks on cancel button
     */
    $scope.cancelCampaign = function () {

		 htmlOutService.backToCampaign();

      };

    // Call the db load function which will populate the form
    $scope.getMasterDataFromDB();
    $scope.finalFilters = [];

    //disable rules lightbox initially
    $('#rulesLightbox').css('display', 'none');
    $scope.showManualRuleDiv = false;
    $scope.showVisualRuleDiv = false;
    $scope.saveFlag = false;
    /**
     * triggers when user clicks on edit manual rule
     */
    $scope.editManualRule = function () {
        editManualRule($scope, $routeParams);

    };

    /**
     * triggers when user clicks on edit visual rule
     */
    $scope.editVisualRule = function () {
        editVisualRule($scope, $routeParams);
    };

    /**
     * triggers when user clicks on cancel button on rules lightbox
     */
    $scope.cancelRules = function () {
        cancelRules($scope);
    };

    /**
     * triggers when user clicks on caluculate button on rules lightbox
     */
    $scope.runRule = function () {

        runRulesHelper($scope, $http, informerService);

    };

    /**
     * triggers when user clicks on Save  button on rules lightbox
     */
    $scope.saveRule = function () {

        saveRulesHelper($scope, $http, $routeParams, informerService);
    };

    /**
     * load boolean field for "exists" operator
     */
    $scope.showExistsBooleanField = function () {
        showExistsBooleanField($scope);
    };

    /**
     * load operators based on selected field in visual rule lightbox
     */
    $scope.showOperators = function (selectedField) {
        showOperators($scope, selectedField);
    };

    /**
     * adding filters to visual rule
     */
    $scope.addFilters = function () {
        addFilters($scope, informerService);
    };

    /**
     * removing filters from visual rule
     */
    $scope.removeFilter = function (filter) {

        removeFilter($scope, filter);
    };

    /**
     * transform visual rule to manual rule
     */
    $scope.transformVisualRule = function () {
        transformVisualRule($scope, $routeParams, $http, informerService);
    }
}