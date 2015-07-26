/**
 * Created with JetBrains WebStorm.
 * User: rboddu
 * Date: 5/22/13
 * Time: 3:19 AM
 * To change this template use File | Settings | File Templates.
 */

function agentListCtrl($scope, $http, $filter) {
    $scope.reverse = true;
    $scope.sortOrder = '-accountNumber';

    $scope.dataSort = function (newSortOrder) {
        if ($scope.sortOrder == newSortOrder) {
            $scope.reverse = !$scope.reverse;
        }
        $('th i').each(function () {
            // icon reset
            $(this).removeClass().addClass('icon-sort');
        });
        if ($scope.reverse)
            $('th.right i#' + newSortOrder).removeClass().addClass('icon-chevron-down');
        else
            $('th.right i#' + newSortOrder).removeClass().addClass('icon-chevron-up');

        $scope.sortOrder = newSortOrder;
        $scope.filteredItems =
            $filter('orderBy')($scope.filteredItems, $scope.sortOrder, $scope.reverse);

    }
    $http.get('/api/agentsWorkItemsSummary').
        success(function (data) {
            console.log("agentsWorkItemsSummary data"+ JSON.stringify(data));
        }).
        error(function (error) {
            console.log("At: " + moment().format() +
                ", save camp. post ERROR with error " + JSON.stringify(error));

        });

}