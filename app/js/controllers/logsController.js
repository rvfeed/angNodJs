/**
 * Created with JetBrains WebStorm.
 * User: rboddu
 * Date: 5/21/13
 * Time: 5:22 AM
 * To change this template use File | Settings | File Templates.
 */

/**
 * Get log items from QueueLog collection
 * @param $scope
 * @param $http
 */
function logsCtrl($scope, $http) {

    //set default number of log items to get
    $scope.NumberOfIssueToGet = "";
    $scope.QueueLogItemsCount = 0;
    $scope.getQueueLogItemsFromDb = function () {

        var pageSize = $scope.NumberOfIssueToGet;
        var sortField = 'insertDate'; // default
        var sortDirection = 'desc'; // default

        pageSize = pageSize ? pageSize : 100;

        var config =
        {
            params:{
                limit:pageSize,
                sort:sortField,
                direction:sortDirection
            }
        };

        $http.get("/api/getQueueLog/", config).success(function (data) {
            $scope.queueLogItems = data.QueueLogData;
            $scope.QueueLogItemsCount = $scope.queueLogItems.length;
        }).
            error(function (error) {

                informerService.inform("Error getting queue log items:\n" + JSON.stringify(error));

            });
    };
    $scope.getQueueLogItemsFromDb();
}