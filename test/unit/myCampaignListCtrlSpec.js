/**
 * Created with IntelliJ IDEA.
 * User: spoujula
 * Date: 18/3/13
 * Time: 5:41 PM
 * To change this template use File | Settings | File Templates.
 */

// Testing the agent dashboard page
describe('myCampaignListCtrlSpec.js :', function () {

    beforeEach(module("myApp"));

    var ctrl, scope, httpMock;


    var campaignId1 = "514372e53b7c623b08000003";
    var campaignId2 = "514372b33b7c623b08000001";

    var makeCampaignData = function () {
        return {CampaignsList:[
            {
                "_id":campaignId1,
                "name":"First Campaign",
                "status":"Active",
                "type":"Retention Type 1",
                "startDate":"2012-02-06T05:00:00.000Z",
                "endDate":"2014-08-17T07:06:40.000Z",
                "description":"we4t5erfgdrfyrftrfg",
                "order":0
            },
            {
                "_id":campaignId2,
                "name":"Second Campaign",
                "status":"Active",
                "type":"Retention Type 1",
                "startDate":"2012-01-06T05:00:00.000Z",
                "endDate":"2014-08-17T07:06:40.000Z",
                "description":"we4t5erfgdrfyrftrfg",
                "order":1
            }
        ]};

    };

    var emptyCampaignsList = {CampaignsList:[]};

    var makeUserData = function( userName ) {

        var user = userName || 'bcox';

        var data = {"id":4,
            "userName":user, "firstname":"Brian",
            "lastname":"Cox", "password":"jbond",
            "email":"bc@example.com", "role":"AGENT"};

        return data;
    }

    var initializeMocks = function (campaignData, userData, $controller, $rootScope, $httpBackend) {
        httpMock = $httpBackend;
        scope = $rootScope.$new();

        var getHold = "/api/getHoldBucketStatistics";
//        getHold +=  '?role=AGENT';

        httpMock.when('GET', '/api/user/').
            respond(userData);

        httpMock.when('GET', '/api/listCampaignsByAgent').
            respond(campaignData);

        httpMock.when('GET', getHold).
            respond({
                "agentHoldWorkItems":2,
                "attentionRequiredItems":1
            });


        ctrl = $controller("myCampaignListCtrl", {
            $scope:scope
        });

        httpMock.flush();
    };

    describe("load empty dashboard for agent", function () {
        beforeEach(inject(function ($controller, $rootScope, $httpBackend) {
            initializeMocks(emptyCampaignsList, makeUserData(), $controller, $rootScope, $httpBackend);
        }));

        it('check for totalHoldWorkItems', function() {
            expect(scope.totalHoldWorkItems).toBeDefined();
            expect( scope.totalHoldWorkItems ).toBe( 2 );
        });

        it('check for attentionRequiredItems', function() {
            expect(scope.attentionRequiredItems).toBeDefined();
            expect( scope.attentionRequiredItems ).toBe( 1 );
        });

        it('check for all campaigns ', function () {

            expect(scope.campaignsList).toBeDefined();
            expect(scope.campaignsList.length).toBe(0);
        });

        afterEach(function () {
            httpMock.verifyNoOutstandingExpectation();
            httpMock.verifyNoOutstandingRequest();
        });
    });

    describe("load agent dashboard with active campaigns", function () {
        beforeEach(inject(function ($controller, $rootScope, $httpBackend) {
            initializeMocks(makeCampaignData(), makeUserData(),$controller, $rootScope, $httpBackend);
        }));


        it('check for all campaigns ', function () {

            expect(scope.campaignsList).toBeDefined();
            expect(scope.campaignsList.length).toBe(2);
        });

        it('check for active  campaigns ', function () {

            expect(scope.activeCampaignsList).toBeDefined();
            expect(scope.activeCampaignsList.length).toBe(2);
        });

        afterEach(function () {
            httpMock.verifyNoOutstandingExpectation();
            httpMock.verifyNoOutstandingRequest();
        });
    });

    //ACME-158 load campaigns with annualkwh calculations
    describe("load agent dashboard assigned to campaigns with work items", function () {
        beforeEach(inject(function ($controller, $rootScope, $httpBackend) {
            initializeMocks(makeCampaignData(), makeUserData(),$controller, $rootScope, $httpBackend);
        }));

        it('check for campaign names', function () {

            expect(scope.activeCampaignsList).toBeDefined();
            expect(scope.activeCampaignsList.length).toBe(2);

            expect(scope.activeCampaignsList[0].name).toBe("First Campaign");

            expect(scope.activeCampaignsList[1].name).toBe("Second Campaign");

        });


        afterEach(function () {
            httpMock.verifyNoOutstandingExpectation();
            httpMock.verifyNoOutstandingRequest();
        });
    });


    // ACME-381, update server calculations
    describe("finish server summary (agent)", function () {


        beforeEach(inject(function ($controller, $rootScope, $httpBackend) {

            var campaignData = makeCampaignData();
            var userData = makeUserData( 'mcarpenter' );

            var agentSummary = [
                    {
                        "category":"Contacted",
                        "order":4,
                        "agent":"akulkarni.lh"
                    },
                    {
                        "category":"Contacted",
                        "order":4,
                        "agent":"mcarpenter"
                    },
                    {
                        "category":"Saved",
                        "order":1,
                        "agent":"akulkarni.lh"
                    },
                    {
                        "category":"Saved",
                        "order":1,
                        "workItems":15,
                        "kWh":3002.1,
                        "associatedAccounts":76,
                        "associatedAccountskWh":301393.7,
                        "agent":"mcarpenter"
                    },
                    {
                        "category":"Total",
                        "order":6,
                        "workItems":41,
                        "kWh":12958.1,
                        "associatedAccounts":236,
                        "associatedAccountskWh":1928787.7,
                        "agent":"mcarpenter"
                    },
                    {
                        "category":"Not Contacted",
                        "order":3,
                        "workItems":22,
                        "kWh":8592,
                        "associatedAccounts":147,
                        "associatedAccountskWh":1498659,
                        "agent":"mcarpenter"
                    },
                    {
                        "category":"Lost",
                        "order":2,
                        "agent":"mcarpenter"
                    },
                    {
                        "category":"Not Contacted",
                        "order":3,
                        "agent":"akulkarni.lh"
                    },
                    {
                        "category":"Total",
                        "order":6,
                        "agent":"akulkarni.lh"
                    }
                ];

            campaignData.CampaignsList[0].agentSummary = agentSummary;

            initializeMocks(campaignData, userData, $controller, $rootScope, $httpBackend);
        }));

        function getSavedCategory() {
            var campaign0 = getFirstCampaign();
            var saved = campaign0.summary[0];
            expect(saved.category).toBe("Saved");
            return saved;
        }

        function getFirstCampaign() {
            var campaign0 = scope.activeCampaignsList[0];
            //  have right campaign:
            expect(campaign0).toBeDefined();
            expect(campaign0.name).toBe("First Campaign");
            return campaign0;
        }

        it('check for summary data presence', function () {
            var campaign0 = getFirstCampaign();
            expect(campaign0.summary).toBeDefined()
            expect(campaign0.summary.length).toBe(6);
        });

        it('check for summary data order', function () {
            var campaign0 = getFirstCampaign();
            expect(campaign0.summary[0].order).toBe(1);
            expect(campaign0.summary[4].order).toBe(5);
        });

        it('check for Saved workItems', function () {
            var saved = getSavedCategory();
            expect( saved.workItems).toBe( 15 );
            expect( saved.workItemsPercentage).toBe( 100 * 15/41 );
        });

        it('check for Saved kWh', function () {
            var saved = getSavedCategory();
            expect( saved.kWh).toBe( 3002.1 );
            expect( saved.kWhPercentage).toBe( 100 * 3002.1/12958.1 );
        });

        it('check for Saved associatedAccounts', function () {
            var saved = getSavedCategory();
            expect( saved.associatedAccounts).toBe( 76 );
            expect( saved.associatedAccountsPercentage).toBe( 100 * 76/236 );
        });

        it('check for Saved associatedAccountskWh', function () {
            var saved = getSavedCategory();
            expect( saved.associatedAccountskWh).toBe( 301393.7 );
            expect( saved.associatedAccountskWhPercentage).toBe( 100 * 301393.7/1928787.7 );
        });


        it('check for Total category', function () {
            var campaign0 = getFirstCampaign();
            var total = campaign0.summary[4];
            expect( total.category).toBe( "Other" );
        });

        it('check for Total workItems', function () {
            var campaign0 = getFirstCampaign();
            var total = campaign0.summary[4];

            expect( total.workItems).toBe( 0 );
            expect( total.workItemsPercentage).toBe( 0  );
        });

        it('check for Total kWh', function () {
            var campaign0 = getFirstCampaign();
            var total = campaign0.summary[4];
            expect( total.kWh).toBe( 0 );
            expect( total.kWhPercentage).toBe( 0  );
        });

        it('check for Total associatedAccounts', function () {
            var campaign0 = getFirstCampaign();
            var total = campaign0.summary[4];
            expect( total.associatedAccounts).toBe(0);
            expect( total.associatedAccountsPercentage).toBeCloseTo(
                0 );
        });

        it('check for Total associatedAccountskWh', function () {
            var campaign0 = getFirstCampaign();
            var total = campaign0.summary[4];
            expect( total.associatedAccountskWh).toBe( 0  );
            expect( total.associatedAccountskWhPercentage).toBeCloseTo(
                0 );
        });


        afterEach(function () {
            httpMock.verifyNoOutstandingExpectation();
            httpMock.verifyNoOutstandingRequest();

        });
    });


});