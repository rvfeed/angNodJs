/**
 * Created with IntelliJ IDEA.
 * User: spoujula
 * Date: 1/5/13
 * Time: 11:30 AM
 * To change this template use File | Settings | File Templates.
 */

'use strict';

/**
 * This controller used to setMenuLinks based on the logged user .
 *
 *@param $scope
 *@param $http
 *@param $location
 *@param $route
 */

function setMenuLinks($scope, $http, $location, $route) {

    // variables declarations
    $scope.loadingFlag = false;
    $scope.loadingExcelFlag = true;
    //retrieves list of users from db
    $http.get('/api/user/').success(function (data) {
        $scope.user = data;
        console.log("angular setMenuLinks " + JSON.stringify(data));
        console.log("angularName: " + $scope.user.firstname + " " + $scope.user.lastname);
        console.log("angularUsername: " + $scope.user.userName);
        console.log("angularRole: " + $scope.user.role);
        console.log("angularEmail: " + $scope.user.email);

        var role = new String($scope.user.role);

        console.log("role: " + role);

        // based on the role displayed the menu links.
        if (role == "ADMIN") {
            console.log("setMenuLinks: admin");
            $scope.links = [
                {name: 'Home', url: '/#/home', navUrl: 'home'},
                {name: 'Reports', url: '/#/reports', navUrl: 'reports' },
                {name: 'Gen-Pop', url: '/#/genpop', navUrl: 'genpop'},
                {name: 'Campaigns', url: '/#/listCampaigns', navUrl: 'campaign'},
                {name: 'Logs', url: '/#/logs', navUrl: 'logs'},
                {name: 'Agents', url: '/#/agents', navUrl: 'agents'}
            ];

        } else if (role == 'AGENT') {
            $scope.loadingFlag = true;
            $scope.loadingExcelFlag = false;
            console.log("setMenuLinks: agent");
            $scope.links = [
                {name: 'Home', url: '/#/home', navUrl: 'home'},
                {name: 'Hold Bucket', url: '/#/holdbucket/hold', navUrl: 'holdbucket'},
                {name: 'Campaigns', url: '/#/myCampaigns', navUrl: 'campaign'}
            ];
            $scope.checkAdmin = true;
        }
    });
    //set the route when user click the menu link
    $scope.$route = $route;
    $scope.activePath = null;
    $scope.$on('$routeChangeSuccess', function () {
        $scope.activePath = '/#' + $location.path();
        console.log($location.path());
    });
}
