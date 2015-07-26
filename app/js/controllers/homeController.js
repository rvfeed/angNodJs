/**
 * Created with IntelliJ IDEA.
 * User: spoujula
 * Date: 1/5/13
 * Time: 11:31 AM
 * To change this template use File | Settings | File Templates.
 */

'use strict';

/**
 * This is the HomePage controller
 *
 * @param $scope
 * @param $http
 * @param $filter
 */

function HomeCtrl($scope, $http, $filter) {


    /**
     * This function used to receiveMessage from server
     * Pass the get-message if it's success we get the post success message  from server
     * otherwise we get Error get post message from server.
     */

//    $scope.receiveMessage = function () {
//        console.log("Home submitMessage @ " + moment().format('h.mm.ss.SSS'));
//        //post the get-message details to db
//        $http.post('/get-message').
//            success(function (msg) {
//                console.log("get post success: " + JSON.stringify(msg));
//            }).error(function (data, status, headers, config) {
//                console.log("Error get post message: " + JSON.stringify(data) +
//                    " status: " + status +
//                    " headers: " + JSON.stringify(headers) +
//                    " config: " + JSON.stringify(config));
//
//            });
//    };

}