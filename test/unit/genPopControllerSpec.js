/**
 * Created with IntelliJ IDEA.
 * User: spoujula
 * Date: 22/2/13
 * Time: 3:36 PM
 * To change this template use File | Settings | File Templates.
 */

describe("genPopControllerSpec.js: ", function () {

    var ctrl, scope, httpMock, genPopData, masterData, campaignsData;
    var singleCampaignData = {Campaign: [
        {
            "_id": "1",
            "name": "TESTY Campaign",
            "status": "Active",
            "type": "Retention Type 1",
            "agents": [
                {
                    "name": "rjones",
                    "fullName": "Sean Feeley"
                },
                {
                    "name": "akrier",
                    "fullName": "Shaun Basalik"
                }
            ],
            "description": "we4t5erfgdrfyrftrfg",
            "startDate": "2012-01-06T05:00:00.000Z",
            "endDate": "2014-08-17T07:06:40.000Z"
        }
    ]};


    var makeLoginUser = function (userRole) {
        // returning login user json:
        // {"id":1,"userName":"admin","firstname":"Acme","lastname":"Admin",
        // "password":"admin","email":"admin@example.com","role":"ADMIN"}

        if (!userRole) {
            userRole = "ADMIN";
        }

        return {"id": 1, "userName": "admin",
            "firstname": "Acme", "lastname": "Admin",
            "password": "admin",
            "email": "admin@example.com", "role": userRole };
    };


    var makeUserConfigurationData = function () {
        var result = {
                "filters": {
                    "normalizedAnnualUsage": ["", ""],
                    "aggregatekWh": [
                        "85231002",
                        ""
                    ],
                    "aggregateGas": ["", ""],
                    "annualkWh": ["", ""],
                    "annualGasUsage": ["", ""],
                    "aggregateGreenkWh": ["", ""],
                    "cashbackBalance": ["", ""],
                    "monthsUntilCashAward": ["", ""],
                    "serviceEndDate": [],
                    "monthsActive": ["", ""],
                    "monthsSinceDropped": ["", ""],
                    "pricing": ["", ""],
                    "dropStatusMapped": null,
                    "dropStatusDate": [],
                    "utilityState": [
                        "TX"
                    ],
                    "utilityAbbr": [],
                    "accountNumber": "",
                    "partner": [],
                    "contactName": "",
                    "dropRep": "",
                    "accountType": "1",
                    "commodity": "All",
                    "dropType": "All"
                }
            };

        return result;
    };


    var makeWorkItems = function () {
        return  {GenPopData: [
            { accountNumber: "10089010238026547000", aggregatekWh: 85231002, "accountType": "1",
                annualkWh: 45152521, cashbackBalance: 1236,
                contactName: "DAVID", dropStatus: "Canceled", utilityState: "TX",
                "partner": "Continental Airlines", utilityAbbr: "CONED",
                "campaignId": null},
            { accountNumber: "40045023822654620100", aggregatekWh: 5523645, "accountType": "2",
                annualkWh: 3715252, cashbackBalance: 14367,
                contactName: "JAMES", dropStatus: "Lost", utilityState: "PA",
                "partner": "American Airlines", utilityAbbr: "NYSEG",
                "campaignId": null },
            { accountNumber: "10089010238026874123", aggregatekWh: 8787878, "accountType": "3",
                annualkWh: 3636363, cashbackBalance: 87512,
                contactName: "DAVID", dropStatus: "Not Contacted", utilityState: "CT",
                "partner": "Delta Air Lines", utilityAbbr: "NGRID",
                "campaignId": null }
        ]}
    };

    genPopData = makeWorkItems();

    masterData = {MasterData: [
        {key: "Utilities", value: [
            {"utilityAbbrev": "CONED", "utility": "Consolidated Edison"},
            {"utilityAbbrev": "NGRID", "utility": "Niagara Mohawk"},
            {"utilityAbbrev": "NYSEG", "utility": "New York State Electric And Gas - Electric"}
        ]},
        {key: "DropStatuses", value: [
            {"statusName": "Canceled"},
            {"statusName": "Lost"},
            {"statusName": "Not Contacted"}
        ]},
        {key: "States", value: [
            {"abbrev": "CT"},
            {"abbrev": "PA"},
            {"abbrev": "TX"}
        ]},
        {key: "Partners", value: [
            {"partnerName": "American Airlines"},
            {"partnerName": "Continental Airlines"},
            {"partnerName": "Delta Air Lines"}
        ]},
        {
            "key": "AccountType", "value": ["All", "Residential", "Commercial"]
        },
        {
            "key": "HoldReasonType",
            "value": ["Reason1", "Reason2", "Reason3", "Reason4", "Reason5"]
        }
    ]};

    var makeUserData = function () {
        return {
            "UserData": [
                {
                    "configuration": {
                            "filters": {
                                "aggregatekWh": [
                                    "85231002",
                                    ""
                                ],
                                "utilityState": [
                                    "TX"
                                ],
                                "accountType": "1"
                            },
                        "grid": [
                            {
                                "pageSize": 6,
                                "sortInfo": {
                                    "direction": "desc",
                                    "field": "dropStatusDate"
                                }
                            }
                        ]
                        },
                    "userName": "akrier",
                    "isActive": true,
                    "roles": [
                        "AGENT"
                    ]
                },
                {
                    "configuration": {
                            "filters": {
                                "aggregatekWh": [
                                    "85231002",
                                    ""
                                ],
                                "utilityState": [
                                    "TX"
                                ]
                            }
                        },
                    "userName": "rjones",
                    "isActive": false,
                    "roles": [
                        "AGENT"
                    ]
                }
            ]
        };
    }

    campaignsData = {CampaignsList: [
        {
            "_id": "1",
            "name": "First Campaign",
            "status": "Active",
            "type": "Retention Type 1",
            "agents": ["rjones", "akrier"],
            "description": "we4t5erfgdrfyrftrfg"}
    ]};

    // TODO: Does this line do anything?
    beforeEach(module("myApp"));


    var initializeMocksParameterized =
        function (params, $controller, $rootScope, $routeParams, $httpBackend) {
            var workItemDataResponse = params.workItemData || genPopData;
            var masterDataResponse = params.masterData || masterData;


            var userDataResponse = params.userData || makeUserData();
            var userDataResponse2 = params.userData2 || makeUserData();


            var campaignsDataResponse = params.campaignsData || campaignsData;
            var thisCampaignResponse = params.thisCampaign || singleCampaignData;
            var userRole = params.userRole || 'ADMIN';
            var currentUserResponse = params.currentUser || makeLoginUser(userRole);

            var apiCountPath = params.apiCountPath || '/api/getFilterRecordCount';

            if (userRole == "AGENT")
                apiCountPath += "?role=" + userRole;
            var apiWorkItemsPath = params.apiWorkItemsPath ||
                '/api/getWorkItems?direction=desc&limit=6&offset=0&sort=dropStatusDate';
            var campaignId = params.campaignId || null;

            httpMock = $httpBackend;
            scope = $rootScope.$new();

            $routeParams.id = campaignId;

            httpMock.when('GET', '/api/UserData').
                respond(userDataResponse);
            httpMock.when('GET', '/api/listCampaigns').
                respond(campaignsDataResponse);
            httpMock.when('GET', '/api/user/').
                respond(currentUserResponse);
            httpMock.when('GET', '/api/MasterData').
                respond(masterDataResponse);
            if (params.apiCampaignByIdPath) {
                httpMock.when('GET', params.apiCampaignByIdPath).
                    respond(thisCampaignResponse);
            }

            // TODO: Reconcile this with the GET', '/api/UserData above
            httpMock.when('GET', '/api/SavedFiltersData').
                respond(userDataResponse2);

            httpMock.when('GET', apiCountPath).
                respond({ count: 100 });
            httpMock.when('GET', apiWorkItemsPath).
                respond(workItemDataResponse);

            ctrl = $controller("GenPopCtrl", {$scope: scope });

            httpMock.flush();
        };


    // TODO: This is duplicated a lot

    var initializeMocksCopy = function (genPopData, masterData, userData, campaignsData, $controller, $rootScope, $routeParams, $httpBackend, id,  // campaign id if defined
                                        userRole) {
        httpMock = $httpBackend;
        scope = $rootScope.$new();

        $routeParams.id = id;
        var data = {Campaign: [
            {
                "_id": "1",
                "name": "First Campaign",
                "status": "Active",
                "type": "Retention Type 1",
                "agents": [
                    {
                        "name": "rjones",
                        "fullName": "Sean Feeley"
                    },
                    {
                        "name": "akrier",
                        "fullName": "Shaun Basalik"
                    }
                ],
                "description": "we4t5erfgdrfyrftrfg",
                "startDate": "2012-01-06T05:00:00.000Z",
                "endDate": "2014-08-17T07:06:40.000Z"
            }
        ]};

        var idGet = ($routeParams.id != null) ? '/api/getCampaignById/' + $routeParams.id : '/api/getCampaignById';

        var countGet = ($routeParams.id != null) ? '/api/getFilterRecordCount/' + $routeParams.id : '/api/getFilterRecordCount';

        httpMock.when('GET', '/api/UserData').
            respond(userData);
        httpMock.when('GET', '/api/listCampaigns').
            respond(campaignsData);

        // TODO: Parameterize this
        httpMock.when('GET', '/api/user/').
            respond(makeLoginUser(userRole));
        httpMock.when('GET', '/api/MasterData').
            respond(masterData);
        httpMock.when('GET', idGet).
            respond(data);
        httpMock.when('GET', '/api/SavedFiltersData').
            respond(userData);
        httpMock.when('GET', countGet).
            respond({ count: 100 });
        httpMock.when('GET',
                '/api/getWorkItems?direction=desc&limit=6&offset=0&sort=dropStatusDate').
            respond(genPopData);

        ctrl = $controller("GenPopCtrl", {
            $scope: scope

        });

        httpMock.flush();
    };


    var initializeMocks = function (genPopData, masterData, userData, campaignsData, $controller, $rootScope, $routeParams, $httpBackend, id,  // campaign id if defined
                                    userRole) {
        httpMock = $httpBackend;
        scope = $rootScope.$new();

        $routeParams.id = id;
        var data = {Campaign: [
            {
                "_id": "1",
                "name": "First Campaign",
                "status": "Active",
                "type": "Retention Type 1",
                "agents": [
                    {
                        "name": "rjones",
                        "fullName": "Sean Feeley"
                    },
                    {
                        "name": "akrier",
                        "fullName": "Shaun Basalik"
                    }
                ],
                "description": "we4t5erfgdrfyrftrfg",
                "startDate": "2012-01-06T05:00:00.000Z",
                "endDate": "2014-08-17T07:06:40.000Z"
            }
        ]};

        var apiGet = ($routeParams.id != null) ? '/api/getWorkItems/' + $routeParams.id : '/api/getWorkItemskItems';
        var idGet = ($routeParams.id != null) ? '/api/getCampaignById/' + $routeParams.id : '/api/getCampaignById';

        var countGet = ($routeParams.id != null) ? '/api/getFilterRecordCount/' + $routeParams.id : '/api/getFilterRecordCount';

        countGet += "?role=ADMIN";
        apiGet += "?direction=desc&limit=6&offset=0&sort=dropStatusDate";

        httpMock.when('GET', '/api/UserData').
            respond(userData);
        httpMock.when('GET', '/api/listCampaigns').
            respond(campaignsData);

        // TODO: Parameterize this
        httpMock.when('GET', '/api/user/').
            respond(makeLoginUser(userRole));
        httpMock.when('GET', '/api/MasterData').
            respond(masterData);
        httpMock.when('GET', idGet).
            respond(data);
        httpMock.when('GET', '/api/SavedFiltersData').
            respond(userData);
        httpMock.when('GET', countGet).
            respond({ count: 100 });
        httpMock.when('GET', apiGet).
            respond(genPopData);

        ctrl = $controller("GenPopCtrl", {
            $scope: scope

        });

        httpMock.flush();
    };

    describe('checking agents popup on load and on selecting campaign in GenPop and campaign page', function () {

        beforeEach(inject(function ($controller, $rootScope, $routeParams, $httpBackend) {
            initializeMocksParameterized({
                    campaignId: 1,
                    userRole: 'AGENT',
                    apiCampaignByIdPath: '/api/getCampaignById/1',
                    apiCountPath: '/api/getFilterRecordCount/1',
                    apiWorkItemsPath: '/api/getWorkItems/1?direction=desc&limit=6&offset=0&sort=dropStatusDate'
                },

                $controller, $rootScope, $routeParams, $httpBackend);
        }));

        it('Checking total agents list', function () {
            expect(scope.userData.length).toBeDefined();
            expect(scope.userData.length).toMatch("2");
        });

        it('Checking active agents list', function () {
            scope.selectedCampaign = "1";
            expect(scope.allAgents).toBeDefined();
            expect(scope.allAgents.length).toMatch("1");
            expect(scope.agentsList.length).toMatch("1");
        });

        //ACME 132 test cases
        it('Checking work items title true/false', function () {
            expect(scope.checkGenpop).toBeFalsy();
        });

        it('show title, start and end date of the campaign', function () {
            expect(scope.campaignName).toMatch("TESTY Campaign");
            expect(scope.campaignStartDate.toDate().toISOString()).toMatch("2012-01-06T05:00:00.000Z");
            expect(scope.campaignEndDate.toDate().toISOString()).toMatch("2014-08-17T07:06:40.000Z");
        });

        afterEach(function () {
            httpMock.verifyNoOutstandingExpectation();
            httpMock.verifyNoOutstandingRequest();
        });
    });


    describe('agent grid configuration', function () {

        beforeEach(inject(function ($controller, $rootScope, $routeParams, $httpBackend) {
            initializeMocksParameterized({
                    campaignId: 1,
                    userRole: 'AGENT',
                    apiCampaignByIdPath: '/api/getCampaignById/1',
                    apiCountPath: '/api/getFilterRecordCount/1',
                    apiWorkItemsPath: '/api/getWorkItems/1?direction=desc&limit=6&offset=0&sort=dropStatusDate'
                },

                $controller, $rootScope, $routeParams, $httpBackend);
        }));

        it('do not show campaign and agent assignment select boxes', function () {
            expect(scope.checkAdmin).toBeDefined();
            expect(scope.checkAdmin).toBeTruthy();
        });

        it('Hide check box column', function () {
            expect(scope.gridOptions.multiSelect).toBeFalsy();
            expect(scope.gridOptions.displaySelectionCheckbox).toBeFalsy();
        });

        it('shows columns', function () {

            var columnList = '';

            angular.forEach(scope.gridColumnDefs, function (column) {
                columnList += column.displayName + " | ";
            });

            var expectedList = 'Drop Days | EP Status | Acct No. | Acct Name | Norm. Ann Usage | Aggr kWh | ' +
                'Ann kWh | Aggr Gas | Ann Gas | UOM | Meters | Pricing | Utility | State | ' +
                'Award Bal. | Mo. Till Award | Mo. Active | Mo. Drop | Invoices | Save Count | ' +
                'Svc Start | Svc End | Award Due | Drop Date | Status | Type | Premise | ' +
                'Partner | Contact Name | Commodity | Promotion | Aggr. Green kWh | ' +
                'Green Indicator | Master Id | Reminder Date | On Hold | ';
            expect(columnList).toBe(expectedList);

            expect(scope.gridColumnDefs.length).toEqual(36);
        });

        // before agent
        it('shows save count', function () {
            expect(scope.gridColumnDefs[19].field).toEqual("saveCount");
        });

        // after agent
        it('shows service start', function () {
            expect(scope.gridColumnDefs[20].field).toEqual("serviceStartDate");
        });

        it('removes agent column', function () {
            for (var i = 0; i < scope.gridColumnDefs.length; i++) {
                expect(scope.gridColumnDefs[i].field).not.toEqual('dropRep');
            }
        });

        afterEach(function () {
            httpMock.verifyNoOutstandingExpectation();
            httpMock.verifyNoOutstandingRequest();
        });
    });


    describe('initialize the ng-grid', function () {


        function columnDefinition(field, displayName, width, cellFilter, cellClass, minWidth) {
            var columnDef = { field: field, displayName: displayName };

            if (width) {
                columnDef.width = width;
            }

            if (cellFilter) {
                columnDef.cellFilter = cellFilter;
            }


            if (cellClass) {
                columnDef.cellClass = cellClass;
            }

            if (minWidth) {
                columnDef.minWidth = minWidth;
            } else {
                columnDef.minWidth = 66;
            }

            columnDef.headerCellTemplate =
                "<div class=\"ngHeaderSortColumn {{col.headerClass}}\" " +
                    "ng-style=\"{'cursor': col.cursor}\" " +
                    "ng-class=\"{ 'ngSorted': !noSortVisible }\">" +
                    "    <div ng-click=\"col.sort($event)\" ng-class=\"'colt' + col.index\" class=\"ngHeaderText\" title=\"{{col.displayName}} \">{{col.displayName}}</div>" +
                    "    <div class=\"ngSortButtonDown\" ng-show=\"col.showSortButtonDown()\"></div>" +
                    "    <div class=\"ngSortButtonUp\" ng-show=\"col.showSortButtonUp()\"></div>" +
                    "    <div class=\"ngSortPriority\">{{col.sortPriority}}</div>" +
                    "    <div ng-class=\"{ ngPinnedIcon: col.pinned, ngUnPinnedIcon: !col.pinned }\" ng-click=\"togglePin(col)\" ng-show=\"col.pinnable\"></div>" +
                    "</div>" +
                    "<div ng-show=\"col.resizable\" class=\"ngHeaderGrip\" ng-click=\"col.gripClick($event)\" ng-mousedown=\"col.gripOnMouseDown($event)\"></div>";

            columnDef.visible = true;
            return columnDef;
        }

        var columnCheck = function (index, field, displayName, width, cellFilter, cellClass, minWidth) {
            var columnDef = columnDefinition(field, displayName, width, cellFilter, cellClass, minWidth);
            it('should have column ' + displayName, function () {
                expect(scope.gridColumnDefs[index]).toEqual(columnDef);
            });

        };

        var columnCheckAgent = function (index, field, displayName, width, cellFilter, cellClass, minWidth) {
            var columnDef = columnDefinition(field, displayName, width, cellFilter, cellClass, minWidth);
            columnDef.cellTemplate =
                '<div ng-class="{greenCell: row.getProperty(\'acmeData.pendingAgent\') != null}">' +
                    '<div class="ngCellText" title="{{getPendingAgentTitle(row.getProperty(\'dropRep\')' +
                    ',row.getProperty(\'acmeData.pendingAgent.fullName\'))}}">' +
                    '{{getAgentText(row.getProperty(col.field))}}</div></div>';
            it('should have column ' + displayName, function () {
                expect(scope.gridColumnDefs[index]).toEqual(columnDef);
            });

        };

        var columnCheckAccount = function (index, field, displayName, width, cellFilter, cellClass, minWidth) {
            var columnDef = columnDefinition(field, displayName, width, cellFilter, cellClass, minWidth);
            columnDef.cellTemplate =
                '<div ><a onclick=' +
                    '\"window.open(\'{{row.getProperty(\'url\')}}\',\'Popup\',\'width=520,height=400,left=430,top=23\');' +
                    ' return false;" target="_blank" ' +
                    'href=\"{{row.getProperty(\'url\')}}"> ' +
                    '{{row.getProperty(\'accountNumber\')}} </a><div>';
            it('columnCheckAccount ' + displayName, function () {
                expect(scope.gridColumnDefs[index]).toEqual(columnDef);
            });

        };


        beforeEach(inject(function ($controller, $rootScope, $routeParams, $httpBackend) {
            initializeMocksCopy(
                genPopData, masterData, makeUserData(), campaignsData,
                $controller, $rootScope, $routeParams, $httpBackend, null);
        }));


//        beforeEach(inject(function ($controller, $rootScope, $routeParams, $httpBackend) {
//
//            console.log( "beforeEach for initialize the ng-grid")
//            var myUserData = makeUserData();
//
//            initializeMocksParameterized( {
//                    userData2: myUserData
////                    campaignId:1,
////                    userRole:'AGENT',
////                    apiCampaignByIdPath: '/api/getCampaignById/1',
////                    apiCountPath: '/api/getFilterRecordCount/1',
////                    apiWorkItemsPath: '/api/getWorkItems/1?direction=desc&limit=6&offset=0&sort=dropStatusDate'
//                },
//
//                $controller, $rootScope, $routeParams, $httpBackend );
//        }));
//


        it('check for grid options to exist', function () {
            expect(scope.gridOptions).toBeDefined();
        });


        it('check for enablePaging', function () {
            expect(scope.gridOptions.enablePaging).toBeTruthy();
        });
        it('check for .enableRowSelection).toBeTruthy();', function () {
            expect(scope.gridOptions.enableRowSelection).toBeTruthy();
        });


        // TODO: Check for user agent load where this is truthy!!
        it('check for .multiSelect).toBeTruthy();', function () {
            expect(scope.gridOptions.multiSelect).toBeTruthy();
        });
        it('check for .useExternalSorting).toBeTruthy();', function () {
            expect(scope.gridOptions.useExternalSorting).toBeTruthy();
        });
        it('check for .enableColumnReordering).toBeFalsy();', function () {
            expect(scope.gridOptions.enableColumnReordering).toBeFalsy();
        });

        it('check for .showFooter', function () {
            expect(scope.gridOptions.showFooter).toBeTruthy();
        });


        it('check for .enableColumnResize).toBeTruthy();', function () {
            expect(scope.gridOptions.enableColumnResize).toBeTruthy();
        });

        it('check for .columnDefs', function () {
            expect(scope.gridOptions.columnDefs).toBeDefined();
            expect(scope.gridOptions.columnDefs).toBe("gridColumnDefs");
        });


        it('check for plugin init', function () {

            expect(scope.gridOptions.plugins).toBeDefined();
            expect(scope.gridOptions.plugins.length).toBe(1);

            // would like to check class, but not sure how
            expect(typeof scope.gridOptions.plugins[0]).toBe("object");
//            expect( Object.prototype.toString.apply( scope.gridOptions.plugins[0]) ).toBe( "object" );
        });

        it('check for sort init', function () {

            expect(scope.gridSortInfo).toBeDefined();
            expect(scope.gridSortInfo.length).toBeUndefined();

            expect(scope.gridOptions.sortInfo).toBe(scope.gridSortInfo);
        });


        it('check for sort fields', function () {
            expect(scope.gridSortInfo.fields).toBeDefined();
            expect(scope.gridSortInfo.fields.length).toBe(1);
        });


        it('check for sort directions', function () {
            expect(scope.gridSortInfo.directions).toBeDefined();
            expect(scope.gridSortInfo.directions.length).toBe(1);
        });


        it('check for selection init', function () {
            expect(scope.selectedWorkItems).toBeDefined();
            expect(scope.selectedWorkItems.length).toBe(0);
            expect(scope.gridOptions.selectedItems).toBe(scope.selectedWorkItems);
        });

        it('check for rowTemplate', function () {
            expect(scope.gridOptions.rowTemplate).toBeDefined();

            var template = '<div ' +
                'class="ngCell {{col.cellClass}} {{col.colIndex()}}" ' +
                'ng-class="' +
                '{' +
                'newAgentStyle: row.getProperty(\'acmeData.pendingAgent\'), ' +
                'doNotCallStyle: row.getProperty(\'doNotCall\'), ' +
                'holdBucketStyle: displayHoldStyle(row.getProperty(\'holdBucket\'))' +
                '}" ' +
                'ng-style="{ \'cursor\': row.cursor }" ' +
                'ng-repeat="col in renderedColumns" ' +
                'ng-cell></div>';
            expect(scope.gridOptions.rowTemplate).toEqual(template);
        });


        it('check for footerRowHeight', function () {
            expect(scope.gridOptions.footerRowHeight).toBe(46);
        });

        it('check for footerTemplate', function () {
            expect(scope.gridOptions.footerTemplate).toBeDefined();

            var template =
                "<div class=\"ngFooterPanel\" " +
                    "ng-class=\"{'ui-widget-content': jqueryUITheme, 'ui-corner-bottom': jqueryUITheme}\" " +
                    "ng-style=\"footerStyle()\">" +
                    "    <div class=\"span4 ngTotalSelectContainer\" >" +
                    "        <div class=\"ngFooterTotalItems\" " +
                    "ng-class=\"{'ngNoMultiSelect': !multiSelect}\" >" +
                    "            <span class=\"ngLabel\">{{i18n.ngTotalItemsLabel}} {{$parent.gridOptions.totalServerItems | number: 0}}" +
                    "</span><span ng-show=\"filterText.length > 0\" class=\"ngLabel\">" +
                    "({{i18n.ngShowingItemsLabel}} {{totalFilteredItemsLength()}})</span>" +
                    "            <span class=\"ngLabel\"  " +
                    "ng-show=\"multiSelect && selectedItems.length > 0\" >" +
                    " -- {{i18n.ngSelectedItemsLabel}} {{selectedItems.length}}</span>" +
                    "        </div>" +
                    "    </div>" +
                    "<div class=\"span4 rstButton\">" +

                    "<button type=\"button\" class=\"btn\" " +
                    "ng-click=\"resetGridColumns()\">Reset Grid</button>" +
                    "</div>" +
                    "    <div class=\"span4 ngPagerContainer\" " +
                    "style=\"float: right; margin-top: 10px; margin-left:0\" " +
                    "ng-show=\"enablePaging\" ng-class=\"{'ngNoMultiSelect': !multiSelect}\">" +

                    "        <div style=\"float:right;  line-height:25px;\" " +
                    "class=\"ngPagerControl ngbottomControl\" >" +
                    "            <button class=\"ngPagerButton epPagerButton\" " +
                    "ng-click=\"pageToFirst()\" ng-disabled=\"cantPageBackward()\" " +
                    "title=\"{{i18n.ngPagerFirstTitle}}\"><div class=\"ngPagerFirstTriangle\">" +
                    "<div class=\"ngPagerFirstBar\"></div></div></button>" +
                    "            <button class=\"ngPagerButton epPagerButton\" " +
                    "ng-click=\"pageBackward()\" ng-disabled=\"cantPageBackward()\" " +
                    "title=\"{{i18n.ngPagerPrevTitle}}\"><div class=\"ngPagerFirstTriangle ngPagerPrevTriangle\">" +
                    "</div></button>" +
                    "            <input class=\"ngPagerCurrent epPagerButton\" " +
                    "type=\"number\" style=\"width:50px; height: 24px; margin-top: 1px; padding: 0 4px;\" " +
                    "ng-model=\"pagingOptions.currentPage\"/>" +
                    "            <button class=\"ngPagerButton epPagerButton\" " +
                    "ng-click=\"pageForward()\" ng-disabled=\"cantPageForward()\" " +
                    "title=\"{{i18n.ngPagerNextTitle}}\"><div class=\"ngPagerLastTriangle ngPagerNextTriangle\">" +
                    "</div></button>" +
                    "            <button class=\"ngPagerButton epPagerButton\" " +
                    "ng-click=\"pageToLast()\" ng-disabled=\"cantPageToLast()\" " +
                    "title=\"{{i18n.ngPagerLastTitle}}\"><div class=\"ngPagerLastTriangle\">" +
                    "<div class=\"ngPagerLastBar\"></div></div></button>" +
                    "        </div>" +
                    "        <div style=\"float:right; margin-right: 10px;\" class=\"ngRowCountPicker\">" +
                    "            <span style=\"float: left; margin-top: 3px;\" " +
                    "class=\"ngLabel\">{{i18n.ngPageSizeLabel}}</span>" +
                    "            <select style=\"float: left;height: 27px; width: 100px\" " +
                    "ng-model=\"pagingOptions.pageSize\" >" +
                    "                <option ng-repeat=\"size in pagingOptions.pageSizes\">{{size}}</option>" +
                    "            </select>" +
                    "        </div>" +
                    "    </div>" +
                    "</div>";


            expect(scope.gridOptions.footerTemplate).toEqual(template);
        });

        var index = 0;
        // Now for the columns
        // field, display, width, filter, class, min width
        columnCheck(index, 'calculated.dropDays', 'Drop Days', 80);
        columnCheck(++index, 'dropStatusMapped', 'EP Status', 85);
        columnCheckAccount(++index, 'accountNumber', 'Acct No.', 165);
//        columnCheck(++index, 'masterCustomerID', 'Master Id', 66 );
//        columnCheck(++index, 'meters', 'Meters', 66 );
        columnCheck(++index, 'accountName', 'Acct Name', 125);
        columnCheck(++index, 'normalizedAnnualUsage', 'Norm. Ann Usage', 125, 'number:0', 'numberCell');
        columnCheck(++index, 'aggregatekWh', 'Aggr kWh', 66, 'number:0', 'numberCell');
        columnCheck(++index, 'annualkWh', 'Ann kWh', 66, 'number:0', 'numberCell');
        columnCheck(++index, 'aggregateGas', 'Aggr Gas', 66, 'number:0', 'numberCell');
        columnCheck(++index, 'annualGasUsage', 'Ann Gas', 66, 'number:0', 'numberCell');
        columnCheck(++index, 'uom', 'UOM', 66);
        columnCheck(++index, 'meters', 'Meters', 66);
//        columnCheck(++index, 'aggregateGreenkWh', 'Aggr. Green kWh', 125,'number:0', 'numberCell');
        columnCheck(++index, 'pricing', 'Pricing', 66);
        columnCheck(++index, 'utilityName', 'Utility', 125);
        columnCheck(++index, 'utilityState', 'State', 50, null, null, 50);
        columnCheck(++index, 'cashbackBalance', 'Award Bal.', 72, 'currency', 'numberCell');
        columnCheck(++index, 'calculated.monthsUntilCashAward', 'Mo. Till Award', 95, "number");
        columnCheck(++index, 'calculated.monthsActive', 'Mo. Active', 80, "number");
        columnCheck(++index, 'calculated.monthsSinceDropped', 'Mo. Drop', 66, "number");
        columnCheck(++index, 'numOfInvoices', 'Invoices', 66);
        columnCheck(++index, 'saveCount', 'Save Count', 80);
        columnCheckAgent(++index, 'dropRep', 'Agent', 125);

        columnCheck(++index, 'serviceStartDate', 'Svc Start', 80, "date:'yyyy-MM-dd'");
        columnCheck(++index, 'serviceEndDate', 'Svc End', 80, "date:'yyyy-MM-dd'");
        columnCheck(++index, 'cashbackDueDate', 'Award Due', 80, "date:'yyyy-MM-dd'");
        columnCheck(++index, 'dropStatusDate', 'Drop Date', 80, "date:'yyyy-MM-dd'");
        columnCheck(++index, 'dropStatus', 'Status', 125);
        columnCheck(++index, 'dropType', 'Type', 90);
        columnCheck(++index, 'premiseStatus', 'Premise', 90);
        columnCheck(++index, 'partner', 'Partner', 125);
//        columnCheck(++index, 'pricing', 'Pricing', 66);
        columnCheck(++index, 'contactName', 'Contact Name', 125);
        columnCheck(++index, 'commodity', 'Commodity', 100);
        columnCheck(++index, 'promotion', 'Promotion', 150);
        columnCheck(++index, 'aggregateGreenkWh', 'Aggr. Green kWh', 125, 'number:0', 'numberCell');
        columnCheck(++index, 'greenIndicator', 'Green Indicator', 100);
        columnCheck(++index, 'masterCustomerID', 'Master Id', 66);


        it('check agent tooltip', function () {
            expect(scope.getPendingAgentTitle("foo", null)).toBe("foo");
        });

        it('check pending agent change tooltip', function () {
            expect(scope.getPendingAgentTitle("foo", "Baar")).toBe("Pending change to Baar");
        });

        afterEach(function () {
            httpMock.verifyNoOutstandingExpectation();
            httpMock.verifyNoOutstandingRequest();
        });
    });


    describe('grid state saving', function () {

        beforeEach(inject(function ($controller, $rootScope, $routeParams, $httpBackend) {
            initializeMocksCopy(genPopData, masterData, makeUserData(), campaignsData,
                $controller, $rootScope, $routeParams, $httpBackend, null);
        }));

        it('check for basic copy of visible', function () {

            scope.loadingFlag = false;

            var fakeGridColumns = scope.getDefaultGridColumns();

            // mimic the grid setup executing
            scope.gridOptions.$gridScope = { columns: fakeGridColumns }

            fakeGridColumns[0].visible = false;

            expect(scope.gridColumnDefs[0].visible).toBeTruthy();

            // "watch" a change
            scope.watchGridColumnChange();

            expect(scope.gridColumnDefs[0].visible).toBeFalsy();
        });

        it('check for basic copy of width', function () {

            scope.loadingFlag = false;

            var fakeGridColumns = scope.getDefaultGridColumns();

            // mimic the grid setup executing
            scope.gridOptions.$gridScope = { columns: fakeGridColumns };


            var width = 110;

            fakeGridColumns[0].width = 110;
            fakeGridColumns[0].origWidth = 25;

            expect(scope.gridColumnDefs[0].width).toBe(80);

            // "watch" a change
            scope.watchGridColumnChange();

            expect(scope.gridColumnDefs[0].width).toBe(width);

        });

        it('do not copy while loading', function () {

            scope.loadingFlag = true;

            var fakeGridColumns = scope.getDefaultGridColumns();

            // mimic the grid setup executing
            scope.gridOptions.$gridScope = { columns: fakeGridColumns };

            var width = 110;

            fakeGridColumns[0].width = width;

            expect(scope.gridColumnDefs[0].width).toBe(80);

            // "watch" a change
            scope.watchGridColumnChange();

            expect(scope.gridColumnDefs[0].width).toBe(80);

        });

        it('Saves column info', function () {

            expect(scope.gridColumnDefs).toBeDefined();

            scope.gridColumnDefs.length = 0;
            scope.gridColumnDefs.push({
                save: true,
                field: 'accountNumber',
                width: 1234,
                visible: true
            });

            var postData = [
                {
                    "pageSize": 6,
                    "sortInfo": {
                        "direction": "desc",
                        "field": "dropStatusDate"
                    },
                    gridColumnDefs: [
                        {
                            save: true,
                            field: 'accountNumber',
                            width: 1234,
                            visible: true
                        }
                    ]
                }
            ];

            httpMock.expectPOST('/api/SaveGridConfiguration', postData).respond({});

            // The watch should fire and save the configuration, but we do it manually in a test
            // happens in a a timeout
            scope.watchGridColumnChange();

            // call the save grid
            scope.saveGridConfiguration();

            httpMock.flush();
        });


        it('resets column info', function () {

            expect(scope.gridColumnDefs).toBeDefined();

            scope.gridColumnDefs.length = 0;
            scope.gridColumnDefs.push({
                save: true,
                field: 'accountNumber',
                width: 1234,
                visible: true
            });

            var postData = [
                {
                    "pageSize": 25,
                    "sortInfo": {
                        "direction": "desc",
                        "field": "dropStatusDate"
                    },
                    gridColumnDefs: []
                }
            ];

            httpMock.expectPOST('/api/SaveGridConfiguration', postData).respond({});

            // crux
            scope.resetGridColumns();

            httpMock.flush();
        });


        it('resets sort info', function () {

            scope.activeUserData.configuration.grid[0].sortInfo.field = 'annualkWh';
            scope.activeUserData.configuration.grid[0].sortInfo.direction = 'asc';

            var postData = [
                {
                    "pageSize": 25,
                    "sortInfo": {
                        "direction": "desc",
                        "field": "dropStatusDate"
                    },
                    gridColumnDefs: []
                }
            ];

            httpMock.expectPOST('/api/SaveGridConfiguration', postData).respond({});

            // crux
            scope.resetGridColumns();

            httpMock.flush();
        });


        it('resets paging', function () {

            scope.activeUserData.configuration.grid[0].pageSize = 34939;
            scope.pagingOptions.pageSize = 6766;

            var postData = [
                {
                    "pageSize": 25,
                    "sortInfo": {
                        "direction": "desc",
                        "field": "dropStatusDate"
                    },
                    gridColumnDefs: []
                }
            ];

            httpMock.expectPOST('/api/SaveGridConfiguration', postData).respond({});

            // crux
            scope.resetGridColumns();

            httpMock.flush();
        });


        it('Save pageSize when it changes', function () {
            console.log("startof pageSize change");

            expect(scope.pagingOptions.pageSize).toBe(6);
            expect(scope.activeUserData.configuration.grid[0].pageSize).toBe(6);

            var postData = [
                {
                    "pageSize": 233,
                    "sortInfo": {"direction": "desc", "field": "dropStatusDate"},
                    "gridColumnDefs": []
                }
            ];
            httpMock.expectPOST('/api/SaveGridConfiguration', postData).respond({});

            scope.pagingOptions.pageSize = 233;

            // The watch should fire and save the configuration, but we do it manually in a test
            scope.checkPageSizeOfGrid();

            expect(scope.activeUserData.configuration.grid[0].pageSize).toBe(233);

            httpMock.flush();
        });

        it('Save sortInfo when it changes from nothing', function () {
            console.log("startof sortInfo change");

            expect(scope.activeUserData).toBeDefined();
            expect(scope.activeUserData.configuration).toBeDefined();
            expect(scope.activeUserData.configuration.grid).toBeDefined();
            expect(scope.activeUserData.configuration.grid[0]).toBeDefined();
            expect(scope.activeUserData.configuration.grid[0].sortInfo).toBeDefined();

            expect(scope.activeUserData.configuration.grid[0].sortInfo.field).toBe('dropStatusDate');
            expect(scope.activeUserData.configuration.grid[0].sortInfo.direction).toBe('desc');

            var event = {}; // We don't look at this right now
            var columnInfo = {
                "fields": ["meters"],
                "directions": ["asc"],
                "columns": []
            }; // We only watch the first field and first direction

            // Something is not resetting the loading flag
            // TODO: what?
            scope.loadingFlag = false;

            expect(scope.loadingFlag).toBeFalsy();


            var postData = [
                { "pageSize": 6,
                    "sortInfo": {

                        "direction": "asc",
                        "field": "meters"
                    },
                    "gridColumnDefs": []
                }
            ];
            httpMock.expectPOST('/api/SaveGridConfiguration', postData).respond({});


            // Should trigger a work item load
            httpMock.expectGET('/api/getWorkItems?direction=asc&limit=6&offset=0&sort=meters').respond({});

            // simulate a sort event

            scope.respondToSortEvent(event, columnInfo);

            expect(scope.activeUserData.configuration.grid[0].sortInfo).toBeDefined();

            expect(scope.activeUserData.configuration.grid[0].sortInfo.field).toBe('meters');
            expect(scope.activeUserData.configuration.grid[0].sortInfo.direction).toBe('asc');

            httpMock.flush();

        });

        afterEach(function () {
            httpMock.verifyNoOutstandingExpectation();
            httpMock.verifyNoOutstandingRequest();
        });
    });


    describe('load user configuration data for grid ', function () {

        var localUserData = function () {
            var localUserData = makeUserData();
            localUserData.UserData[0].configuration =
            {
                grid: [
                    {
                        pageSize: 99,
                        "sortInfo": {
                            "direction": "desc",
                            "field": "accountName"
                        },
                        gridColumnDefs: [
                            {
                                field: 'calculated.dropDays',
                                displayName: 'Drop Days',
                                width: "100", visible: true,
                                save: true
                            },
                            {
                                field: 'accountNumber',
                                displayName: 'Account No.',
                                width: "200", visible: false,
                                save: true }
                        ]
                    }
                ]};

//            localUserData.UserData[0].configuration[0].pageSort = { field:'accountName', direction:'desc' };
//            localUserData.UserData[0].configuration[0].gridColumnDefs =
//                [
//                    {field:'calculated.dropDays', displayName:'Drop Days', width:"100", visible:true, save:true },
//                    {field:'accountNumber', displayName:'Account No.', width:"200", visible:false, save:true }
//                ];

            return localUserData
        };

        var headerCellTemplateDef = "<div class=\"ngHeaderSortColumn {{col.headerClass}}\" ng-style=\"{'cursor': col.cursor}\" ng-class=\"{ 'ngSorted': !noSortVisible }\">    <div ng-click=\"col.sort($event)\" ng-class=\"'colt' + col.index\" class=\"ngHeaderText\" title=\"{{col.displayName}} \">{{col.displayName}}</div>    <div class=\"ngSortButtonDown\" ng-show=\"col.showSortButtonDown()\"></div>    <div class=\"ngSortButtonUp\" ng-show=\"col.showSortButtonUp()\"></div>    <div class=\"ngSortPriority\">{{col.sortPriority}}</div>    <div ng-class=\"{ ngPinnedIcon: col.pinned, ngUnPinnedIcon: !col.pinned }\" ng-click=\"togglePin(col)\" ng-show=\"col.pinnable\"></div></div><div ng-show=\"col.resizable\" class=\"ngHeaderGrip\" ng-click=\"col.gripClick($event)\" ng-mousedown=\"col.gripOnMouseDown($event)\"></div>";


        beforeEach(inject(function ($controller, $rootScope, $routeParams, $httpBackend) {

            initializeMocksParameterized({
                    userRole: 'ADMIN',
                    userData: localUserData(),
                    userData2: localUserData(),
                    apiWorkItemsPath: '/api/getWorkItems' +
                        '?direction=desc&limit=99&offset=0&sort=accountName'
                },

                $controller, $rootScope, $routeParams, $httpBackend);
        }));

        it('check for pagingOptions.pageSize', function () {
            console.log(" before pagingOptions.pageSize");
            expect(scope.pagingOptions.pageSize).toBeDefined();
            expect(scope.pagingOptions.pageSize).toBe(99);
            console.log(" after pagingOptions.pageSize check ");
        });

        it('check for gridOptions.totalServerItems', function () {
            expect(scope.gridOptions.totalServerItems).toBeDefined();
            expect(scope.gridOptions.totalServerItems).toBe(100);
        });

        it('check for pagingOptions.totalPages', function () {
            expect(scope.pagingOptions.totalPages).toBeDefined();
            expect(scope.pagingOptions.totalPages).toBe(2);
        });

        it('check for grid sort info', function () {
            expect(scope.gridSortInfo).toBeDefined();
            expect(scope.gridSortInfo.fields).toBeDefined();
            expect(scope.gridSortInfo.fields.length).toBe(1);
            expect(scope.gridSortInfo.directions).toBeDefined();
            expect(scope.gridSortInfo.directions.length).toBe(1);

            expect(scope.gridSortInfo.fields[0]).toBe("accountName");
            expect(scope.gridSortInfo.directions[0]).toBe("desc");
        });

        it('check for user gridColumnDefs', function () {
            expect(scope.gridColumnDefs).toBeDefined();
            expect(scope.gridColumnDefs.length).toBe(35);
        });


        it('account number', function () {

            var coldef = {
                field: 'accountNumber',
                displayName: 'Acct No.',
                cellTemplate: '<div ><a onclick=' +
                    '\"window.open(\'{{row.getProperty(\'url\')}}\',\'Popup\',\'' +
                    'width=520,height=400,left=430,top=23\'); return false;" target="_blank" ' +
                    'href=\"{{row.getProperty(\'url\')}}"> {{row.getProperty(\'accountNumber\')}} ' +
                    '</a><div>',
                width: '200',
                headerCellTemplate: headerCellTemplateDef,
                visible: false,
                minWidth: 66,
                save: true };
            expect(scope.gridColumnDefs[2]).toEqual(coldef);
        });


        it('drop days', function () {

            var coldef = {
                field: 'calculated.dropDays',
                displayName: 'Drop Days',
                headerCellTemplate: headerCellTemplateDef,
                visible: true,
                width: '100',
                minWidth: 66,
                save: true };
            expect(scope.gridColumnDefs[0]).toEqual(coldef);
        });

        it('check for grid internal column defs', function () {
            expect(scope.gridOptions).toBeDefined();

            // TODO: how to inject the grid scope?
//            expect( scope.gridOptions.$gridScope ).toBeDefined();
//            expect( scope.gridOptions.$gridScope.columns ).toBeDefined();
//            expect( scope.gridColumnDefs.length ).toBe(2);
//            expect( scope.gridColumnDefs[0] ).toEqual(
//                {field:'calculated.dropDays', displayName:'Drop Days', width:"100",visible:true } );
//
//            expect( scope.gridColumnDefs[1] ).toEqual(
//                {field:'accountNumber', displayName:'Account no.', width:"200",visible:false} );
        });


        afterEach(function () {
            httpMock.verifyNoOutstandingExpectation();
            httpMock.verifyNoOutstandingRequest();
        });
    });

    describe('load Work items which are not associated with any campaign ', function () {

//        beforeEach(inject(function ($controller, $rootScope, $routeParams, $httpBackend) {
//            initializeMocks(
//                genPopData, masterData, makeUserData(), campaignsData,
//                $controller, $rootScope, $routeParams, $httpBackend, null);
//        }));

        beforeEach(inject(function ($controller, $rootScope, $routeParams, $httpBackend) {

//            console.log("beforeEach for initialize the ng-grid")
            var myUserData = makeUserData();

            initializeMocksParameterized({
                    userData2: myUserData
                },

                $controller, $rootScope, $routeParams, $httpBackend);
        }));


        it('check for master data response', function () {

            expect(scope.MasterData).toBeDefined();
            expect(scope.MasterData.length).toBe(6);
            expect(scope.MasterData[0].key).toBe("Utilities");
            expect(scope.MasterData[1].key).toBe("DropStatuses");
            expect(scope.MasterData[2].key).toBe("States");
            expect(scope.MasterData[3].key).toBe("Partners");
            expect(scope.MasterData[4].key).toBe("AccountType");
            expect(scope.MasterData[5].key).toBe("HoldReasonType");
            expect(scope.MasterData[ 2 ].value[2].abbrev).toBe("TX");
        });

        it('check for saved filter data response', function () {

            expect(scope.pagingOptions.pageSize).toBeDefined();
            expect(scope.pagingOptions.pageSize).toBe(6);

        });

        it('show saved filter data as selected among master data', function () {
            expect(scope.filters).toBeDefined();

            expect(scope.filters.utilityState[0]).toBe("TX");
        });

        it('check for filters initialization', function () {

            expect(scope.filters).toBeDefined();
            expect(scope.filters.aggregatekWh).toEqual([ '85231002', '' ]);
            expect(scope.filters.annualkWh).toEqual(["", ""]);
            expect(scope.filters.utilityState).toEqual([ 'TX' ]);
            expect(scope.filters.cashbackBalance).toEqual(["", ""]);
            expect(scope.filters.accountNumber).toEqual("");
            expect(scope.filters.contactName).toEqual("");
        });

        it('check for filters validation', function () {

            expect(scope.validateFilterDetails()).toBeFalsy();

            expect(scope.aggrkWhErrorMessage).toBeFalsy();
            expect(scope.annkWhErrorMessage).toBeFalsy();
            expect(scope.cashErrorMessage).toBeFalsy();
            expect(scope.mtaErrorMessage).toBeFalsy();
        });

        it('check for work items those are not assigned to any campaign ', function () {
            expect(scope.displayItems).toBeDefined();
            expect(scope.displayItems.length).toBe(3);
            expect(scope.displayItems[ 0 ].utilityState).toBe("TX");
            expect(scope.displayItems[ 0 ].campaignId).toBeDefined();
            expect(scope.displayItems[ 0 ].campaignId).toBe(null);
        });

        it('check for campaigns  list ', function () {
            expect(scope.campaignsList).toBeDefined();
            expect(scope.campaignsList[0].name).toBe("First Campaign");
            expect(scope.campaignsList[0].status).toBe("Active");
        });
        //ACME-147
        it('check for work items those are having  Account Type as Residential ', function () {
            expect(scope.displayItems).toBeDefined();
            expect(scope.displayItems.length).toBe(3);
            expect(scope.displayItems[ 0 ].accountType).toBe("1");
        });

        afterEach(function () {
            httpMock.verifyNoOutstandingExpectation();
            httpMock.verifyNoOutstandingRequest();
        });
    });


    describe('load  work items associated with a campaign', function () {
        var workItemsListWithCampaigns = {GenPopData: [
            { accountNumber: "10089010238026547000", aggregatekWh: 85231002, annualkWh: 45152521, cashbackBalance: 1236,
                contactName: "DAVID", dropStatus: "Canceled", utilityState: "TX", "partner": "Continental Airlines", utilityAbbr: "CONED", "campaignId": "1"},
            { accountNumber: "40045023822654620100", aggregatekWh: 5523645, annualkWh: 3715252, cashbackBalance: 14367,
                contactName: "JAMES", dropStatus: "Lost", utilityState: "PA", "partner": "American Airlines", utilityAbbr: "NYSEG", "campaignId": "2"},
            { accountNumber: "10089010238026874123", aggregatekWh: 8787878, annualkWh: 3636363, cashbackBalance: 87512,
                contactName: "DAVID", dropStatus: "Not Contacted", utilityState: "CT", "partner": "Delta Air Lines", utilityAbbr: "NGRID", "campaignId": "1"}
        ]};
        var campaignsListData = {CampaignsList: [
            {
                "_id": "1",
                "name": "First Campaign",
                "status": "Active",
                "type": "Retention Type 1",
                "description": "we4t5erfgdrfyrftrfg"},
            {
                "_id": "2",
                "name": "Second Campaign",
                "status": "Active",
                "type": "Retention Type 1",
                "description": "we4t5erfgdrfyrftrfg"}
        ]};

        beforeEach(inject(function ($controller, $rootScope, $routeParams, $httpBackend) {
            initializeMocks(workItemsListWithCampaigns, masterData, makeUserData(), campaignsListData, $controller, $rootScope, $routeParams, $httpBackend, "1");
        }));

        it('check for work items those are  assigned to  campaign ', function () {
            expect(scope.displayItems).toBeDefined();
            expect(scope.displayItems.length).toBe(3);
            expect(scope.displayItems[ 0 ].utilityState).toBe("TX");
            expect(scope.displayItems[ 0 ].campaignId).toBeDefined();
            expect(scope.displayItems[ 0 ].campaignId).toBe("1");
        });

        it('check for all campaigns  ', function () {
            expect(scope.campaignsList).toBeDefined();
            expect(scope.campaignsList[0].name).toBe("First Campaign");
            expect(scope.campaignsList[0].status).toBe("Active");
        });


    });

    describe('Work Item Assignment', function () {

        var agent, testCampaign, workItems;

        beforeEach(inject(function () {

            agent = {
                "_id": "456",
                "fullName": "Danielle Stauffer",
                "name": "dpfrommer"
            };

            testCampaign = {
                "name": "Small Usage",
                "startDate": "2013-03-01T05:00:00.000Z",
                "endDate": "2013-05-31T04:00:00.000Z",
                "status": "Active", "type": "Other",
                "description": "",
                "agents": [
                    {"name": "akrier", "fullName": "Annmarie Krier"},
                    {"name": "bcox", "fullName": "Brian Cox"},
                    {"name": "dpfrommer", "fullName": "Danielle Stauffer"},
                    {"name": "dcarder", "fullName": "Dave Carder"}
                ], "order": 2,
                "_id": "123"
            };

            workItems = {GenPopData: [

                {   "_id": "124",
                    accountNumber: "10089010238026547000",
                    repUserName: "rjones",
                    dropRep: "Robert Jones",
                    aggregatekWh: 85231002,
                    annualkWh: 45152521,
                    cashbackBalance: 1236,
                    contactName: "DAVID",
                    dropStatus: "Canceled",
                    dropStatusMapped: "other",
                    utilityState: "TX",
                    "partner": "Continental Airlines",
                    utilityAbbr: "CONED",
                    "energyPlusID": 123455666,
                    "eventID": 9991,
                    "dropOriginSystem": 1,
                    "campaignId": "4" },
                {  "_id": "123",
                    accountNumber: "40045023822654620100",
                    repUserName: "stoobari",
                    dropRep: "S. Toobari",
                    aggregatekWh: 5523645,
                    annualkWh: 3715252, cashbackBalance: 14367,
                    contactName: "JAMES",
                    dropStatus: "Lost",
                    dropStatusMapped: "lost",
                    utilityState: "PA",
                    "partner": "American Airlines",
                    utilityAbbr: "NYSEG",
                    "energyPlusID": 1234556836,
                    "eventID": 9992,
                    "dropOriginSystem": 1,
                    "campaignId": "2",
                    "holdBucket": [
                        {
                            "agent": "bcox",
                            "comments": "from Danielle Stauffer",
                            "reminderDate": "2013-04-18T00:00:00.000Z",
                            "HoldReasonType": "Reason3"
                        }
                    ]
                },
                {  "_id": "125",
                    accountNumber: "10089010238026874123",
                    repUserName: "epalmer",
                    dropRep: "Edward Palmer",
                    aggregatekWh: 8787878,
                    annualkWh: 3636363,
                    cashbackBalance: 87512,
                    contactName: "DAVID",
                    dropStatus: "Not Contacted",
                    utilityState: "CT",
                    "partner": "Delta Air Lines",
                    utilityAbbr: "NGRID",
                    "energyPlusID": 12343666,
                    "eventID": 9993,
                    "dropOriginSystem": 2,
                    "campaignId": "3"
                }
            ]};
        }));


        describe('one to campaign', function () {

            beforeEach(inject(function ($controller, $rootScope, $routeParams, $httpBackend) {
                initializeMocks(workItems, masterData, makeUserData(), campaignsData, $controller, $rootScope, $routeParams, $httpBackend, "1");
            }));

            it('assign single work item to campaign ', function () {

                httpMock.expectPOST('/api/UpdateWorkItem',
                    scope.finalWorkItems).respond({});

                var logData = [
                    {
                        "event": "Work Item Action",
                        "byWhom": "admin",
                        "from": "First Campaign", "fromId": "1",
                        "to": "Small Usage", "toId": "123",
                        "workItemId": "123",
                        "action": "Assign", "status": "Success"}
                ];

                httpMock.expectPOST('/api/logWorkItem', logData).respond({});

                scope.selectedCampaign = testCampaign;

                // UI adds WI to selectedWorkItems array when checkbox checked
                scope.selectedWorkItems = [ workItems.GenPopData[1] ];

                // Crux:
                scope.assignWorkItem();

                expect(scope.finalWorkItems).toBeDefined();
                expect(scope.finalWorkItems.length).toBe(1)

                //TODO: Need more asserts about what is in finalWorkItems...
            });

        });

        describe('multiple to campaign', function () {

            beforeEach(inject(function ($controller, $rootScope, $routeParams, $httpBackend) {
                initializeMocks(workItems, masterData, makeUserData(), campaignsData, $controller, $rootScope, $routeParams, $httpBackend, "1");
            }));


            it('it updates', function () {

                // select a campaign
                scope.selectedCampaign = testCampaign;

                httpMock.expectPOST('/api/UpdateWorkItem',
                    scope.finalWorkItems).respond({});

                var logItemPosted = [];

                logItemPosted =
                    [
                        {
                            "event": "Work Item Action",
                            "byWhom": "admin",
                            "from": "First Campaign", "fromId": "1",
                            "to": "Small Usage", "toId": "123",
                            "workItemId": "124",
                            "action": "Assign",
                            "status": "Success"
                        },
                        {
                            "event": "Work Item Action",
                            "byWhom": "admin",
                            "from": "First Campaign", "fromId": "1",
                            "to": "Small Usage", "toId": "123",
                            "workItemId": "123",
                            "action": "Assign",
                            "status": "Success"
                        }
                    ];


                httpMock.expectPOST('/api/logWorkItem', logItemPosted).respond({});

                // UI adds WI to selectedWorkItems array when checkbox checked
                scope.selectedWorkItems = [ workItems.GenPopData[0], workItems.GenPopData[1] ];

                // Crux:
                scope.assignWorkItem();
                expect(scope.finalWorkItems).toBeDefined();
                expect(scope.finalWorkItems.length).toBe(2);

                angular.forEach(scope.finalWorkItems, function (item) {
                    expect(item.campaignId).toEqual(testCampaign["_id"]);
                });
            });


        });

        describe('to agent', function () {


            beforeEach(inject(function ($controller, $rootScope, $routeParams, $httpBackend) {

                var myUserData = makeUserData();

                initializeMocksParameterized({
                        userData2: myUserData,
                        workItemData: workItems
                    },

                    $controller, $rootScope, $routeParams, $httpBackend);
            }));

            it('assign single work item to agent', function () {

                var item = workItems.GenPopData[0];

                var postData = [
                    {
                        // Data required for rabbit
//                        foo: 'bar',
                        eventID: item.eventID,
                        energyPlusID: item.energyPlusID,
                        dropOriginSystem: item.dropOriginSystem,
                        dropStatusMapped: item.dropStatusMapped,
                        pendingAgent: {
                            userName: agent.name,
                            fullName: agent.fullName
                        },

                        // Data required for logging
                        event: "Agent Action",
                        oldAgentUsername: item.repUserName,
                        oldAgentFullname: item.dropRep,

                        // Data required for updating
                        workItemId: item["_id"]}
                ];


                httpMock.expectPOST('/api/changeAgent', postData).respond({});

                scope.selectedCampaign = {};
                scope.selectedAgent = agent;

                scope.selectedWorkItems = [ workItems.GenPopData[0] ];

                // Crux
                scope.assignWorkItem();

                // don't change dropRep
                expect(scope.displayItems[0].dropRep).toEqual("Robert Jones");
                expect(scope.displayItems[0].repUserName).toEqual("rjones");

                // ?? do assign pending
                // TODO: This is working in the app, but not the test harness.
                // No idea why.  Perhaps the post has not processed yet???
                // pendingAgent: {
//                    userName: agent.name,
//                        fullName: agent.fullName
//                },
//                expect(scope.displayItems[0].pending x AgentFullname).toEqual("dpfrommer");
//                expect(scope.displayItems[0].pending x AgentUsername).toEqual("Danielle Stauffer");

                // shouldn't log from UI for this action
                expect(scope.finalWorkItems).toBeDefined();
                expect(scope.finalWorkItems.length).toBe(0);
            });

            it('assign multiple work items to agent ', function () {

                var item = workItems.GenPopData[1];
                var item2 = workItems.GenPopData[2];

                var postData = [
                    {
                        // Data required for rabbit
                        eventID: item.eventID,
                        energyPlusID: item.energyPlusID,
                        dropOriginSystem: item.dropOriginSystem,
                        dropStatusMapped: item.dropStatusMapped,
                        pendingAgent: {
                            userName: agent.name,
                            fullName: agent.fullName
                        },

                        // Data required for logging
                        event: "Agent Action",
                        oldAgentUsername: item.repUserName,
                        oldAgentFullname: item.dropRep,

                        // Data required for updating
                        workItemId: item["_id"]
                    },
                    {
                        // Data required for rabbit
                        eventID: item2.eventID,
                        energyPlusID: item2.energyPlusID,
                        dropOriginSystem: item2.dropOriginSystem,
                        dropStatusMapped: item2.dropStatusMapped,

                        pendingAgent: {
                            userName: agent.name,
                            fullName: agent.fullName
                        },

                        // Data required for logging
                        event: "Agent Action",
                        oldAgentUsername: item2.repUserName,
                        oldAgentFullname: item2.dropRep,

                        // Data required for updating
                        workItemId: item2["_id"]
                    }
                ];


                httpMock.expectPOST('/api/changeAgent', postData).respond({});

                scope.selectedCampaign = {};
                scope.selectedAgent = agent;

                scope.selectedWorkItems = [ workItems.GenPopData[1], workItems.GenPopData[2]  ];

                scope.assignWorkItem();

                expect(scope.finalWorkItems).toBeDefined();
                expect(scope.finalWorkItems.length).toBe(0);
            });
        });

        describe('to campaign and agent', function () {

            beforeEach(inject(function ($controller, $rootScope, $routeParams, $httpBackend) {

                var myUserData = makeUserData();

                initializeMocksParameterized({
                        userData2: myUserData,
                        workItemData: workItems
                    },

                    $controller, $rootScope, $routeParams, $httpBackend);
            }));


            it('assign single work item to agent ', function () {

                var item = workItems.GenPopData[0];

                var postData = [
                    {
                        // Data required for rabbit
                        eventID: item.eventID,
                        energyPlusID: item.energyPlusID,
                        dropOriginSystem: item.dropOriginSystem,
                        dropStatusMapped: item.dropStatusMapped,
                        pendingAgent: {
                            userName: agent.name,
                            fullName: agent.fullName
                        },

                        // Data required for logging
                        event: "Agent Action",
                        oldAgentUsername: item.repUserName,
                        oldAgentFullname: item.dropRep,

                        // Data required for updating
                        workItemId: item["_id"]}
                ];

                httpMock.expectPOST('/api/changeAgent', postData).respond({});

                httpMock.expectPOST('/api/UpdateWorkItem',
                    scope.finalWorkItems).respond({});

                var logData = [
                    {
                        "event": "Work Item Action",
                        "byWhom": "admin",
                        "from": "GenPop", "fromId": null,
                        "to": "Small Usage", "toId": "123",
                        "workItemId": "124",
                        "action": "Assign", "status": "Success"}
                ];

                httpMock.expectPOST('/api/logWorkItem', logData).respond({});

                scope.selectedCampaign = testCampaign;
                scope.selectedAgent = agent;

                scope.selectedWorkItems = [ workItems.GenPopData[0] ];

                // Crux
                scope.assignWorkItem();

                // don't change dropRep
                expect(scope.displayItems[0].dropRep).toEqual("Robert Jones");
                expect(scope.displayItems[0].repUserName).toEqual("rjones");

                // ?? do assign pending
//            expect( scope.displayItems[0].pendingAgentId).toEqual( "dpfrommer" );
//            expect( scope.displayItems[0].pendingAgentFullname).toEqual( "Danielle Stauffer" );

                // shouldn't log from UI for this action
                expect(scope.finalWorkItems).toBeDefined();
                expect(scope.finalWorkItems.length).toBe(1);

                expect(scope.finalWorkItems[0].campaignId).toBe(testCampaign["_id"]);
            });

        });


        describe('Agnet Hold Bucket', function () {

            beforeEach(inject(function ($controller, $rootScope, $routeParams, $httpBackend) {
                initializeMocks(workItems, masterData, makeUserData(), campaignsData, $controller, $rootScope, $routeParams, $httpBackend, "1");
            }));

            it('add work item into hold bucket ', function () {

                scope.selectedWorkItems = [ workItems.GenPopData[0] ];
                scope.user.userName = "dpfrommer";

                httpMock.expectPOST('/api/UpdateWorkItem',
                    scope.selectedWorkItems).respond({});


                // UI adds WI to selectedWorkItems array when checkbox checked
                expect(scope.holdBucket.length).toBe(0);

                //check the current agent is in the hold bucket or not.
                scope.addOrEditHold();

                //add hold bucket details
                // scope.holdBucket.comments = "test1"
                // scope.holdBucket.reminderDate = "2013-04-18T00:00:00.000Z";

                //add hold bucket details to the work item
                scope.addOrEditWorkItemsToHold(scope.user.userName, "2013-04-22T00:00:00.000Z", "test1");

                expect(scope.holdBucket.length).toBe(0);
                expect(scope.selectedWorkItems[0].holdBucket[0].comments).toBe("test1");
                expect(scope.selectedWorkItems[0].holdBucket[0].reminderDate).toBe("2013-04-22T00:00:00.000Z");


            });

            it('update work item in hold bucket ', function () {

                scope.selectedWorkItems = [ workItems.GenPopData[1] ];
                scope.user.userName = "bcox";

                httpMock.expectPOST('/api/UpdateWorkItem',
                    scope.selectedWorkItems).respond({});

                //check the current agent is in the hold bucket or not.
                scope.addOrEditHold();

                //update hold bucket details
                // scope.holdBucket.comments = "update work item in hold bucket"
                //   scope.holdBucket.reminderDate = "2013-04-19T00:00:00.000Z";

                //add hold bucket details to the work item
                scope.addOrEditWorkItemsToHold(scope.user.userName, "2013-04-19T00:00:00.000Z", "update work item in hold bucket");
                expect(scope.selectedWorkItems[0].holdBucket[scope.bucketNum].comments).toBe("update work item in hold bucket");
                expect(scope.selectedWorkItems[0].holdBucket[scope.bucketNum].reminderDate).toBe("2013-04-19T00:00:00.000Z");
                expect(scope.selectedWorkItems[0].holdBucket[scope.bucketNum].agent).toBe("bcox");

            });

            it('add multiple agents to  work item hold bucket ', function () {

                scope.selectedWorkItems = [ workItems.GenPopData[1] ];
                scope.user.userName = "dpfrommer";

                httpMock.expectPOST('/api/UpdateWorkItem',
                    scope.selectedWorkItems).respond({});


                // UI adds WI to selectedWorkItems array when checkbox checked
                expect(scope.holdBucket.length).toBe(0);

                //check the current agent is in the hold bucket or not.
                scope.addOrEditHold();

                //add hold bucket details
                //  scope.holdBucket.comments = "test1"
                //  scope.holdBucket.reminderDate = "2013-04-22T00:00:00.000Z";

                //add hold bucket details to the work item
                scope.addOrEditWorkItemsToHold(scope.user.userName, "2013-04-22T00:00:00.000Z", "test1", "Reason1");

                expect(scope.selectedWorkItems[0].holdBucket.length).toBe(2);
                expect(scope.selectedWorkItems[0].holdBucket[0].agent).toBe("bcox");
                expect(scope.selectedWorkItems[0].holdBucket[1].agent).toBe("dpfrommer");
                expect(scope.selectedWorkItems[0].holdBucket[0].comments).toBe("from Danielle Stauffer");
                expect(scope.selectedWorkItems[0].holdBucket[1].comments).toBe("test1");
                expect(scope.selectedWorkItems[0].holdBucket[0].reminderDate).toBe("2013-04-18T00:00:00.000Z");
                expect(scope.selectedWorkItems[0].holdBucket[1].reminderDate).toBe("2013-04-22T00:00:00.000Z");
                expect(scope.selectedWorkItems[0].holdBucket[0].HoldReasonType).toBe("Reason3");
                expect(scope.selectedWorkItems[0].holdBucket[1].HoldReasonType).toBe("Reason1");


            });

            it('remove work item from hold bucket ', function () {

                scope.selectedWorkItems = [ workItems.GenPopData[1] ];
                scope.user.userName = "bcox";

                httpMock.expectPOST('/api/UpdateWorkItem',
                    scope.selectedWorkItems).respond({});

                //remove current agent from the hold bucket.
                scope.removeWorkItemHold(scope.user.userName);

                expect(scope.selectedWorkItems[0].holdBucket.length).toBe(0);


            });

        });


        afterEach(function () {

            httpMock.flush();

            httpMock.verifyNoOutstandingExpectation();
            httpMock.verifyNoOutstandingRequest();
        });


    }); // end of assign work item global describe


    describe('filter data should save', function () {


        beforeEach(inject(function ($controller, $rootScope, $routeParams, $httpBackend) {


            var workItems = makeWorkItems();

            initializeMocksParameterized({
                    workItemData: workItems
                },

                $controller, $rootScope, $routeParams, $httpBackend);
        }));


        it('it saves no dates', function () {

            var configData = makeUserConfigurationData();

            httpMock.expectPOST('/api/SaveFilters',
                configData).respond({});

            scope.go();
        });

        it('it saves minimum service end date without null maximum', function () {
            var browserIsoDate = '2012-10-13T15:13:00.000Z';

            scope.filters.serviceEndDate[0] = moment(browserIsoDate);

            var configData = makeUserConfigurationData();

            // this is our filter from above
            configData.filters.serviceEndDate = [ browserIsoDate, null ];

            httpMock.expectPOST('/api/SaveFilters',
                configData).respond({});

            scope.go();
        });
        it('it saves minimum service end date with null maximum', function () {
            var browserIsoDate = '2012-10-13T15:13:00.000Z';

            scope.filters.serviceEndDate[0] = moment(browserIsoDate);
            scope.filters.serviceEndDate[1] = null;

            var configData = makeUserConfigurationData();

            // this is our filter from above
            configData.filters.serviceEndDate = [ browserIsoDate, null ];

            httpMock.expectPOST('/api/SaveFilters',
                configData).respond({});

            scope.go();
        });
//
        it('it saves maximum service end date', function () {
            var browserIsoDate = '2012-10-13T15:13:00.000Z';

            scope.filters.serviceEndDate[0] = null;
            scope.filters.serviceEndDate[1] = moment(browserIsoDate);

            var configData = makeUserConfigurationData();

            // this is our filter from above
            configData.filters.serviceEndDate = [ null, browserIsoDate ];

            httpMock.expectPOST('/api/SaveFilters',
                configData).respond({});

            scope.go();
        });
//
        it('it saves both service end date', function () {
            var browserIsoDateMin = '2012-10-13T15:13:00.000Z';
            var browserIsoDateMax = '2012-12-13T15:15:00.000Z';

            scope.filters.serviceEndDate[0] = moment(browserIsoDateMin);
            scope.filters.serviceEndDate[1] = moment(browserIsoDateMax);

            var configData = makeUserConfigurationData();

            // this is our filter from above
            configData.filters.serviceEndDate = [ browserIsoDateMin, browserIsoDateMax ];

            httpMock.expectPOST('/api/SaveFilters',
                configData).respond({});

            scope.go();
        });
//
        it('it saves minimum drop date with null', function () {
            var browserIsoDate = '2012-10-13T15:13:00.000Z';

            scope.filters.dropStatusDate[0] = moment(browserIsoDate);
            scope.filters.dropStatusDate[1] = null;

            var configData = makeUserConfigurationData();

            // this is our filter from above
            configData.filters.dropStatusDate = [ browserIsoDate, null ];

            httpMock.expectPOST('/api/SaveFilters',
                configData).respond({});

            scope.go();
        });
//
        it('it saves minimum drop date without null', function () {
            var browserIsoDate = '2012-10-13T15:13:00.000Z';

            scope.filters.dropStatusDate[0] = moment(browserIsoDate);
//            scope.filters.dropStatusDate[1] = null;

            var configData = makeUserConfigurationData();

            // this is our filter from above
            configData.filters.dropStatusDate = [ browserIsoDate, null ];

            httpMock.expectPOST('/api/SaveFilters',
                configData).respond({});

            scope.go();
        });

        it('it saves maximum drop date', function () {
            var browserIsoDate = '2012-10-13T15:13:00.000Z';

            scope.filters.dropStatusDate[0] = null;
            scope.filters.dropStatusDate[1] = moment(browserIsoDate);

            var configData = makeUserConfigurationData();

            // this is our filter from above
            configData.filters.dropStatusDate = [ null, browserIsoDate ];

            httpMock.expectPOST('/api/SaveFilters',
                configData).respond({});

            scope.go();
        });

        it('it saves both drop date', function () {
            var browserIsoDateMin = '2012-10-13T15:13:00.000Z';
            var browserIsoDateMax = '2012-12-13T15:15:00.000Z';

            scope.filters.dropStatusDate[0] = moment(browserIsoDateMin);
            scope.filters.dropStatusDate[1] = moment(browserIsoDateMax);

            var configData = makeUserConfigurationData();

            // this is our filter from above
            configData.filters.dropStatusDate = [ browserIsoDateMin, browserIsoDateMax ];

            httpMock.expectPOST('/api/SaveFilters',
                configData).respond({});

            scope.go();
        });


        afterEach(function () {

            httpMock.flush();

            httpMock.verifyNoOutstandingExpectation();
            httpMock.verifyNoOutstandingRequest();
        });

    });


    describe('check page load', function () {

        var routeParams;
        var controller;

        beforeEach(inject(function ($controller, $rootScope, $routeParams, $httpBackend) {
            httpMock = $httpBackend;
            scope = $rootScope.$new();
            routeParams = $routeParams;
            controller = $controller;

        }));

        it('master data fails', function () {

            httpMock.when('GET', '/api/UserData').
                respond(makeUserData());

            httpMock.when('GET', '/api/listCampaigns').
                respond(campaignsData);

            httpMock.when('GET', '/api/MasterData').
                respond(masterData)

            httpMock.when('GET', '/api/getFilterRecordCount').
                respond({ count: 100 });

            httpMock.when('GET', '/api/SavedFiltersData').
                respond(makeUserData());

            var makeLoginUser = function () {

                return {"id": 1,
                    "userName": "admin",
                    "firstname": "Acme",
                    "lastname": "Admin",
                    "password": "admin",
                    "email": "admin@example.com",
                    "role": "ADMIN"};
            };

            httpMock.when('GET', '/api/user/').
                respond(makeLoginUser());

            // GET /api/getWorkItems?limit=6&offset=0
            var workData = { "count": "1",
                GenPopData: [
                    { "annualkWh": "100" }
                ] };

            httpMock.when('GET',
                    '/api/getWorkItems?direction=desc&limit=6&offset=0&sort=dropStatusDate')
                .respond(workData);

            ctrl = controller("GenPopCtrl", {$scope: scope });


            httpMock.flush();


            expect(scope.gridOptions).toBeDefined();

            expect(scope.utilitiesList).toBeDefined();
        });

        afterEach(function () {
            httpMock.verifyNoOutstandingExpectation();
            httpMock.verifyNoOutstandingRequest();

        });
    });


    describe('check csv download', function () {


        var windowMock;

        beforeEach(inject(function ($controller, $rootScope, $routeParams, $httpBackend, $window) {


            windowMock = $window;

            console.log("Window dump: start")
            angular.mock.dump(windowMock);
            console.log("Window dump: end")

            var workItems = makeWorkItems();

            initializeMocksParameterized({
                    workItemData: workItems
                },

                $controller, $rootScope, $routeParams, $httpBackend);
        }));

        // TODO: how to test window open?

//        it('it works', function () {
//
//            expect(scope.validateFilterDetails()).toBeFalsy();
//
//            scope.exportFilterToCsv();
//        });


        afterEach(function () {

//            windowMock.flush();
//
//            windowMock.verifyNoOutstandingExpectation();
//            windowMock.verifyNoOutstandingRequest();
            httpMock.verifyNoOutstandingExpectation();
            httpMock.verifyNoOutstandingRequest();
        });
    }); // end of csv describe

    describe('check the AccountID URL in genpop ', function () {

        var masterData, GenPopData;
        masterData = {MasterData: [
            {key: "Utilities", value: [
                {"utilityAbbrev": "CONED", "utility": "Consolidated Edison"},
                {"utilityAbbrev": "NGRID", "utility": "Niagara Mohawk"},
                {"utilityAbbrev": "NYSEG", "utility": "New York State Electric And Gas - Electric"}
            ]},
            {key: "DropStatuses", value: [
                {"statusName": "Canceled"},
                {"statusName": "Lost"},
                {"statusName": "Not Contacted"}
            ]},
            {key: "States", value: [
                {"abbrev": "CT"},
                {"abbrev": "PA"},
                {"abbrev": "TX"}
            ]},
            {key: "Partners", value: [
                {"partnerName": "American Airlines"},
                {"partnerName": "Continental Airlines"},
                {"partnerName": "Delta Air Lines"}
            ]},
            {
                "key": "AccountType", "value": ["All", "Residential", "Commercial"]
            },
            {
                "id": "eventID", "url": "http://epiis01/dev/Sales/DropDetail.aspx?DropId="
            },
            {
                "id": "energyPlusID", "url": "http://epweb-dev/Member?accountId="
            }
        ]};

        GenPopData = {GenPopData: [

            {   "_id": "124",
                accountNumber: "10089010238026547000",
                repUserName: "rjones",
                dropRep: "Robert Jones",
                aggregatekWh: 85231002,
                annualkWh: 45152521,
                cashbackBalance: 1236,
                contactName: "DAVID",
                dropStatus: "Canceled",
                utilityState: "TX",
                "partner": "Continental Airlines",
                utilityAbbr: "CONED",
                "energyPlusID": 123455666,
                "eventID": 9991,
                "dropOriginSystem": 1,
                "campaignId": "4" },

            {  "_id": "125",
                accountNumber: "10089010238026874123",
                repUserName: "epalmer",
                dropRep: "Edward Palmer",
                aggregatekWh: 8787878,
                annualkWh: 3636363,
                cashbackBalance: 87512,
                contactName: "DAVID",
                dropStatus: "Not Contacted",
                utilityState: "CT",
                "partner": "Delta Air Lines",
                utilityAbbr: "NGRID",
                "energyPlusID": 12343666,
                "eventID": 9993,
                "dropOriginSystem": 2,
                "campaignId": "3"
            }
        ]};

        beforeEach(inject(function ($controller, $rootScope, $routeParams, $httpBackend) {
            initializeMocksCopy(GenPopData, masterData, makeUserData(), campaignsData,
                $controller, $rootScope, $routeParams, $httpBackend, null);
        }));

        it('check the eventID  in MasterData', function () {

            expect(scope.MasterData).toBeDefined();
            expect(scope.MasterData[5].id).toBe("eventID");
            expect(scope.MasterData[5].url).toBe("http://epiis01/dev/Sales/DropDetail.aspx?DropId=");
        });

        it('check the energyPlusID in MasterData ', function () {

            expect(scope.MasterData).toBeDefined();
            expect(scope.MasterData[6].id).toBe("energyPlusID");
            expect(scope.MasterData[6].url).toBe("http://epweb-dev/Member?accountId=");
        });


        it('check the eventID url based on dropOriginSystem 1  ', function () {

            scope.selectedGenPopData = GenPopData.GenPopData[0];
            var eventIDURL = scope.MasterData[5].url + scope.selectedGenPopData.eventID;
            expect(scope.selectedGenPopData.dropOriginSystem).toBe(1);
            expect(eventIDURL).toBe("http://epiis01/dev/Sales/DropDetail.aspx?DropId=9991");

        });

        it('check the energyPlusID url based on dropOriginSystem 2  ', function () {

            scope.selectedGenPopData = GenPopData.GenPopData[1];
            var energyPlusIDURL = scope.MasterData[6].url + scope.selectedGenPopData.energyPlusID;

            expect(scope.selectedGenPopData.dropOriginSystem).toBe(2);
            expect(energyPlusIDURL).toBe("http://epweb-dev/Member?accountId=12343666");

        });
    });// end of the check the AccountID URL
});

