/**
 * Created with IntelliJ IDEA.
 * User: spoujula
 * Date: 1/5/13
 * Time: 11:28 AM
 * To change this template use File | Settings | File Templates.
 */
'use strict';

/**
 * This function is used to display the My Campaign List details based on the logged in agent.
 *
 * @param $scope
 * @param $http
 * @param $filter
 * @param informerService
 */

function myCampaignListCtrl($scope, $http, $filter, informerService) {

    // variables declarations
    $scope.loadingFlag = true;
    $scope.loadingStatus = "Initialization";

    //variable used to display list of campaigns in my campaign dash board
    $scope.campaignsList = [];
    $scope.emptyCampaignsFlag = false;
    $scope.emptyCampaignsMsg = "There are no Active/Future Campaigns";
    $scope.totalHoldWorkItems = 0;
    $scope.attentionRequiredItems = 0;

    /**
     * This function used to GetLoggedUser details
     */


    $scope.getLoggedUser = function () {
        //retrieves users from db
        $http.get('/api/user/').success(function (data) {
            $scope.user = data;

            console.log("angularName: " + $scope.user.firstname + " " + $scope.user.lastname);
            console.log("angularUsername: " + $scope.user.userName);
            console.log("angularRole: " + $scope.user.role);
            console.log("angularEmail: " + $scope.user.email);

            //get hold bucket details only for AGENT Login
            if ($scope.user.role = "AGENT") {
                getHoldBucketStatistics($scope, $http);
            }

            $scope.getAllCampaignsByAgent();
        });
    }

    /**
     * This is used to get the AllCampaigns based on the  logged in agent
     */
    $scope.getAllCampaignsByAgent = function () {

        $scope.loadingStatus = "getting campaigns for agent";

        //retrieves list of campaigns from db
        $http.get('/api/listCampaignsByAgent').
            success(function (campaignsData) {

                $scope.campaignsList = campaignsData.CampaignsList;

                $scope.activeCampaignsList = [];

                if ($scope.campaignsList && $scope.campaignsList.length) {
                    for (var i = 0; i < $scope.campaignsList.length; i++) {
                        var campaign = $scope.campaignsList[i];
                        $scope.activeCampaignsList.push(campaign);
                    }
                }

                if ($scope.activeCampaignsList && $scope.activeCampaignsList.length != 0) {

                    // calculate summary of campaignCalculations to display on my campaign dashboard
                    $scope.activeCampaignsList = calculateWorkItemsSummary($scope.activeCampaignsList, $scope.user, $filter);

                }
                else {
                    // set  emptyCampaignsFlag to true when no campaigns got retrieved from db
                    $scope.emptyCampaignsFlag = true;
                }

                $scope.loadingStatus = "";
                $scope.loadingFlag = false;

            }).
            error(function (error) {
                informerService.inform(" in getAllCampaignsByAgent error: " + error);
            });
    };

    //get hold bucket details only for AGENT Login
    $scope.getLoggedUser();

}
