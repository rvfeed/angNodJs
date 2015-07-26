/**
 * Created with IntelliJ IDEA.
 * User: spoujula
 * Date: 14/3/13
 * Time: 3:57 PM
 * To change this template use File | Settings | File Templates.
 */



// setMenuLinks TestCases

describe('setMenuLinks', function() {
    var scope,httpMock;
    beforeEach(inject(function($rootScope, $controller,$httpBackend) {
        httpMock = $httpBackend;
        scope = $rootScope.$new();
        var ctrl = $controller("setMenuLinks",
            {
                $scope: scope


            });
        scope.User = {
            "admin": [
                {
                    "name": "home",
                    "url": "/#/home",
                    "navUrl": "home"
                },
                {
                    "name": "Reports",
                    "url": "/#/reports",
                    "navUrl": "reports"
                },
                {
                    "name": "Gen-Pop",
                    "url": "/#/genpop",
                    "navUrl": "genpop"
                },
                {
                    "name": "Agents",
                    "url": "/#/agents",
                    "navUrl": "agents"
                },
                {
                    "name": "Campaigns",
                    "url": "/#/listCampaigns",
                    "navUrl": "campaign"
                }
            ],
            "agents": [
                {
                    "name": "home",
                    "url": "/#/home",
                    "navUrl": "home"
                },
                {
                    "name": "Hold Bucket",
                    "url": "/#/holdbucket",
                    "navUrl": "holdbucket"
                },
                {
                    "name": "Campaigns",
                    "url": "/#/myCampaigns",
                    "navUrl": "campaign"
                }

            ]
        }


    }));

    it("Check the User admin data Data   ", function(){

        expect(scope.User.admin).toBeDefined();
        expect(scope.User.admin[0].name).toBe("home");
        expect(scope.User.admin[0].url).toBe("/#/home");
        expect(scope.User.admin[0].navUrl).toBe("home");



    });

    it("Check the User agent data Data   ", function(){

        expect(scope.User.agents).toBeDefined();
        expect(scope.User.agents[0].name).toBe("home");
        expect(scope.User.agents[0].url).toBe("/#/home");
        expect(scope.User.agents[0].navUrl).toBe("home");



    });


});

