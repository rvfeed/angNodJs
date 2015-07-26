/**
 * Created with JetBrains WebStorm.
 * User: rboddu
 * Date: 5/21/13
 * Time: 5:22 AM
 * To change this template use File | Settings | File Templates.
 */
describe('logsControllerSpec.js: ', function() {


    beforeEach(module('myApp'));

    var ctrl, scope, httpMock, logsData;

    beforeEach(inject(function($controller, $rootScope, $httpBackend) {

        // Save injected mock services for later
        httpMock = $httpBackend;
        scope = $rootScope.$new();

       logsData = { QueueLogData:[{
               "_id" : 1,
               "Success" : true,
               "RemovePendingAgentItem" : true,
               "PendingAgentUsername" : "acmetestwb",
               "Info" : "Account successfully assigned to ACME Testwb",
               "eventId" : 6107005,
               "dropOriginSystem" : 2,
               "energyPlusID" : 332289,
               "insertUser" : "ACME_DEV_API",
               "insertDate" : "2013-05-17T21:50:07.817Z"
           },
           {
               "_id" : 2,
               "Success" : true,
               "RemovePendingAgentItem" : true,
               "PendingAgentUsername" : "dcarder",
               "Info" : "Account successfully assigned to Dave Carder",
               "eventId" : 6084501,
               "dropOriginSystem" : 2,
               "energyPlusID" : 264267,
               "insertUser" : "ACME_DEV_API",
               "insertDate" : "2013-05-17T21:50:07.817Z"
           },
           {
               "_id" : 3,
               "Success" : true,
               "RemovePendingAgentItem" : true,
               "PendingAgentUsername" : "acmetestwb",
               "Info" : "Account successfully assigned to ACME Testwb",
               "eventId" : 5410333,
               "dropOriginSystem" : 2,
               "energyPlusID" : 263468,
               "insertUser" : "ACME_DEV_API",
               "insertDate" : "2013-05-17T21:50:07.88Z"
           },
           {
               "_id" : 4,
               "Success" : true,
               "RemovePendingAgentItem" : true,
               "PendingAgentUsername" : "bcox",
               "Info" : "Account successfully assigned to Brian Cox",
               "eventId" : 5468645,
               "dropOriginSystem" : 2,
               "energyPlusID" : 229329,
               "insertUser" : "ACME_DEV_API",
               "insertDate" : "2013-05-17T21:50:07.88Z"
           }]
       };
           var getQueueLog = "/api/getQueueLog/?direction=desc&limit=100&sort=insertDate"
        httpMock.when('GET', getQueueLog).
            respond(logsData);

        ctrl = $controller("logsCtrl", {
            $scope: scope
        });

        httpMock.flush();
    }));

    it('QueueLogItemsCount ', function() {
        expect(scope.QueueLogItemsCount).toBeDefined( );
        expect(scope.QueueLogItemsCount).toBe( 4 );
    });




    afterEach(function() {
        httpMock.verifyNoOutstandingExpectation();
        httpMock.verifyNoOutstandingRequest();
    });

});
