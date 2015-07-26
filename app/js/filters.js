'use strict';

/* Filters */

angular.module('myApp.filters', []).
    filter('interpolate', ['version', function (version) {
        return function (text) {
            return String(text).replace(/\%VERSION\%/mg, version);
        }
    }]).filter('startFrom', function() {
        return function(input, idx) {
            var i=idx, len=input.length, result = [];
            for (i; i<len; i++)  {
                result.push(input[i]);
            }
            return result;
        };
    }).filter('displayFrom', function() {
        return function(input, start) {
            start = +start; //parse to int
            return input.slice(start);
        }
    }).filter('weDontLike', function(){
        return function(items, state){
            var arrayToReturn = [];
            for (var i=0; i<items.length; i++){
                if (items[i].state == state) {
                    arrayToReturn.push(items[i]);
                }
            }

            return arrayToReturn;
        };
    });
