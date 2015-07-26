// Testacular configuration
// Generated on Mon Dec 10 2012 09:45:48 GMT+0530 (India Standard Time)


// base path, that will be used to resolve files and exclude
// basePath = '..\..\..\..\..\..\..\..\..\..';

basePath = '..';

// list of files / patterns to load in the browser


files = [
    JASMINE,
    JASMINE_ADAPTER,
    'lib/angularloader/angular.js',
    'lib/angularloader/angular-*.js',
    'lib/angular/angular-mocks.js',

    '../app//js/lib/angular/angular-resource.js',
    '../app/js/filters.js', // filters module def.
    '../app/js/directives.js', // directives module def.
    '../app/js/services.js', // services module def.
    '../app/js/lib/jquery/jquery-1.8.3.min.js',
    '../app/js/lib/jquery/jquery.js',
    '../app/js/lib/ng-grid/ng-grid-2.0.6a.debug.js',
    '../app/js/lib/ng-grid/plugins/ng-grid-flexible-height.js',
    '../app/js/lib/bootstrap/bootstrap.js',
    '../app/js/lib/bootstrap/bootstrap.min.js',
    '../app/js/lib/bootstrap/bootstrap-datepicker.js',
    '../app/js/lib/moment/moment.min.js',

    '../app/js/app.js',

    '../app/js/controllers/controller-helper.js',
    '../app/js/controllers/rulesEngine-helper.js',
    '../app/js/controllers/campaignsListController.js',
    '../app/js/controllers/cookieController.js',
    '../app/js/controllers/editCampaignController.js',
    '../app/js/controllers/genPopController.js',
    '../app/js/controllers/homeController.js',
    '../app/js/controllers/indexController.js',
    '../app/js/controllers/menuLinksController.js',
    '../app/js/controllers/myCampaignListController.js',
    '../app/js/controllers/logsController.js',
    '../app/js/controllers/agentsController.js',


//    '../app/js/controllers.js',  // controllers for angularjs
    '../app/js/lib/jquery/jquery-ui-1.10.1.js',
    'unit/*.js' // All controller test files

//    'unit/controllersSpec.js', // older controller test (GenPop, primarily)
//    'unit/genPopControllerSpec.js', // GenPop controller tests, primarily)
//    'unit/editControllerSpec.js', // Edit Controller tests
//    'unit/listControllerSpec.js', // Edit Controller tests
//    'unit/filterSpec.js' // new file to test filter code.
];


// list of files to exclude
exclude = [
    //commented out because of datePicker dependency on these files
'unit/logoutController.js','unit/menuLinksController.js','unit/unAuthorizedController.js'
];


// test results reporter to use
// possible values: 'dots', 'progress', 'junit'
reporters = ['dots', 'junit'];
junitReporter = {
outputFile: 'test-results.xml'
};

// web server port
port = 9090;


// cli runner port
runnerPort = 9100;


// enable / disable colors in the output (reporters and logs)
colors = true;


// level of logging
// possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
logLevel = LOG_INFO;


// enable / disable watching file and executing tests whenever any file changes
autoWatch = true;


// Start these browsers, currently available:
// - Chrome
// - ChromeCanary
// - Firefox
// - Opera
// - Safari (only Mac)
// - PhantomJS
// - IE (only Windows)
browsers = [];


// If browser does not capture in given timeout [ms], kill it
captureTimeout =1005000;


// Continuous Integration mode
// if true, it capture browsers, run tests and exit
singleRun = true;
