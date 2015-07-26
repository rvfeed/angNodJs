// Test spec for the edt campaign controller
// Mikey Reppy 2013-02-12

describe("editControllerSpec.js", function () {


    var masterData = { MasterData:[
        {  "key":"CampaignTypes",
            "value":[
                "Retention Type 1",
                "Retention Type 2",
                "Retention Type 3",
                "Other"]
        },
        {
            "key": "EPStatuses",
            "value": [
                {"statusName": "Saved" },
                {"statusName": "Lost" },
                {"statusName": "Contacted" },
                {"statusName": "Not Contacted" },
                {"statusName": "Other" }
            ]
        },
        {"key":"RulesFilterFields",
            "value":[
                {
                    "value":"accountName",
                    "type":"Text",
                    "name":"Account Name",
                    "comment":""
                },
                {
                    "value":"accountNumber",
                    "type":"Text",
                    "name":"Account Number",
                    "comment":""
                }

            ]
        }
    ]
    };

    var makeUserData = function () {
        return {UserData:[
            {
                "fullName":"Avery Ang",
                "userName":"aang",
                "roles":[
                    "ADMIN",
                    "AGENT"
                ],
                isActive:true
            },
            {
                "fullName":"Sawyer Toobari",
                "userName":"stoobari",
                "roles":[
                    "AGENT"
                ],
                isActive:true
            },
            {
                "fullName":"Not Active",
                "userName":"nactive",
                "roles":[
                    "AGENT"
                ],
                isActive:false
            },
            {
                "fullName":"Selected Inactive",
                "userName":"sinactive",
                "roles":[
                    "AGENT"
                ],
                isActive:false
            },
            {
                "fullName":"Rory Smith",
                "userName":"rsmith",
                "roles":[
                    "ADMIN"
                ],
                isActive:true
            }
        ] };
    };

    var makeCampaignData = function() {

        return {
            "Campaign": [
                {
                    "name": "Test with empty database",
                    "startDate": "2013-02-19T05:00:00.000Z",
                    "endDate": "2013-04-01T04:00:00.000Z",
                    "status": "Active",
                    "type": "Retention Type 3",
                    "description": "Starts Feb 19, ends April 1, a few agents.",
                    "agents":[{"name":"aang","fullName":"Avery Ang"}],
                    "_id": "512ccab961b7547b02000001",
                    "rules" : {
                        "manualRule" : {
                            "annualkWh" : 3600
                        }
                    },
                    "order":9999999999
                }
            ]
        }

    };

    var makeCampaignDataWithVisualRule = function() {

        return {
            "Campaign": [
                {
                    "name": "Test with empty database",
                    "startDate": "2013-02-19T05:00:00.000Z",
                    "endDate": "2013-04-01T04:00:00.000Z",
                    "status": "Active",
                    "type": "Retention Type 3",
                    "description": "Starts Feb 19, ends April 1, a few agents.",
                    "agents":[{"name":"aang","fullName":"Avery Ang"}],
                    "_id": "512ccab961b7547b02000001",
                    "rules" : {
                        "visualRule" : {
                            "and" : [{
                                "displayName" : "Account Type",
                                "fieldName" : "accountType",
                                "type" : "MultiLookup",
                                "operator" : "Not In",
                                "value" : ["Residential"]
                            }]
                        }
                    },
                    "order":9999999999
                }
            ]
        }

    };

    var data =  {Details : [{"summaryBeforeRule":[{"_id":"","totalWorkItems":7,"totalAnnualKwh":198845,"totalAssociatedAccounts":68,"totalAggregateKwh":312687}]},
        {"summaryAfterRule":[{"_id":"","totalWorkItems":1,"totalAnnualKwh":103521,"totalAssociatedAccounts":3,"totalAggregateKwh":117437}]}]};

    beforeEach(module("myApp"));

    describe('editing existing campaign with manual rule', function () {

        var ctrl, scope, httpMock, userData;

        beforeEach(inject(function ($controller, $rootScope, $routeParams, $httpBackend) {
            httpMock = $httpBackend;
            scope = $rootScope.$new();

            userData = makeUserData();

            httpMock.when('GET', '/api/MasterData').
                respond(masterData);

            httpMock.when('GET', '/api/UserData').
                respond(userData);

            httpMock.when('GET', '/api/getCampaignById/123').
                respond( makeCampaignData() );

            // Initialize the id in the route parameters
            $routeParams.id = 123;


            ctrl = $controller("EditCampaignCtrl", {
                $scope:scope

            });

            httpMock.flush();
        }));


        it( "should reset loading flag", function () {
            expect( scope.loadingFlag).toBeDefined();
            expect( scope.loadingFlag).toBeFalsy();
        });

        it('check for campaign type load', function () {

            expect(scope.campaignTypes).toBeDefined();
            expect(scope.campaignTypes.length).toBe(4);
            expect(scope.campaignTypes[ 3 ]).toBe("Other");
        });

        it('check for campaign name', function () {

            expect(scope.campaign).toBeDefined();
            expect(scope.campaign.name).toBe("Test with empty database");
        });

        it('check for campaign start date', function () {

            expect( typeof( scope.campaign.startDate )).toBe( 'string' );

            // Expect to be a moment object not a simple date, and therefore have an isValid()
            expect( moment(scope.campaign.startDate).isValid() ).toBeTruthy();
            expect(  scope.campaign.startDate ).toBe( '02/19/2013' );
        });

        it('check for campaign end date', function () {

            expect( typeof( scope.campaign.endDate )).toBe( 'string' );

            // Expect to be a moment object not a simple date, and therefore have an isValid()
            expect( moment( scope.campaign.endDate ).isValid() ).toBeTruthy();
            expect( scope.campaign.endDate ).toBe( '04/01/2013' );
        });

        it('check for agent load', function () {

            expect(scope.allAgents).toBeDefined();
            expect(scope.allAgents.length).toBe(2);
            expect(scope.allAgents[ 0 ].userName).toBe("aang");
            expect(scope.allAgents[ 1 ].userName).toBe("stoobari");
        });


        it('check for campaign/agent initialization', function () {

            expect(scope.allAgents[ 0 ].checked).toBeTruthy();
            expect(scope.allAgents[ 1 ].checked).toBeFalsy();
        });


        it('should not display inactive agents', function () {

            // implied by the agent length check above, assert left here for
            // documentation
        });

        it('should display inactive agents selected for the campaign', function () {

            // repetitive from above, but included here to document expectation
            expect(scope.allAgents[ 1 ].userName).toBe("stoobari");
            expect(scope.allAgents[ 1 ].checked).toBeFalsy();
        });

        it('should support select all agents', function () {
            expect(scope.selectAllAgents).toBeDefined();

            var event = { target:{checked:true }};
            scope.selectAllAgents(event);

            expect(scope.allAgents[ 0 ].checked).toBeTruthy();
            expect(scope.allAgents[ 1 ].checked).toBeTruthy();
        });

        it('should support deselect all agents', function () {
            var event = { target:{checked:false }};
            scope.selectAllAgents(event);

            expect(scope.allAgents[ 0 ].checked).toBeFalsy();
            expect(scope.allAgents[ 1 ].checked).toBeFalsy();
        });

        it('check for existing rule (with manual rule) ', function () {

            expect( typeof( scope.campaign.rules )).toBe( 'object' );
            expect( scope.campaign.rules.manualRule ).toBeDefined();
            expect( scope.campaign.rules.visualRule ).toBeUndefined();
        });


        afterEach(function () {
            httpMock.verifyNoOutstandingExpectation();
            httpMock.verifyNoOutstandingRequest();
        });

    });

    describe('editing existing campaign with visual rule', function () {

        var ctrl, scope, httpMock, userData;

        beforeEach(inject(function ($controller, $rootScope, $routeParams, $httpBackend) {
            httpMock = $httpBackend;
            scope = $rootScope.$new();

            userData = makeUserData();

            httpMock.when('GET', '/api/MasterData').
                respond(masterData);

            httpMock.when('GET', '/api/UserData').
                respond(userData);

            httpMock.when('GET', '/api/getCampaignById/123').
                respond( makeCampaignDataWithVisualRule() );

            // Initialize the id in the route parameters
            $routeParams.id = 123;


            ctrl = $controller("EditCampaignCtrl", {
                $scope:scope

            });

            httpMock.flush();
        }));

        it('check for existing rule (with visual rule) ', function () {

            expect( typeof( scope.campaign.rules )).toBe( 'object' );
            expect( scope.campaign.rules.visualRule ).toBeDefined();
            expect( scope.campaign.rules.manualRule ).toBeUndefined();


        });

        it('check for displaying visual rule ', function () {

            expect( scope.selectedCondition).toEqual("and");
            expect( scope.finalFilters).toBeDefined();
            expect( scope.finalFilters.length).toBe(1);
            expect( scope.finalFilters[0].displayName).toBe("Account Type");
            expect( scope.finalFilters[0].operator).toBe("Not In");

        });

        it('Load rules field from masterData', function () {

            expect(scope.rulesFilterFields).toBeUndefined();

            // invoke visual rules
            scope.editVisualRule();
            expect(scope.rulesFilterFields).toBeDefined();
            expect(scope.rulesFilterFields.length).toBe(2);
            expect( JSON.stringify (scope.rulesFilterFields[0])).toEqual(
                JSON.stringify( {
                "value":"accountName",
                "type":"Text",
                "name":"Account Name",
                "comment":""
            } ));

        });

        it('Load epStatus list from masterData', function () {

            expect(scope.epStatusList).toBeUndefined();

            // invoke visual rules
            scope.editVisualRule();
            expect(scope.epStatusList).toBeDefined();
            expect(scope.epStatusList.length).toBe(5);
            expect( JSON.stringify (scope.epStatusList[2]) ).toEqual(
                '{"statusName":"Contacted"}');

        });

        afterEach(function () {
            httpMock.verifyNoOutstandingExpectation();
            httpMock.verifyNoOutstandingRequest();
        });

    });

    describe('adding new campaigns', function () {

        var ctrl, scope, httpMock, userData;

        beforeEach(inject(function ($controller, $rootScope, $routeParams, $httpBackend) {
            httpMock = $httpBackend;
            scope = $rootScope.$new();

            userData = makeUserData();

            httpMock.when('GET', '/api/MasterData').
                respond(masterData);

            httpMock.when('GET', '/api/UserData').
                respond(userData);


            // add campaign has no id in the route params, so clear it
            if ($routeParams.id) {
                $routeParams.id = null;
            }

            ctrl = $controller("EditCampaignCtrl", {
                $scope:scope

            });

            httpMock.flush();
        }));


        it('check for campaign type load', function () {

            expect(scope.campaignTypes).toBeDefined();
            expect(scope.campaignTypes.length).toBe(4);
            expect(scope.campaignTypes[ 3 ]).toBe("Other");
        });

        it('check for campaign initialization', function () {

            expect(scope.campaign).toBeDefined();
            expect(scope.campaign.name).toBe("");
        });

        it('check for agent load', function () {

            expect(scope.allAgents).toBeDefined();
            expect(scope.allAgents.length).toBe(2);
            expect(scope.allAgents[ 0 ].userName).toBe("aang");
            expect(scope.allAgents[ 1 ].userName).toBe("stoobari");
        });


        it('check for campaign/agent initialization', function () {

            expect(scope.allAgents[ 0 ].checked).toBeFalsy();
            expect(scope.allAgents[ 1 ].checked).toBeFalsy();
        });

        it('should not display inactive agents', function () {

            // implied by the agent length check above, assert left here for
            // documentation
        });


        it('has datepickers', function () {

            var endDate = $('#endDate');
            expect( endDate).toBeDefined();
//            expect( endDate.datePicker() ).toBeDefined();

            // TODO: how to test date picker change date?
            // Alton: EP.UIClients

            // implied by the agent length check above, assert left here for
            // documentation
        });

        it('check for campaign rules initialization', function () {

            expect(scope.campaign).toBeDefined();
            expect(scope.campaign.rules).toMatch([{ }]);
        });


        afterEach(function () {
            httpMock.verifyNoOutstandingExpectation();
            httpMock.verifyNoOutstandingRequest();
        });

    });

    describe('saving/validating campaigns', function () {

        var ctrl, scope, httpMock, userData;

        function validCampaignInfo( scope ) {
            scope.campaign.name = 'fred';

            var start = moment( '2012-10-13T15:13:00.000Z');
            var end = moment( '2012-10-20T15:13:00.000Z');

            scope.campaign.startDate = start.format("MM/DD/YYYY");
            scope.campaign.endDate = end.format("MM/DD/YYYY");;
        }

        beforeEach(inject(function ($controller, $rootScope, $routeParams, $httpBackend) {

            httpMock = $httpBackend;
            scope = $rootScope.$new();

            userData = makeUserData();

            httpMock.when('GET', '/api/MasterData').
                respond(masterData);

            httpMock.when('GET', '/api/UserData').
                respond(userData);


            // add campaign has no id in the route params, so clear it
            if ($routeParams.id) {
                $routeParams.id = null;
            }

            ctrl = $controller("EditCampaignCtrl", {
                $scope:scope
            });

            httpMock.flush();
        }));

        it('check for campaign initialization', function () {

            expect(scope.campaign).toBeDefined();
            expect(scope.campaign.name).toBe("");
            expect(scope.campaign.startDate).toBe("");
            expect(scope.campaign.endDate).toBe("");
            expect(scope.campaign.status).toBe("Active");
            expect(scope.campaign.type).toBe("Other");
            expect(scope.campaign.description).toBe("");
        });


        it('is not valid with nothing set', function () {
            expect(scope.validateCampaignDetails()).toBeTruthy();

            expect(scope.nameErrorMsg).toBeTruthy();
            expect(scope.startDateErrorMsg).toBeTruthy();
            expect(scope.endDateErrorMsg).toBeFalsy();
            expect(scope.dateRangeErrorMsg).toBeFalsy();
        });


        it('is not valid with name set', function () {
            scope.campaign.name = 'fred';

            expect(scope.validateCampaignDetails()).toBeTruthy();

            expect(scope.nameErrorMsg).toBeFalsy();
            expect(scope.startDateErrorMsg).toBeTruthy();
            expect(scope.endDateErrorMsg).toBeFalsy();
            expect(scope.dateRangeErrorMsg).toBeFalsy();
        });

        it('is not valid with start date set', function () {
            scope.campaign.startDate = new Date();

            expect(scope.validateCampaignDetails()).toBeTruthy();

            expect(scope.nameErrorMsg).toBeTruthy();
            expect(scope.startDateErrorMsg).toBeFalsy();
            expect(scope.endDateErrorMsg).toBeTruthy();
            expect(scope.dateRangeErrorMsg).toBeFalsy();
        });

        it('is not valid with end date set', function () {
            scope.campaign.endDate = new Date();

            expect(scope.validateCampaignDetails()).toBeTruthy();

            expect(scope.nameErrorMsg).toBeTruthy();
            expect(scope.startDateErrorMsg).toBeTruthy();
            expect(scope.endDateErrorMsg).toBeFalsy();
            expect(scope.dateRangeErrorMsg).toBeFalsy();
        });

        it('is valid with name and dates valid', function () {

            validCampaignInfo( scope );

            expect(scope.validateCampaignDetails()).toBeFalsy();

            expect(scope.nameErrorMsg).toBeFalsy();
            expect(scope.startDateErrorMsg).toBeFalsy();
            expect(scope.endDateErrorMsg).toBeFalsy();
            expect(scope.dateRangeErrorMsg).toBeFalsy();
        });

        it('is invalid with name and dates invalid', function () {

            scope.campaign.name = 'fred';
            var start = moment( new Date("October 13, 2012 11:13:00"));
            var end = moment( new Date("October 12, 2012 11:13:00"));


            scope.campaign.startDate = start;
            scope.campaign.endDate = end;

            expect(scope.validateCampaignDetails()).toBeTruthy();

            expect(scope.nameErrorMsg).toBeFalsy();
            expect(scope.startDateErrorMsg).toBeFalsy();
            expect(scope.endDateErrorMsg).toBeFalsy();
            expect(scope.dateRangeErrorMsg).toBeTruthy();

        });

        it('it saves', function () {
            validCampaignInfo( scope );

            httpMock.expectPOST('/api/SaveCampaign',
                scope.campaign).respond( {} );

            scope.saveCampaign();

            httpMock.flush();
        });


        it('it saves with 1 agent', function () {

            validCampaignInfo( scope );

            scope.allAgents[0].checked=true;
            httpMock.expectPOST('/api/SaveCampaign',
                scope.campaign).respond( {} );

            scope.saveCampaign();

            httpMock.flush();
        });

        it('it saves with more than one agent', function () {

            validCampaignInfo( scope );

            scope.allAgents[0].checked=true;
            scope.allAgents[1].checked=true;
            //  scope.campaign.order = scope.campaign.order+"."+newDateTime;
            httpMock.expectPOST('/api/SaveCampaign',
                scope.campaign).respond( {} );

            scope.saveCampaign();

            httpMock.flush();
        });

        afterEach(function () {
            httpMock.verifyNoOutstandingExpectation();
            httpMock.verifyNoOutstandingRequest();
        });

    });

    describe('copy existing campaigns', function () {

        var ctrl, scope, httpMock, userData;
        function validCampaignInfo( scope ) {
            //scope.campaign.name = 'First Campaign';

            var start = moment( '2013-03-21T15:13:00.000Z');
            var end = moment( '2014-10-20T15:13:00.000Z');

            scope.campaign.startDate = start;
            scope.campaign.endDate = end;
        }
        function getCurrentDate(){
            var now = new Date();
            var sec = (now.getSeconds()<=9)?"0"+now.getSeconds():now.getSeconds();
            var min = (now.getMinutes()<=9)?"0"+now.getMinutes():now.getMinutes();
            var hour = (now.getHours()<=9)?"0"+now.getHours():now.getHours();
            var nowDate = (now.getMonth()+1)+"/"+now.getDate()+"/"+now.getFullYear()+" "+hour+":"+min+":"+sec;
            return nowDate;
        }
        beforeEach(inject(function ($controller, $rootScope, $routeParams, $httpBackend) {
            httpMock = $httpBackend;
            scope = $rootScope.$new();
            var campaignsData = {CampaignsList: [
                {
                    "_id": "123",
                    "name": "First Campaign",
                    "startDate":"03/21/2013",
                    "endDate":"14/20/2014",
                    "status": "Active",
                    "type": "Retention Type 1",
                    "agents" : ["rjones", "akrier"],
                    "description": "we4t5erfgdrfyrftrfg",
                    "rules" : [{
                        "manualRule" : {
                            "annualkWh" : {
                                "gte" : 10000
                            }
                        },
                        "visualRule" : { }
                    }],
                    "order":1
                },
                {
                    "_id": "1234",
                    "name": "second Campaign",
                    "startDate":"2013-03-21T15:13:00.000Z",
                    "endDate":"2014-10-20T15:13:00.000Z",
                    "status": "Active",
                    "type": "Retention Type 1",
                    "agents" : ["rjones", "akrier"],
                    "description": "we4t5erfgdrfyrftrfg",
                    "rules" : [{
                        "manualRule" : {
                            "annualkWh" : {
                                "gte" : 10000
                            }
                        },
                        "visualRule" : { }
                    }],
                    "order":2
                },
                {
                    "_id": "12345",
                    "name": "third Campaign",
                    "startDate":"2013-03-21T15:13:00.000Z",
                    "endDate":"2014-10-20T15:13:00.000Z",
                    "status": "Active",
                    "type": "Retention Type 1",
                    "agents" : ["rjones", "akrier"],
                    "description": "we4t5erfgdrfyrftrfg",
                    "rules" : [{
                        "manualRule" : {
                            "annualkWh" : {
                                "gte" : 10000
                            }
                        },
                        "visualRule" : { }
                    }],
                    "order":3
                }
            ]};
            var makeCampaignData = function() {

                return {
                    "Campaign": [
                        {
                            "name": "one",
                            "startDate": "2013-02-19T05:00:00.000Z",
                            "endDate": "2013-04-01T04:00:00.000Z",
                            "status": "Active",
                            "type": "Retention Type 3",
                            "description": "Starts Feb 19, ends April 1, a few agents.",
                            "agents":["stoobari", "sinactive"],
                            "_id": "512ccab961b7547b02000001",
                            "rules" : {
                                "manualRule" : {
                                    "annualkWh" : {
                                        "gte" : 10000
                                    }
                                },
                                "visualRule" : { }
                            },
                            "order":9999999999
                        }
                    ]
                }

            };
            $routeParams.page = "copy";
            $routeParams.id = 1234;
            userData = makeUserData();

            httpMock.when('GET', '/api/MasterData').
                respond(masterData);

            httpMock.when('GET', '/api/UserData').
                respond(userData);

            httpMock.when('GET', '/api/getCampaignById/'+$routeParams.id).
                respond(  makeCampaignData() );

            httpMock.when('GET', '/api/listCampaigns').
                respond( campaignsData);

            // Initialize the id in the route parameters



            ctrl = $controller("EditCampaignCtrl", {
                $scope:scope

            });

            httpMock.flush();
        }));

        it('it saves with 1 agent', function () {

            //  var nowDate =   now.toString("yyyy-MM-dd");
            // var newCampName = scope.campaign.name.replace(new RegExp(" [0-9]{1,2}/[0-9]{1,2}/[0-9]{4} [0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2}", "g"),"");
            //scope.campaign.name = newCampName+" "+nowDate;

            validCampaignInfo( scope );

            httpMock.expectPOST('/api/SaveCampaignOrder',
                scope.activeCampsList).respond( {} );

            httpMock.expectPOST('/api/SaveCampaign',
                scope.campaign).respond( {} );

            scope.saveCampaign();

            httpMock.flush();
        });

        it('check for copied campaign name with current date time', function () {
            var nowDate = getCurrentDate();
            expect(scope.campaign.name).toBe("one "+nowDate);
        });

        it('check for copied campaign start date', function () {
            scope.campaign.startDate = new Date(moment(scope.campaign.endDate));
            var endDate = new Date(moment(scope.campaign.endDate));
            endDate.setDate(endDate.getDate()+1);
            expect(moment(scope.campaign.startDate).toDate().getDate()+1).toBe(endDate.getDate());
        });

        it('check for copied campaign end date', function () {
            scope.campaign.startDate = new Date(moment(scope.campaign.endDate));
            var endDate = new Date(moment(scope.campaign.endDate));
            endDate.setDate(endDate.getDate()+1);
            expect(moment(scope.campaign.startDate).toDate().getMonth()+1).toBe(endDate.getMonth()+1);
        });
        it('check for copied campaign order', function () {
            expect(scope.newCampOrder).toBe(2);
        });


        afterEach(function () {
            httpMock.verifyNoOutstandingExpectation();
            httpMock.verifyNoOutstandingRequest();
        });

    });

    describe('run campaign rues ', function () {

        var ctrl, scope, httpMock, userData;

        function validCampaignInfo( scope ) {
            scope.campaign.name = 'fred';

            var start = moment( '2012-10-13T15:13:00.000Z');
            var end = moment( '2012-10-20T15:13:00.000Z');

            scope.campaign.startDate = start;
            scope.campaign.endDate = end;
        }

        function validManualQueryInfo( scope ) {
            scope.ruleType ="manual";
            scope.manualRule = '{"annualkWh" : 3600}' ;
        }

        function validVisualQueryInfo( scope ) {
            scope.ruleType ="visual";
            scope.selectedCondition = "and";
            scope.finalFilters =
                [
                    {"field":{name:"Aggr KWH", value:"aggregatekWh", type:"Number"},
                        "operator":{"name":"<", "value":"lt", "type":"Number"},
                        "value":"123"},
                    {"field":{name:"Ann KWH", value:"annualkWh", type:"Number"}, "operator":{"name":">", "value":"gt", "type":"Number"}, "value":"234"},
                    {"field":{name:"Drop Status", value:"dropStatus", type:"SingleLookUp"}, "operator":{name:"Equals", value:"eq", type:"SingleLookUp"}, "value":"lost"},
                    {"field":{name:"State", value:"utilityState", type:"MultiLookup"}, "operator":{name:"In", value:"in", type:"MultiLookup"}, "value":["MD", "MA", "NJ", "NY"]},
                    {"field":{name:"Agent Name", value:"dropRep", type:"Text"}, "operator":{name:"Contains", value:"in", type:"Text"}, "value":"DAVID"}
                ];
        }
        beforeEach(inject(function ($controller, $rootScope, $routeParams, $httpBackend) {
            httpMock = $httpBackend;
            scope = $rootScope.$new();

            userData = makeUserData();

            httpMock.when('GET', '/api/MasterData').
                respond(masterData);

            httpMock.when('GET', '/api/UserData').
                respond(userData);

            ctrl = $controller("EditCampaignCtrl", {
                $scope:scope

            });

            httpMock.flush();
        }));

        it('run campaign manual rule ', function () {
            validManualQueryInfo( scope )

            httpMock.expectPOST('/api/getGenPopSummary',
                scope.rule).respond( data );

            scope.runRule();
            httpMock.flush();

            expect(scope.details).toBeDefined();
            expect(scope.summaryToDisplay).toBeDefined();
            expect(scope.summaryToDisplay.totalGenPopItems).toBe(7);
            expect(scope.summaryToDisplay.itemsAfterRule).toBe(1);
            expect(scope.summaryToDisplay.itemsPercentage).toBe(14.285714285714285);
            expect(scope.summaryToDisplay.totalAggregateKwh).toBe(117.437);
            expect(scope.summaryToDisplay.totalAnnualKwh).toBe(103.521);
            expect(scope.summaryToDisplay.totalAssociatedAccounts).toBe(3);
        });

        afterEach(function () {
            httpMock.verifyNoOutstandingExpectation();
            httpMock.verifyNoOutstandingRequest();
        });

        it('run campaign visual rule ', function () {
            validVisualQueryInfo( scope )

            httpMock.expectPOST('/api/getGenPopSummary',
                scope.rule).respond( data );

            scope.runRule();
            httpMock.flush();

            expect(scope.details).toBeDefined();
            expect(scope.summaryToDisplay).toBeDefined();
            expect(scope.summaryToDisplay.totalGenPopItems).toBe(7);
            expect(scope.summaryToDisplay.itemsAfterRule).toBe(1);
            expect(scope.summaryToDisplay.itemsPercentage).toBe(14.285714285714285);
            expect(scope.summaryToDisplay.totalAggregateKwh).toBe(117.437);
            expect(scope.summaryToDisplay.totalAnnualKwh).toBe(103.521);
            expect(scope.summaryToDisplay.totalAssociatedAccounts).toBe(3);
        });
    });

});

