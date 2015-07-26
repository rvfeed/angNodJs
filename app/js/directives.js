'use strict';

/* Directives */


angular.module('myApp.directives', []).
    directive('appVersion', ['version', function (version) {
        return function (scope, elm) {
            elm.text(version);
        };
    }]);

angular.module('myApp.directives', []).filter('round', function () {

    return function (numberToRound) {
        if (numberToRound === undefined) {

            return '';
        }
        return Math.round(numberToRound);
    };
});




