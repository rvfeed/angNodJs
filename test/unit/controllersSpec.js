describe('controllerSpec.js: ', function() {



    beforeEach(module('myApp'));

    var ctrl, scope, httpMock, genPopData, masterData, userData, campaignData;

    beforeEach(inject(function($controller, $rootScope, $httpBackend) {

        // Save injected mock services for later
        httpMock = $httpBackend;
        scope = $rootScope.$new();

        var campaignId = "aaabbbccccddd";

        // TODO: refactor common mock data and calls setup
        campaignData = {CampaignsList:[
            {
                "_id":campaignId,
                "name":"First Campaign",
                "status":"Active",
                "type":"Retention Type 1",
                "description":"we4t5erfgdrfyrftrfg"}
        ]};


        genPopData = {GenPopData: [{ accountNumber : "10089010238026547000",
            aggregatekWh : 85231002,
            annualkWh : 45152521,
            cashbackBalance : 1236,
            contactName : "DAVID",
            dropStatus : "Canceled",
            utilityState : "TX",
            utilityAbbr : "CONED"} ]} ;

        masterData = {
            MasterData: [
                {
                    "key": "Utilities",
                    "value": [
                        {
                            "state": "NY",
                            "commodity": "Electric",
                            "unitAbbrev": "kWh",
                            "distributorName": "Consolidated Edison",
                            "utilityAbbrev": "CONED",
                            "utility": "Consolidated Edison",
                            "utilityCode": "01",
                            "utilityID": 1
                        }
                    ]
                },
                {
                    "key": "DropStatuses",
                    "value": [
                        {
                            "statusName": "Called",
                            "statusID": 73
                        }
                    ]
                },
                {
                    "key": "States",
                    "value": [
                        {
                            "abbrev": "AL",
                            "stateName": "Alabama",
                            "stateID": 1
                        }
                    ]
                },
                {
                    "key": "Partners",
                    "value": [
                        {
                            "website": "",
                            "acronym": "",
                            "partnerCode": "AAL",
                            "partnerName": "American Airlines",
                            "partnerType": "Co-Branded",
                            "partnerID": 1
                        }
                    ]
                },
                {
                    "key": "CampaignTypes",
                    "value": [
                        "Retention Type 1",
                        "Retention Type 2",
                        "Retention Type 3",
                        "Other"
                    ]
                }
            ]
        };;

        userData = {
            UserData: [
                {
                    configuration: [
                        {
                            "pageID": "/campaign1",
                            "filters": {
                                "aggregatekWh": [
                                    null,
                                    "8523200"
                                ],
                                "annualkWh": [

                                ],
                                "cashbackBalance": [

                                ],
                                "monthsUntilCashAward": [

                                ],
                                "serviceEndDate": [
                                    null,
                                    "13-10-2011"
                                ],
                                "monthsActive": [

                                ],
                                "monthsSinceDropped": [

                                ],
                                "pricing": [

                                ],
                                "dropStatus": "",
                                "dropStatusDate": [

                                ],
                                "utilityState": [

                                ],
                                "dropType": [

                                ],
                                "accountNumber": "",
                                "partner": [

                                ],
                                "contactName": ""
                            },
                            "pageSort": "",
                            "numOfItemsPerPage": 6
                        }
                    ]
                }
            ]
        };

        httpMock.when('GET', '/api/UserData').
            respond(userData);
        httpMock.when('GET', '/api/listCampaigns').
            respond(campaignData);
        httpMock.when('GET', '/api/user/').
            respond(userData);
        httpMock.when('GET', '/api/MasterData').
            respond(masterData);
        httpMock.when('GET', '/api/SavedFiltersData').
            respond(userData);
        httpMock.when('GET', '/api/getFilterRecordCount').
            respond({ count:100 });

        httpMock.when('GET', '/api/getWorkItems?direction=desc&limit=25&offset=0&sort=dropStatusDate').
            respond(genPopData);

        ctrl = $controller("GenPopCtrl", {
            $scope: scope
        });

        httpMock.flush();
    }));

    it('loads gen pop data ', function() {
        expect(scope.displayItems).toBeDefined( );
        expect(scope.displayItems.length).toBeDefined( );
        expect(scope.displayItems.length).toBe( 1 );
    });

    it('check for accountNumber of the response ', function() {
        expect(scope.displayItems[0].accountNumber).toEqual('10089010238026547000');
    });

    it('check for aggregatekWh of the response ', function() {
        expect(scope.displayItems[0].aggregatekWh).toEqual(85231002);
    });

    it('check for annualkWh of the response ', function() {
        expect(scope.displayItems[0].annualkWh).toMatch(4515252);
    });

    it('check for cashbackBalance of the response ', function() {
        expect(scope.displayItems[0].cashbackBalance).toMatch(1236);
    });

    it('check for contactName of the response ', function() {
        expect(scope.displayItems[0].contactName).toMatch("DAVID");
    });

    it('check for utilityState of the response ', function() {
        expect(scope.displayItems[0].utilityState).toMatch("TX");
    });

    it('check for utilityAbbr of the response ', function() {
        expect(scope.displayItems[0].utilityAbbr).toMatch("CONED");
    });

    it('check for the MasterData length of the response', function() {
        expect(scope.MasterData.length).toBe(5);
    });

    it('check for the MasterData Status Name of the response', function() {

        expect(scope. MasterData[1].value[0].statusName).toBe("Called");
    });


    it( "validates good dates", function() {
        var early = moment( "2012-11-25T05:00:00.000Z" );
        var late = moment( "2012-11-26T05:00:00.000Z");

        expect( scope.validateDates( early, late )).toBeFalsy();
    });

    it( "validates no mindate", function() {
        var late = moment( "2012-11-26T05:00:00.000Z");

        expect( scope.validateDates( null, late )).toBeFalsy();
    });

    it( "validates no maxdate", function() {
        var early = moment( "2012-11-26T05:00:00.000Z");

        expect( scope.validateDates( early, null )).toBeFalsy();
    });


    it( "invalidates bad dates", function() {
        var early = moment( "2012-11-25T05:00:00.000Z" );
        var late = moment( "2012-11-26T05:00:00.000Z");

        expect( scope.validateDates(late, early )).toBeTruthy();
    });


    it( "invalidates bad pricing", function() {
        scope.filters.pricing[0] = "0.9";
        scope.filters.pricing[1] = "0.1";

        expect( scope.validateFilterDetails()).toBeTruthy();

        expect( scope.pricingErrorMessage).toBeTruthy();

    });


    afterEach(function() {
        httpMock.verifyNoOutstandingExpectation();
        httpMock.verifyNoOutstandingRequest();
    });

});
