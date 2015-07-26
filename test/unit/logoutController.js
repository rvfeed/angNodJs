/**
 * Created with IntelliJ IDEA.
 * User: spoujula
 * Date: 14/3/13
 * Time: 4:32 PM
 * To change this template use File | Settings | File Templates.
 */



// LogoutCtrl TestCase
describe('LogoutCtrl', function() {
    var scope;
    beforeEach(inject(function($rootScope, $controller,$httpBackend) {
        httpMock = $httpBackend;
        scope = $rootScope.$new();
        var ctrl = $controller("LogoutCtrl",
            {$scope: scope
            }
        );
        scope.User = {"name" : ""};
        scope.Path ={"logoutpath" : "/logout" };

    }));

    it("Check the User Data to be clear   ", function(){

        expect(scope.User.name).toBeDefined();
        expect(scope.User.name).toBe("");
    });

    it("Check the Logout page", function(){
        expect(scope.Path.logoutpath).toBe("/logout");
    });


    afterEach(function() {
        httpMock.verifyNoOutstandingExpectation();
        httpMock.verifyNoOutstandingRequest();
    });
});

