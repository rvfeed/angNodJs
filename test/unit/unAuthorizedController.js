/**
 * Created with IntelliJ IDEA.
 * User: spoujula
 * Date: 14/3/13
 * Time: 4:32 PM
 * To change this template use File | Settings | File Templates.
 */


//unAuthorized TestCase.
describe('unAuthorized', function() {
    var scope,httpMock;
    beforeEach(inject(function($rootScope, $controller,$httpBackend) {
        httpMock = $httpBackend;
        scope = $rootScope.$new();
        var ctrl = $controller("unAuthorized",
            {
                $scope: scope
            });
        scope.cookieValue = {"name" : "undefined","name1" :"agent"};
        scope.Path ={"path1" :"/" , "path2" : "/unauthorized" };


    }));

    it("Check the undefined path in unAuthorized   ", function(){
        expect(scope.cookieValue.name).toBeDefined();
        expect(scope.cookieValue.name).toBe("undefined");
        expect(scope.Path.path1).toBe("/");


    });

    it("Check the admin path in unAuthorized   ", function(){

        expect(scope.cookieValue.name1).toBeDefined();
        expect(scope.cookieValue.name1).toBe("agent");

        expect(scope.Path.path2).toBe("/unauthorized");


    });

    afterEach(function() {
        httpMock.verifyNoOutstandingExpectation();
        httpMock.verifyNoOutstandingRequest();
    });
});
