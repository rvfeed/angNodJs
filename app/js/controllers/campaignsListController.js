/**
 * Created with IntelliJ IDEA.
 * User: spoujula
 * Date: 1/5/13
 * Time: 11:26 AM
 * To change this template use File | Settings | File Templates.
 */


'use strict';

/**
 * common controller for campaignDashboard and campaignPrioritization pages
 *
 * @param $scope
 * @param $http
 * @param $filter
 * @constructor
 */

function CampaignListCtrl($scope, $http, $filter, htmlOutService) {

    // variables declarations
    $scope.loadingFlag = true;
    $scope.loadingStatus = "controller init";

    $scope.today = new Date();

    //variable used to display list of campaigns in campaign dash board
    $scope.emptyCampaignsFlag = false;
    $scope.emptyCampaignsMsg = "There are no Active/Future Campaigns";
    $scope.activeCampaignsList = [];

    // variables used to display particular campaign details in prioritization
    $scope.showDetails = false;
    $scope.showManualRuleTextArea = true;
    $scope.showVisualRuleFilterData = false;

    /**
     * retrieves list of campaigns from db and assigning  status as "Future" for future campaigns
     */
    $scope.getAllCampaigns = function () {

        $scope.loadingStatus = "controller getAllCampaigns";
        //retrieves list of campaigns from db
        $http.get('/api/listCampaigns').
            success(function (campaignsData) {

                $scope.activeCampaignsList = campaignsData.CampaignsList;

                // check for active campaigns existence
                if ($scope.activeCampaignsList && $scope.activeCampaignsList.length != 0) {


                    for (var i = 0; i < $scope.activeCampaignsList.length; i++) {

                        var campaign = $scope.activeCampaignsList[i];
                        var campaignStartDate = moment(campaign.startDate);
                        var todayDate = moment(new Date());

//                        console.log( "evaluating C: %s %s (%s)",
//                            campaign.startDate, campaign.endDate, campaign.name );

                        //assigning  status as "Future" for future campaigns
                        if (campaignStartDate.isAfter(todayDate, 'days')) {
                            campaign.status = "Future";
                        }
                    }

                    // calculate summary of campaignCalculations to display on dashboard
                    $scope.activeCampaignsList =
                        calculateWorkItemsSummary($scope.activeCampaignsList, null, $filter);

                }
                else {
                    // set  emptyCampaignsFlag to true when no campaigns got retrieved from db
                    $scope.emptyCampaignsFlag = true;
                    $scope.priorityCount = 0;
                }
                $scope.loadingStatus = "";
                $scope.loadingFlag = false;

            }).
            error(function (error) {
                console.log(" in getAllCampaigns error: " + error);
            });
    };


    /**
     * display details for particular campaign based on campaignId
     * @param campaignId
     */
    $scope.showCampaignDetails = function (campaignId) {
        // set showdetails flag to true to nable display
        $scope.showDetails = true;
        $scope.manualRule = {};

        // search for selected campaign in activeCampaignsList
        for (var i = 0; i < $scope.activeCampaignsList.length; i++) {

            var campaign = $scope.activeCampaignsList[i];
            if (campaignId == campaign._id) {
                $scope.campaignToShow = campaign;

                //display campaign rules
                var campaignRule = campaign.rules;
                // if selected campaign has manual rule
                if (campaignRule.manualRule) {
                    $scope.manualRule = decodeURIComponent(campaignRule.manualRule);
                    var isEmpty = isObjectEmpty($scope.manualRule);
                    if (!isEmpty) {
                        $scope.finalFilters = [];
                        $scope.showManualRuleTextArea = true;
                        $scope.showVisualRuleFilterData = false;
                    }
                }
                // if selected campaign has visual rule
                else if (campaignRule.visualRule) {
                    $scope.manualRule = JSON.stringify({});
                    var visualRule = campaignRule.visualRule;
                    var condition = visualRule.and ? "and" : "or";
                    $scope.finalFilters = visualRule[condition];
                    $scope.showManualRuleTextArea = false;
                    $scope.showVisualRuleFilterData = true;
                } else {
                    $scope.manualRule = JSON.stringify({});
                    $scope.showManualRuleTextArea = true;
                    $scope.showVisualRuleFilterData = false;
                }
            }
        }
    };

    /**
     * watch function to save the new order of campaigns after prioritization
     */
    $scope.$watch("activeCampaignsList", function () {

        if ($scope.activeCampaignsList && $scope.activeCampaignsList.length > 0) {
            // check for reordering
            if ($scope.activeCampaignsList[0].reorder) {
                // save new order of campaigns
                $http.post('/api/SaveCampaignOrder', $scope.activeCampaignsList).
                    success(function (data) {
                        $scope.getAllCampaigns();
                        console.log("success");
                    }).
                    error(function () {
                        console.log("error");
                    });
                console.log(JSON.stringify($scope.activeCampaignsList));
            }
        }
    }, true);

    /**
     * delete the selected campaigns in db
     * @param campaign
     */
    $scope.deleteCampaign = function (campaign) {
        htmlOutService.deleteCampaign($scope, campaign, $http);
    };

    // global methods declarations
    $scope.getAllCampaigns();




}