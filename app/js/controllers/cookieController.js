/**
 * Created with IntelliJ IDEA.
 * User: spoujula
 * Date: 1/5/13
 * Time: 11:29 AM
 * To change this template use File | Settings | File Templates.
 */

'use strict';

function CookieCtrl($scope, $cookies, $location) {
    $scope.setCookie = function (c_name, value, exdays) {
        var exdate = new Date();
        exdate.setDate(exdate.getDate() + exdays);
        var c_value = escape(value) + ((exdays == null) ? "" : "; expires=" + exdate.toUTCString());
        document.cookie = c_name + "=" + c_value;
        $cookies.user = value;
        //   alert($cookies.user+"cookie control");

    }
    $scope.getCookie = function () {
        $scope.cookieValue = $cookies.user;
    }
    $scope.getCookie();

}