/* notes:

 Data from a test entry in the UI (2/26/13) into an empty Campaign collection (directo Mongo query from Mongo shell
 > db.Campaigns.find().pretty()
 {
 "name" : "Test with empty database",
 "startDate" : ISODate("2013-02-19T05:00:00Z"),
 "endDate" : ISODate("2013-04-01T04:00:00Z"),
 "status" : "Active",
 "type" : "Retention Type 3",
 "description" : "Starts Feb 19, ends April 1, a few agents.",
 "agents" : [
 "stoobari",
 "achen"
 ],
 "_id" : ObjectId("512ccab961b7547b02000001")
 }
 >

 data from the UI controller on the UI side of the wire
 /editCampaign/512ccab961b7547b02000001 controllers.js:1239
 api getcampaign by id success
 {
 "Campaign": [
 {
 "name": "Test with empty database",
 "startDate": "2013-02-19T05:00:00.000Z",
 "endDate": "2013-04-01T04:00:00.000Z",
 "status": "Active",
 "type": "Retention Type 3",
 "description": "Starts Feb 19, ends April 1, a few agents.",
 "agents": [
 "stoobari",
 "achen"
 ],
 "_id": "512ccab961b7547b02000001"
 }
 ]
 }
 controllers.js:994

 and with tedious inspection everything is a simple string as we expect for serialization
 /editCampaign/512ccab961b7547b02000001
 api getcampaign by id success {"Campaign":[{"name":"Test ...
 campaign 0 key name typeof is string
 campaign 0 key startDate typeof is string
 campaign 0 key endDate typeof is string
 campaign 0 key status typeof is string
 campaign 0 key type typeof is string
 campaign 0 key description typeof is string
 campaign 0 key agents typeof is object
 campaign 0 key _id typeof is string

 */