// Test spec for the list campaign controller (choosing as a simple controller to
// develop the test framework).
// Mikey Reppy 2013-02-12

describe('listControllerSpec:', function () {

    beforeEach(module("myApp"));

    var ctrl, scope, httpMock;


    var campaignId1 = "5114d7c22a3c89b871000003";
    var campaignId2 = "51156157a11b5e0000000001";

    var emptyDetails ={Details:  [{"campaigns":[]},{"dropStatus":[]},{"agent":[]}] };

    var makeCampaignData = function () {

        var campaignData = {
            "CampaignsList": [
                {
                    "_id": campaignId1,
                    "name": "First Campaign",
                    "status": "Active",
                    "type": "Retention Type 1",
                    "startDate": "2012-02-06T05:00:00.000Z",
                    "endDate": "2014-08-17T07:06:40.000Z",
                    "description": "we4t5erfgdrfyrftrfg",
                    "order": 2.1234,
                    "agents": [
                        {
                            "name": "bcox",
                            "fullName": "Brian Cox"
                        }
                    ]
                },
                {
                    "_id": campaignId2,
                    "name": "Second Campaign",
                    "status": "Active",
                    "type": "Retention Type 1",
                    "startDate": "2012-01-06T05:00:00.000Z",
                    "endDate": "2014-08-17T07:06:40.000Z",
                    "description": "we4t5erfgdrfyrftrfg",
                    "order": 2.123
                }
            ]
        };

        return campaignData;
    };

    var emptyWorkItemList = { GenPopData:[] };

    var initializeMocks = function (campaignData, $controller, $rootScope, $httpBackend) {
        httpMock = $httpBackend;
        scope = $rootScope.$new();

        httpMock.when('GET', '/api/listCampaigns').
            respond(campaignData);

        ctrl = $controller("CampaignListCtrl", {
            $scope:scope
        });

        httpMock.flush();
    };

    describe("load campaigns with no work items", function () {
        beforeEach(inject(function ($controller, $rootScope, $httpBackend) {
            initializeMocks(makeCampaignData(), $controller, $rootScope, $httpBackend);
        }));


        it( "should reset loading flag", function () {
            expect( scope.loadingFlag).toBeDefined();
            expect( scope.loadingFlag).toBeFalsy();
        });

        it('check for all campaigns ', function () {

            expect(scope.activeCampaignsList).toBeDefined();
            expect(scope.activeCampaignsList.length).toBe(2);
        });

        it('check for active  campaigns ', function () {

            expect(scope.activeCampaignsList).toBeDefined();
            expect(scope.activeCampaignsList.length).toBe(2);
        });

        it('check for work items ', function () {

            expect(scope.activeCampaignsList[0].workItemsExists).toBeFalsy;
            expect(scope.activeCampaignsList[1].workItemsExists).toBeFalsy;
        });


        afterEach(function () {
            httpMock.verifyNoOutstandingExpectation();
            httpMock.verifyNoOutstandingRequest();
        });
    });


    //ACME-158 load campaigns with annualkwh calculations
    describe("load campaigns with work items", function () {
        beforeEach(inject(function ($controller, $rootScope, $httpBackend) {
            initializeMocks(makeCampaignData(), $controller, $rootScope, $httpBackend);
        }));


        it('check the toBeCloseTo matcher', function () {

            var a = 2;
            var b = 2.133543;
            var c = 3;

            expect( a).toBeCloseTo( b, 0 ); // does match within 0 decimal points
            expect( a).not.toBeCloseTo( c, 0 ); // does not match within 0 decimal points
            expect( a).not.toBeCloseTo( b, 1 ); // does not match to 10ths decimal point

        });

        afterEach(function () {
            httpMock.verifyNoOutstandingExpectation();
            httpMock.verifyNoOutstandingRequest();
        });
    });

    //ACME-159 load campaigns with agents
    describe(" load campaigns with agents  ", function () {
        beforeEach(inject(function ($controller, $rootScope, $httpBackend) {
            initializeMocks(makeCampaignData(), $controller, $rootScope, $httpBackend);
        }));



//        it('save new campaign order ', function () {
//            scope.activeCampaignsList[0].reorder = true;
//            httpMock.expectPOST('/api/SaveCampaignOrder',
//                scope.activeCampaignsList).respond( {} );
//            scope.$apply(scope.activeCampaignsList);
//            httpMock.flush();
//        });
        afterEach(function () {
            httpMock.verifyNoOutstandingExpectation();
            httpMock.verifyNoOutstandingRequest();
        });
    });


    // ACME-381, update server calculations
    describe("finish server summary (admin)", function () {


        beforeEach(inject(function ($controller, $rootScope, $httpBackend) {

            var campaignData = makeCampaignData();

            campaignData.CampaignsList[0].adminSummary =
                [
                    {
                        "category":"Saved",
                        "order":1,
                        "workItems":8,
                        "kWh":188,
                        "associatedAccounts":38,
                        "associatedAccountskWh":213679
                    },
                    {
                        "category":"Lost",
                        "order":2,
                        "workItems":3,
                        "kWh":0,
                        "associatedAccounts":5,
                        "associatedAccountskWh":40820.4
                    },
                    {
                        "category":"Total",
                        "order":6,
                        "workItems":444,
                        "kWh":9466.060000000001,
                        "associatedAccounts":1659,
                        "associatedAccountskWh":12083780.839999998
                    },
                    {
                        "category":"Contacted",
                        "order":4,
                        "workItems":5,
                        "kWh":0,
                        "associatedAccounts":5,
                        "associatedAccountskWh":0
                    },
                    {
                        "category":"Not Contacted",
                        "order":3,
                        "workItems":408,
                        "kWh":8720.46,
                        "associatedAccounts":1464,
                        "associatedAccountskWh":9571148.839999998
                    }
                ];

            initializeMocks(campaignData, $controller, $rootScope, $httpBackend);
        }));

        function getFirstCampaign() {
            var campaign0 = scope.activeCampaignsList[0];
            //  have right campaign:
            expect(campaign0).toBeDefined();
            expect(campaign0.name).toBe("First Campaign");
            return campaign0;
        }

        it( 'check for workItemsExist (delete flag)', function() {
            expect( scope.activeCampaignsList[1].workItemsExists).toBeFalsy();
            expect( scope.activeCampaignsList[0].workItemsExists).toBeTruthy();
        } );

        it('check for summary data presence', function () {
            var campaign0 = getFirstCampaign();
            expect( campaign0.summary).toBeDefined()
            expect( campaign0.summary.length).toBe(6);
        });

        it('check for summary data order', function () {
            var campaign0 = getFirstCampaign();
            expect(campaign0.summary[0].order).toBe(1);
            expect(campaign0.summary[4].order).toBe(5);
        });

        it('check for total percentages', function () {
            var campaign0 = getFirstCampaign();
            expect(campaign0.summary[4].category).toBe("Other");

            expect(campaign0.summary[4].workItemsPercentage).toBe(0);
            expect(campaign0.summary[4].kWhPercentage).toBe(0);
            expect(campaign0.summary[4].associatedAccountsPercentage).toBe(0);
            expect(campaign0.summary[4].associatedAccountskWhPercentage).toBe(0);

        });


        it('check for Saved', function () {
            var campaign0 = getFirstCampaign();
            var saved = campaign0.summary[0];
            expect( JSON.stringify( saved )).toMatch(
                '{"category":"Saved","order":1,' +
                    '"workItems":8,"kWh":188,' +
                    '"associatedAccounts":38,' +
                    '"associatedAccountskWh":213679,' +
                    '"workItemsPercentage":1.8018018018018018,' +
                    '"kWhPercentage":1.986042767529468,' +
                    '"associatedAccountsPercentage":2.2905364677516578,' +
                    '"associatedAccountskWhPercentage":1.7683124415222349}');
        });



        afterEach(function () {
            httpMock.verifyNoOutstandingExpectation();
            httpMock.verifyNoOutstandingRequest();
        });
    });


});