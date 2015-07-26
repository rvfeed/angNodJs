/**
 * Created with IntelliJ IDEA.
 * User: spoujula
 * Date: 1/5/13
 * Time: 11:31 AM
 * To change this template use File | Settings | File Templates.
 */
'use strict';

/**
 * This is the index controller.
 *
 *@param $scope
 *@param $http
 *@param $location
 */

function indexCtrl($scope, $http, $location) {
    //retrieves list of users from db
    $http.get('/api/user/').success(function (data) {
        $scope.user = data;
        var role = new String($scope.user.role);
        console.log("role: " + role);

        //this condition used to redirect the page based on the role
        if (role == "ADMIN") {
            $location.path("/listCampaigns");
        } else {
            $location.path("/myCampaigns");
        }
    });
}
