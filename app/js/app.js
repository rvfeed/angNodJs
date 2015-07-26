'use strict';


// Declare app level module which depends on filters, and services
var app = angular.module('myApp', ['myApp.filters', 'myApp.services', 'myApp.directives', 'ngGrid']);
app.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $routeProvider.
        when('/genpop', {
            templateUrl: 'partials/gen-pop.html',
            controller: GenPopCtrl,
            activetab: 'genpop'
        })

    $routeProvider.
        when('/myCampaigns', {
            templateUrl: 'partials/mycampaign-dashboard.html',
            controller: myCampaignListCtrl,
            activetab: 'campaign'
        });

    $routeProvider.
        when('/listCampaigns', {
            templateUrl: 'partials/campaign-dashboard.html',
            controller: CampaignListCtrl,
            activetab: 'campaign'
        });

    $routeProvider.
        when('/CampaignPriority', {
            templateUrl: 'partials/campaign-prioritization.html',
            controller: CampaignListCtrl,
            activetab: 'campaign'

        });

    $routeProvider.
        when('/editVisualRule/:id?', {
            templateUrl: 'partials/campaign-ruleBuilder.html',
            controller: EditCampaignCtrl,
            activetab: 'campaign'

        });

    $routeProvider.
        when('/holdbucket/:hold', {
            templateUrl: 'partials/gen-pop.html',
            controller: GenPopCtrl,
            activetab: 'holdbucket'

        });
    $routeProvider.
        when('/addCampaign', {
            templateUrl: 'partials/campaign-edit.html',
            controller: EditCampaignCtrl,
            activetab: 'campaign'

        });

    $routeProvider.
        when('/editCampaign/:id', {
            templateUrl: 'partials/campaign-edit.html',
            controller: EditCampaignCtrl,
            activetab: 'campaign'

        })
    $routeProvider.
        when('/copyCampaign/:id/:page', {
            templateUrl: 'partials/campaign-edit.html',
            controller: EditCampaignCtrl,
            activetab: 'campaign'

        })

    $routeProvider.
        when('/showCampaignWorkItems/:id', {
            templateUrl: 'partials/gen-pop.html',
            controller: GenPopCtrl,
            activetab: 'campaign'

        })
        .when('/home', {
            templateUrl: 'partials/homeIndex.html',
            controller: HomeCtrl,
            activetab: 'home'
        })
        .when('/unauthorized', {
            templateUrl: 'partials/unauthorized.html'
        })
        .when('/reports', {
            templateUrl: 'partials/reports.html',
            activetab: 'reports'
        })
        .when('/logs', {
            templateUrl: 'partials/logs.html',
            activetab: 'logs',
            controller: logsCtrl
        })
        .when('/agents', {
            templateUrl: 'partials/agents.html',
            activetab: 'agents',
            controller: agentListCtrl
        })
        .when('/', {
            templateUrl: 'partials/homeIndex.html',
            controller: indexCtrl
        })
        .otherwise({

            redirectTo: '/listCampaigns'
        });

    $locationProvider.html5Mode(false);

}]);

app.directive('dndList', function () {

    return function (scope, element, attrs, $http) {

        // variables used for dnd
        var toUpdate;
        var startIndex = -1;

        // watch the model, so we always know what element
        // is at a specific position
        scope.$watch(attrs.dndList, function (value) {
            toUpdate = value;
            //   alert(JSON.stringify(toUpdate));
        }, true);

        // use jquery to make the element sortable (dnd). This is called
        // when the element is rendered
        $("#campaignOrder").sortable({
            items: 'tr',
            start: function (event, ui) {
                // on start we define where the item is dragged from
                startIndex = ($(ui.item).index());
                var $this = $(this);
            },
            stop: function (event, ui) {
                // on stop we determine the new index of the
                // item and store it there
                var newIndex = ($(ui.item).index());
                var toMove = toUpdate[startIndex];
                toUpdate.splice(startIndex, 1);
                toUpdate.splice(newIndex, 0, toMove); //alert(JSON.stringify(toUpdate));
                var i = 0;
                $("#campaignOrder tr").each(function () {

                    var $this = $(this);
                    //  alert(JSON.stringify(toUpdate));

                    // $this.attr("order", $this.index());
                    toUpdate[i].order = parseFloat(parseInt($this.index() + 1));
                    toUpdate[i].reorder = true;
                    // $this.id =$this.index()
                    i++;
                });


                // we move items in the array, if we want
                // to trigger an update in angular use $apply()
                // since we're outside angulars lifecycle
                scope.$apply(scope.activeCampaignsList);
            },
            axis: 'y'
        })
    }
});

// TODO: Temporary?
// Mikey trying to add in the grid paging device above the grid via suggestion from ng-grid, not yet working
// 2013-03-30

//app.directive('ngGridFooter2', ['$compile', '$templateCache', function ($compile, $templateCache) {
//    var ngGridFooter = {
//        scope: false,
//        compile: function ( ) {
//            return {
//                pre: function ($scope, iElement, iAttrs) {
//                    if (iElement.children().length === 0) {
//                        iElement.append($compile($templateCache.get($scope.$eval(iAttrs.id) + 'footerTemplate.html'))($scope.$eval(iAttrs.scope)));
//                    }
//                }
//            };
//        }
//    };
//    return ngGridFooter;
//}]);

/**
 * Truncate Filter
 * @Param text
 * @Param length, default is 14
 * @Param end, default is "..."
 * @return string
 */
app.filter('truncate', function () {
    return function (text, length, end) {
        if (isNaN(length))
            length = 14;

        if (end === undefined)
            end = "..";
        if(text=== undefined)
            return;
		if(text ===null)
			return;

        if (text.length <= length || text.length - end.length <= length) {
            return text;
        }
        else {
            text = String(text).substring(0, length-end.length);
            text = $.trim(text)+ end;
            return text;
        }

    };
});

/**
 * 
 * Add Tooltip
 */
app.directive('tooltip', function () {
    return {
        restrict:'A',
        link: function(scope, element, attrs)
        {
            $(element)
                .attr('title',scope.$eval(attrs.tooltip))
                .tooltip({placement: "bottom"});
        }
    }
})


app.filter('newlines', function(){
	 return function(text)
	  {
         console.log('length of string is'+ text.length);
         var result = '';
            while (text.length > 0) {
                     result += text.substring(0, 37) + '\n';
                     text = text.substring(37);
                    }
                    return result;

	  };
	
});

app.filter('tooltp_newlines', function(){
	 return function(text)
	  {

		  var result = '';
            while (text.length > 0) {
                     result += text.substring(0, 20) + '\n';
                     text = text.substring(20);
                    }
                    return result;
      };
	
 });
