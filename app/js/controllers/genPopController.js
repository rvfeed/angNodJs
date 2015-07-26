/**
 * Created with IntelliJ IDEA.
 * User: spoujula
 * Date: 1/5/13
 * Time: 11:24 AM
 * To change this template use File | Settings | File Templates.
 */

/**
 *
 * @param $scope
 * @param $http
 * @param $filter
 * @param $routeParams
 * @param $window
 * @param $domUtilityService
 * @param informerService
 * @param htmlOutService
 * @constructor
 */
function GenPopCtrl($scope, $http, $filter, $routeParams, $window, $domUtilityService, informerService, htmlOutService) {

    //get current logged in user
    getUser($http, $scope);

    $scope.loadingFlag = true;
    $scope.loadingStatus = "starting";
    $scope.HoldReasonType = "";
    console.log("GenPopCtrl: hello @ " + moment().format());

    if ($routeParams.id != null) {
        $scope.showWorkItemsText = true;
        $scope.showGenPopText = false;

    }
    else {
        $scope.showWorkItemsText = false;
        if ($routeParams.hold == "hold")
            $scope.showHoldText = true;
        else
            $scope.showGenPopText = true;
    }

    $scope.filters = getEmptyFilters();

    /**
     *  save grid configuration details  in userdata collection
     *
     * @param callback
     */

    $scope.saveGridConfiguration = function (callback) {
        console.log("saveGridConfiguration @ " + moment().format());

        if ($scope.activeUserData.configuration.grid && $scope.activeUserData.configuration.grid[0]) {
            $scope.activeUserData.configuration.grid[0].gridColumnDefs = [];

            angular.forEach($scope.gridColumnDefs, function (column) {
                if (column.save) {
                    $scope.activeUserData.configuration.grid[0].gridColumnDefs.push(
                        {
                            save: true,
                            field: column.field,
                            width: column.width,
                            visible: column.visible
                        })
                }
            });
        }

        console.log("SaveGridConfiguration: post data is : " +
            JSON.stringify($scope.activeUserData.configuration.grid));

        $http.post('/api/SaveGridConfiguration', $scope.activeUserData.configuration.grid)
            .success(function (data) {
                console.log("success!  data is: " + JSON.stringify(data));

                if (callback) {
                    console.log("saveGridConfiguration invoking callback");
                    callback();
                }
            })
            .error(function (error) {
                console.log("error with SaveGridConfiguration call: " + error);
                informerService.inform("error saving grid.");
            });
    };

    $scope.checkPageSizeOfGrid = function () {
        console.log("pagingOptions.pageSize watch trigger @ " + moment().format());

        if ($scope.pagingOptions) {
            console.log('page size is ' + $scope.pagingOptions.pageSize);
        }

        if ($scope.activeUserData && $scope.activeUserData.configuration) {

            var config = $scope.activeUserData.configuration;

            console.log('activeUserData is ' + JSON.stringify(config));

            if (config.grid && config.grid[0]) {
                // Check for paging size change
                if ($scope.pagingOptions.pageSize !== config.grid[0].pageSize) {

                    console.log("posting grid settings");
                    config.grid[0].pageSize = $scope.pagingOptions.pageSize;

                    // no callback as the paging options main watcher does that for us
                    $scope.saveGridConfiguration();
                }
            }
        }
    };

    $scope.$watch('pagingOptions.pageSize', $scope.checkPageSizeOfGrid, true);

    // TODO: How to test the watchers?
    // We wish to limit the utilities shown in the filter to only utils that are
    // associated with the states that are selected
    // a) if no states selected, still show all utilities
    // b) if a state or set of states is selected, filter the utility list by state
    // fyi, utility.state is already loaded from master data so this is pretty easy
    $scope.$watch('filters.utilityState', function () {

        // MasterData should load the utility list, but if that has not happened yet, do
        // nothing
        if ($scope.utilitiesList && $scope.utilitiesList.length > 0) {
            if ($scope.filters.utilityState.length > 0) {

                // Angular's 'filter' filter (can be confusing)
                // Angular will copy each item in the source array ($scope.utilitiesList) to the
                // destination array ($scope.filterUtilitiesList if the provided function returns
                // true.
                // The provided function is using jquery's in array function to make this easy
                $scope.filterUtilitiesList = $filter('filter')($scope.utilitiesList, function (utility) {

                    return ( $.inArray(utility.state, $scope.filters.utilityState) >= 0 )
                });
            }
            else {
                // if no states, copy all utilities into the filter list.
                $scope.filterUtilitiesList = $scope.utilitiesList.slice(0);
            }
        }

    }, true);


    $scope.showPicker = function (selector) {
        console.log("showPicker, selector = [" + selector + "]");

        $(selector).datepicker('show')
    };

    $scope.gridOptions = {};

    initializeGrid($scope, $routeParams);

    datePickerChangeHandler('#minSvcEndDate', $scope, 'serviceEndDate', 0, '#minSvcEndDateText');
    datePickerChangeHandler('#maxSvcEndDate', $scope, 'serviceEndDate', 1, '#maxSvcEndDateText');
    datePickerChangeHandler('#minDropDate', $scope, 'dropStatusDate', 0, '#minDropDateText');
    datePickerChangeHandler('#maxDropDate', $scope, 'dropStatusDate', 1, '#maxDropDateText');

    datePickerChangeHandler('#reminderDate', $scope, 'reminderDate', 0, '#reminderDateText');
    /**
     * retrieving work items from DB
     */
    $scope.getWorkItemsFromDb = function () {

        console.log("get WorkItems FromDb: datestamp:" + moment().format());

        var pageSize = $scope.pagingOptions.pageSize;
        var page = $scope.pagingOptions.currentPage;

        $scope.loadingStatus = "getting work items";

        console.log("get WorkItems FromDb id is [" + $routeParams.id +
            "] pageSize [" + pageSize +
            "] page [" + page +
            "]");

        var sortField = 'dropStatusDate'; // default
        var sortDirection = 'desc'; // default
        if ($scope.gridSortInfo) {
            if ($scope.gridSortInfo.fields && $scope.gridSortInfo.fields.length > 0) {
                sortField = $scope.gridSortInfo.fields[0];
            }
            if ($scope.gridSortInfo.directions && $scope.gridSortInfo.directions.length > 0) {
                sortDirection = $scope.gridSortInfo.directions[0];
            }
        }
        pageSize = pageSize ? pageSize : 25;

        var offset = page ? (page - 1 ) * pageSize : 0;

        var apiGet = ($routeParams.id != null) ? '/api/getWorkItems/' + $routeParams.id : '/api/getWorkItems';
        // encode paging & sorting parameters
        var config =
        {
            params: {
                limit: pageSize,
                offset: offset,
                sort: sortField,
                direction: sortDirection
            }
        };

        if ($routeParams.hold == "hold") {
            config.params.hold = true;
        }

        if ($routeParams.hold == "attention") {
            config.params.attention = true;
        }


        $http.get(apiGet, config).success(function (data) {

            console.log("get WorkItems FromDb: success @ datestamp:" + moment().format());

            $scope.loadingStatus = "got work items";

            if (data.GenPopData) {
                var len = data.GenPopData.length;
				 getDropOriginSystem(data.GenPopData,$scope);
                console.log("get WorkItems FromDb loaded " + len + " workItem records.");
            }
            else {
                console.log("get WorkItems FromDb loaded invalid data! " + JSON.stringify(data));
            }

//            $scope.displayItems = [];

            $scope.displayItems = data.GenPopData;

            var user = $scope.user.userName;

            if ($scope.displayItems && $scope.displayItems.length && $scope.displayItems.length > 0) {
                var itemsLength = $scope.displayItems.length;
                for (var i = 0; i < itemsLength; i++) {
                    $scope.displayItems[i].reminderDate = "";
                    $scope.displayItems[i].onHold = "";
                    if ($scope.displayItems[i].holdBucket != undefined) {
                        var holdLength = $scope.displayItems[i].holdBucket.length;
                        for (var j = 0; j < holdLength; j++) {
                            if ($scope.displayItems[i].holdBucket[j].agent == user) {
                                $scope.displayItems[i].onHold = "Yes";
                                $scope.displayItems[i].reminderDate = $scope.displayItems[i].holdBucket[j].reminderDate;
                            }
                        }
                    }
                }
            }

            /*
            Fix for initial data load problem.  It appears that if we call the grid's
            RebuildGrid service via a delay timeout, then the grid will display all rows.

            Will need to test the timeout value on various machines after deploying

            (Mikey, 2013-05-16)
             */
            console.log("@" + moment().format('hh.mm.ss.SSS') + ", setting rebuild grid timeout");
            setTimeout(function () {
                console.log("@" + moment().format('hh.mm.ss.SSS') + ", $domUtilityService.RebuildGrid");
                try {
                    $domUtilityService.RebuildGrid(
                        $scope.gridOptions.$gridScope,
                        $scope.gridOptions.ngGrid);
                } catch (e) {
                    console.log("error in dom service: " + e);
                }
            }, 100);

            // reset the loading status via timeout to let other events flush out.
            if ($scope.loadingFlag) {
                setTimeout(function () {
                    console.log("@" + moment().format('hh.mm.ss.SSS') +
                        ", clearing loading flag" );

                    $scope.loadingFlag = false;
                    $scope.loadingStatus = "ready";

                    if (!$scope.$$phase) {
                        $scope.$apply();
                    }

                }, 50);
            }

        }).
            error(function (error) {
                console.log("get WorkItems FromDb: fail @ :" + moment().format());

                informerService.inform("Error getting work items:\n" + JSON.stringify(error));

            });
    };


    //Configuring ng grid on agent login
    $scope.ConfigureGridForAgent = function (user) {

        console.log("processing agent config for user " + JSON.stringify(user));
        if (user != "ADMIN") {

            // Set non-admin grid options (note that the grid column definitions
            // restricts the dropRep column to admins only)
            $scope.gridOptions.multiSelect = false;
            $scope.gridOptions.displaySelectionCheckbox = false;
            $scope.checkAdmin = true;
        }
    };
    /**
     * set grid sorting details to display
     * @param userData
     */
    $scope.setGridSortInfo = function (userData) {

        console.log("setGridSortInfo called");

        $scope.gridSortInfo.fields = [ userData.configuration.grid[0].sortInfo.field ];
        $scope.gridSortInfo.directions = [ userData.configuration.grid[0].sortInfo.direction ];
    }

    /**
     * intialize grid configuration on load
     *
     * @return {{grid: Array}}
     */
    $scope.initializeGridConfiguration = function (existsFlag) {
        console.log("initializing grid config ");

        if(existsFlag){
            return [{"pageSize": $scope.pagingOptions.pageSize,
                "sortInfo": {
                    "direction": "desc",
                    "field": "dropStatusDate"
                },
                gridColumnDefs: []
            }];
        }else{
            return {
                "grid": [
                    {
                        "pageSize": $scope.pagingOptions.pageSize,
                        "sortInfo": {
                            "direction": "desc",
                            "field": "dropStatusDate"
                        },
                        gridColumnDefs: []
                    }
                ]
            };
        }
    }

    /**
     * retrieve filter values from DB based on logged in user
     */

    $scope.getSavedFilterValuesFromDB = function () {

        console.log("getSavedFilterValuesFromDB: searching");
        $scope.loadingStatus = "getting user filter data";

        function setDate(filterArray, index, pickerId) {
            if (filterArray[index]) {

                if (filterArray[index]["_d"]) {

                    filterArray[index] = moment(filterArray[index]["_d"]);

                } else {
                    filterArray[index] = moment(filterArray[index]);
                }

                $(pickerId).datepicker('setValue', filterArray[index].toDate())
            }
        }

        // set the configuration of logged in user to display
        function processUserData(data) {
            var userData = data.UserData[0];

            console.log("Loaded user data: " + JSON.stringify(userData));

            // Store userData on the scope so the config watchers can see it
            $scope.activeUserData = userData;

            if(userData.configuration){
                if(!userData.configuration.grid){
                    userData.configuration.grid = $scope.initializeGridConfiguration(true);
                }
            }else{
                userData.configuration = $scope.initializeGridConfiguration(false);
            }

            console.log("loading grid config from: '" + JSON.stringify(userData.configuration) + "'");

            $scope.pagingOptions.pageSize = userData.configuration.grid[0].pageSize;
            $scope.setGridSortInfo($scope.activeUserData);

            var dbFilters = {};
            //ACME-498: check for configuration &  queryFilter existence in case of new user
            if(userData.configuration){
                var config = userData.configuration;
                var dbFilters = config.filters;
            }

            var defaultGridCols = $scope.getDefaultGridColumns();

            if (userData.configuration.grid[0].gridColumnDefs) {

                console.log("initializing $scope.gridColumnDefs from user data");

                angular.forEach(userData.configuration.grid[0].gridColumnDefs, function (userColumn) {

                    angular.forEach(defaultGridCols, function (defaultColumn) {
                        if (defaultColumn.field === userColumn.field) {
                            console.log("Loading userColumn: " + JSON.stringify(userColumn));
                            defaultColumn.width = userColumn.width;
                            defaultColumn.visible = userColumn.visible;
                            defaultColumn.save = true;
                        }

                    });
                });
            }

            // Grid watches the variable assignment so by reassigning we see the grid update
            console.log("setting grid column definitions: ");
            $scope.gridColumnDefs = defaultGridCols;

            // UI is bound to filters object
            for (var key in $scope.filters) {
                for (var dbValuesKey in dbFilters) {

                    if (key == dbValuesKey) {
                        $scope.filters[key] = dbFilters[dbValuesKey];
                    }
                }
            }
            setDate($scope.filters.serviceEndDate, 0, '#minSvcEndDate');
            setDate($scope.filters.serviceEndDate, 1, '#maxSvcEndDate');
            setDate($scope.filters.dropStatusDate, 0, '#minDropDate');
            setDate($scope.filters.dropStatusDate, 1, '#maxDropDate');


            // On successful load & process of user data, get wi data from DB
            console.log("in getSavedFilterValuesFromDB, intentionally getting work items");
            $scope.pagingOptions.currentPage = 1;
            getFilterRecordCount($scope, $http, $routeParams, $domUtilityService);
            $scope.getWorkItemsFromDb();
        }

        $http.get('/api/SavedFiltersData').
            success(function (responseData) {
                console.log("getSavedFilterValuesFromDB: success @ " + moment().format() +
                    ", data: " + JSON.stringify(responseData));
                $scope.loadingStatus = "got user filter data";

                if (responseData && responseData.UserData && responseData.UserData[0]) {
                    processUserData(responseData);
                    if (!$scope.filters.accountType)
                        $scope.filters.accountType = "All"
                } else {
                    console.log("can't process user data: " + JSON.stringify(responseData));

                    informerService.inform('There was a problem loading user data.');

                }
            }).
            error(function (data, status, headers, config) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.

                console.log("Error loading master data!  data: " + JSON.stringify(data) +
                    " status: " + status +
                    " headers: " + JSON.stringify(headers) +
                    " config: " + JSON.stringify(config));
                informerService.inform('There was a problem loading master data.');

            });

    };


    $scope.holdBucket = [];

    ////check the current agent is in the hold bucket or not. get hold bucket if exists
    $scope.getHoldBucket = function (user) {
        var now = new Date();
        $scope.bucketNum = -1;
        var holdLength = $scope.selectedWorkItems[0].holdBucket.length;

        if (holdLength > 0) {
            for (var i = 0; i < holdLength; i++) {
                if ($scope.selectedWorkItems[0].holdBucket[i].agent == user) {

                    $("#holdComments").val($scope.selectedWorkItems[0].holdBucket[i].comments);

                    var formatDate = moment($scope.selectedWorkItems[0].holdBucket[i].reminderDate).format('MM-DD-YYYY');
                    $scope.HoldReasonType = $scope.selectedWorkItems[0].holdBucket[i].HoldReasonType;
                    $("#reminderDateText").val(formatDate);
                    $('#reminderDate').datepicker('setValue', formatDate);

                    //set the hold bucket position of the current agent
                    $scope.bucketNum = i;
                    continue;
                } else {
                    $("#reminderDateText").val("")
                    $('#reminderDate').datepicker('setValue', moment(now).format("MM DD YYYY"));
                    $("#holdComments").val("");
                    $scope.HoldReasonType = "";
                    $scope.holdBucket = [];
                }
            }

        } else {
            $("#reminderDateText").val("")
            $('#reminderDate').datepicker('setValue', moment(now).format("MM DD YYYY"));
            $("#holdComments").val("");
            $scope.HoldReasonType = "";
            $scope.holdBucket = [];
        }
    }

    /**
     * add/update hold bucket details to the work item
     * @param HoldReasonType
     * @param user
     * @param reminderDateText
     * @param holdComments
     */
    $scope.addOrEditWorkItemsToHold = function (user, reminderDateText, holdComments, HoldReasonType) {

        var alertText = "";
        if ($scope.bucketNum != -1) {
            alertText = "updated in the";
            $scope.selectedWorkItems[0].holdBucket[$scope.bucketNum] = { agent: user, comments: holdComments, reminderDate: reminderDateText, HoldReasonType: HoldReasonType};
        } else {
            alertText = "added to";
            $scope.selectedWorkItems[0].holdBucket.push({ agent: user, comments: holdComments, reminderDate: reminderDateText, HoldReasonType: HoldReasonType});
        }

        $http.post('/api/UpdateWorkItem', $scope.selectedWorkItems).
            success(function () {
                informerService.inform("selected item is " + alertText + " Hold Bucket succesfully");

                $('.ngSelectionCheckbox').removeAttr('checked', 'checked');

                //TODO: selectedWorkItems will become empty even though if we select the work item again -Raja.
                // TODO: FYI Raja (Mikey), for me this clears the selection after the alert.  Does it work for you?
                $scope.selectedWorkItems.length = 0;

                $scope.getWorkItemsFromDb();
            }).
            error(function (error) {
                console.log("Could not update work item:  " + error);
                informerService.inform("Error updating work item");
            });

    }

    if ($routeParams.hold == "hold")
        $scope.holdBktLebel = "Edit Hold"
    else
        $scope.holdBktLebel = "Add/Edit Hold";

    $scope.addOrEditHold = function () {

        htmlOutService.addOrEditHoldService($scope);

    };

    /**
     * removing work items from hold for logged in user
     *
     * @param user
     */
    $scope.removeWorkItemHold = function (user) {
        $scope.selectedWorkItems[0].holdBucket = $scope.selectedWorkItems[0].holdBucket.filter(function (jsonObject) {
            return jsonObject.agent != user;
        });

        $http.post('/api/UpdateWorkItem', $scope.selectedWorkItems).
            success(function () {
                getFilterRecordCount($scope, $http, $routeParams, $domUtilityService);
                $scope.getWorkItemsFromDb();
                informerService.inform("selected item is removed from Hold Bucket succesfully");
                $scope.selectedWorkItems.length = 0;

            }).
            error(function (error) {
                console.log("Could not update work item:  " + error);
                informerService.inform("Error updating work item");
            });
    }

    $scope.removeHold = function () {

        htmlOutService.removeHoldService($scope);

    };

    // retrieve masterData from display dropdown values
    $scope.getMasterDataFromDB = function () {
        console.log("getMasterDataFromDB: searching");
        $scope.loadingStatus = "getting Master Data";

        $http.get('/api/MasterData').
            success(function (masterData) {
                console.log("getMasterDataFromDB: success");
                $scope.loadingStatus = "got Master Data";
                $scope.MasterData = masterData.MasterData;
                console.log("loaded masterdata, l=" + masterData.MasterData.length);

                for (var i = 0; i < $scope.MasterData.length; i++) {
                    var row = $scope.MasterData[i];

					if(row.id == "eventID"){
						$scope.eventIDURL = row.url;
					  }
					if(row.id == "accountNumber"){
						$scope.accountNumberURL = row.url;
					}

//                    console.log( "masterdata key '" + row.key +
//                        "' values '" + JSON.stringify( row.value ) +
//                        "' ");

                    switch (row["key"]) {

                        case "Utilities":
                            $scope.utilitiesList = row["value"]
                            break;
                        case "EPStatuses":
                            $scope.dropTypesList = row["value"]
                            break;
                        case "States":
                            $scope.statesList = row["value"]
                            break;
                        case "Partners":
                            $scope.usersList = row["value"]
                            break;
                        case "AccountType":
                            $scope.accountTypesList = row["value"]
                            break;
                        case "ItemTypes":
                            $scope.dropTypeList = row["value"]
                            break;
                        case "CommodityTypes":
                            $scope.commodityList = row["value"]
                            break;
                        case "HoldType":
                            $scope.HoldTypesList = row["value"]
                            break;
                        case "HoldReasonType":
                            $scope.HoldReasonList = row["value"]
                            break;

                    }

                }

                $scope.usersList.push({"website": "All", "acronym": "All", "partnerCode": "All", "partnerName": "All", "partnerType": "All", "partnerID": "All"});
                $scope.statesList.push({"abbrev": "All", "stateName": "All", "stateID": "All"});
                $scope.utilitiesList.push({"commodity": "All", "distributorName": "All", "state": "All", "unitAbbrev": "All",
                    "utility": "All", "utilityAbbrev": "All", "utilityCode": "All", "utilityID": "All"});


                // always load the user filter data whether viewing as GenPop or campaign

                // Clone the util list into a filterable list
                $scope.filterUtilitiesList = $scope.utilitiesList.slice(0);
                $scope.getSavedFilterValuesFromDB();

            }).
            error(function () {
            });

    }
    // helper function to select all values in drop downs
    $scope.selectAll = function (key) {
        if (key == "state") {
            if ($scope.filters.utilityState == "All") {
                for (var i = 0; i < $scope.statesList.length; i++) {
                    $scope.filters.utilityState.push($scope.statesList[i].abbrev);
                }
            }
        }
        if (key == "utility") {
            if ($scope.filters.utilityAbbr == "All") {
                for (var i = 0; i < $scope.utilitiesList.length; i++) {
                    $scope.filters.utilityAbbr.push($scope.utilitiesList[i].utilityAbbrev);
                }
            }
        }
        if (key == "partner") {
            if ($scope.filters.partner == "All") {
                for (var i = 0; i < $scope.usersList.length; i++) {
                    $scope.filters.partner.push($scope.usersList[i].partnerName);
                }
            }
        }

        if (key == "hold") {
            informerService.inform($scope.filters.HoldType);
            if ($scope.filters.HoldType == "All") {
                $scope.filters.HoldType = [];
                for (var i = 0; i < $scope.HoldTypesList.length; i++) {
                    $scope.filters.HoldType.push($scope.HoldTypesList[i]);
                }
            }
        }
    }
    $scope.activeCampsList = [];

    var genPopCampaign = {_id: null, name: "GenPop"};

    // retrieve all campaigns and load campaigns drop down
    $scope.getAllCampaignsList = function () {
        $scope.previousCampaign = {};

        $http.get('/api/listCampaigns').
            success(function (campaignsData) {
                $scope.campaignsList = campaignsData.CampaignsList;

                for (var i = 0; i < $scope.campaignsList.length; i++) {
                    var campaign = $scope.campaignsList[i];
                    var campaignStartDate = moment(campaign.startDate);
                    var campaignEndDate = moment(campaign.endDate);
                    var todayDate = moment(new Date());

                    if (campaignEndDate.isAfter(todayDate, 'days') ||
                        campaignEndDate.isSame(todayDate, 'days')) {
                        $scope.activeCampsList.push(campaign);
                    }
                }
                $scope.activeCampsList.push(genPopCampaign);

                for (var i = 0; i < $scope.activeCampsList.length; i++) {
                    var campaign = $scope.activeCampsList[i];
                    if ($routeParams.id != null) {
                        if (campaign["_id"] == $routeParams.id) {
                            $scope.selectedCampaign = campaign;
                            $scope.previousCampaign = campaign;
                        }
                    } else {
                        $scope.selectedCampaign = genPopCampaign;
                    }
                }
            }).
            error(function () {
            });
    }

    $scope.clear = function () {

        console.log("clear: hello @ " + moment().format());

        $scope.loadingFlag = true;

        $scope.filters = getEmptyFilters();

        // TODO:  Something is causing the sort to cause the data to load twice, fix later (Mikey, 2013-03-12)
        // TODO: test
        for (var key in $scope.gridSortInfo) {
            if ($scope.gridSortInfo.hasOwnProperty(key)) {
                console.log("removing field '" + key +
                    "' from $scope.gridSortInfo");

                delete $scope.gridSortInfo[key];
            }
            else {
                console.log("skipping delete of key '" + key +
                    "' from $scope.gridSortInfo");
            }
        }

        // default sort
        // TODO: test (Mikey)
        $scope.sortInfo = {
            field: "dropStatusDate",
            direction: 'desc'};


        // Push the sort info into a 1 d array
        $scope.gridSortInfo.fields = [ $scope.sortInfo.field ];
        $scope.gridSortInfo.directions = [ $scope.sortInfo.direction ];

        $scope.pagingOptions.currentPage = 1;

        $('#minSvcEndDateText').val('');
        $('#maxSvcEndDateText').val('');

        $('#minDropDateText').val('');
        $('#maxDropDateText').val('');

        $scope.errMsgDropDateText = "";
        $scope.errMsgSvnDateText = "";

        var now = new Date();
        var nowDate = $filter('date')(now, "M-d-yyyy");

        $('#minSvcEndDate').datepicker('setValue', moment(nowDate).toDate())
        $('#maxSvcEndDate').datepicker('setValue', moment(nowDate).toDate())


        $scope.validateFilterDetails();

        // On successful clear user data, get wi data from DB
        console.log("in clear, saving, but intentionally getting work items");

        $scope.saveFilters($scope.getSavedFilterValuesFromDB);

    };

    var convertToIsoString = function (dateObject) {
        if (dateObject && dateObject.isValid()) {
            return dateObject.toDate().toISOString();
        } else {
            return null;
        }
    };
    /**
     * save selected filters in UserData collection
     *
     * @param callback
     */
    $scope.saveFilters = function (callback) {

        // Convert the filter dates (if present) from moment to iso strings before posting to server
        if ($scope.filters.serviceEndDate && $scope.filters.serviceEndDate.length > 0) {
            $scope.filters.serviceEndDate[0] = convertToIsoString($scope.filters.serviceEndDate[0]);
            $scope.filters.serviceEndDate[1] = convertToIsoString($scope.filters.serviceEndDate[1]);
        }

        if ($scope.filters.dropStatusDate && $scope.filters.dropStatusDate.length > 0) {
            $scope.filters.dropStatusDate[0] = convertToIsoString($scope.filters.dropStatusDate[0]);
            $scope.filters.dropStatusDate[1] = convertToIsoString($scope.filters.dropStatusDate[1]);
        }

        $scope.configuration =  {
            filters: $scope.filters
        } ;

        console.log("saveFilters: datestamp:" + moment().format());

        console.log("saveFilters: $scope.configuration: " +
            JSON.stringify($scope.configuration));

        $http.post('/api/SaveFilters', $scope.configuration).
            success(function (data) {

                console.log("saveFilters success, data is " + JSON.stringify(data));

                if (callback) {
                    console.log("saveFilters invoking callback");
                    callback();
                }
            }).
            error(function (error) {
                console.log("saveFilters: error: " + JSON.stringify(error));
                informerService.inform("save filters error! " + error);

            });

    };
    /**
     * helper function to validate min and max values for integers
     *
     * @param minVal
     * @param maxVal
     * @return {boolean}
     */
    $scope.validateMinMax = function (minVal, maxVal) {

        if ((minVal != null && minVal != "") && (maxVal != null && maxVal != "")) {
            return (parseInt(minVal) > parseInt(maxVal));
        } else {
            return false;
        }
    };
    /**
     * helper function to validate min and max values for float variables
     *
     * @param minVal
     * @param maxVal
     * @return {boolean}
     */
    $scope.validateMinMaxFloat = function (minVal, maxVal) {

        if ((minVal != null && minVal != "") && (maxVal != null && maxVal != "")) {
            return (parseFloat(minVal) > parseFloat(maxVal));
        } else {
            return false;
        }
    };
    /**
     * helper function to validate min and max values for date variables
     *
     * @param minDate
     * @param maxDate
     * @return {boolean}
     */
    $scope.validateDates = function (minDate, maxDate) {

        var result = false;

        if ((minDate != null && minDate != "") &&
            (maxDate != null && maxDate != "")) {

            if (minDate.isAfter) {
                result = minDate.isAfter(maxDate);
            }
        }


        return result;
    };


    datePickerTypeHandler('#minSvcEndDate', $scope, 'serviceEndDate', 0, '#minSvcEndDateText');
    datePickerTypeHandler('#maxSvcEndDate', $scope, 'serviceEndDate', 1, '#maxSvcEndDateText');
    datePickerTypeHandler('#minDropDate', $scope, 'dropStatusDate', 0, '#minDropDateText');
    datePickerTypeHandler('#maxDropDate', $scope, 'dropStatusDate', 1, '#maxDropDateText');
    // helper function to validate entered filter values
    $scope.validateFilterDetails = function () {
        $scope.errminSvcEndDateFlag = false;
        $scope.errmaxSvcEndDateFlag = false;
        $scope.errminDropDateFlag = false;
        $scope.errmaxDropDateFlag = false;

        if (dateValidateFn($scope,'#minSvcEndDate', 'serviceEndDate', 0, '#minSvcEndDateText')) {
            if (dateValidateFn($scope,'#maxSvcEndDate', 'serviceEndDate', 1, '#maxSvcEndDateText')) {
                if (dateValidateFn($scope,'#minDropDate', 'dropStatusDate', 0, '#minDropDateText')) {
                    if (dateValidateFn($scope,'#maxDropDate', 'dropStatusDate', 1, '#maxDropDateText')) {

                    }
                }
            }
        }

        $scope.validDates = ($scope.errminSvcEndDateFlag || $scope.errmaxSvcEndDateFlag || $scope.errminDropDateFlag || $scope.errmaxDropDateFlag);

        console.log('validating filters: ' + JSON.stringify($scope.filters));

        $scope.normAnnUsageErrorMessage = $scope.validateMinMax(
            $scope.filters["normalizedAnnualUsage"][0], $scope.filters["normalizedAnnualUsage"][1]);

        $scope.aggrGasErrorMessage = $scope.validateMinMax(
            $scope.filters["aggregateGas"][0], $scope.filters["aggregateGas"][1]);

        $scope.annGasErrorMessage = $scope.validateMinMax(
            $scope.filters["annualGasUsage"][0], $scope.filters["annualGasUsage"][1]);

        $scope.aggrGreenkWhErrorMessage = $scope.validateMinMax(
            $scope.filters["aggregateGreenkWh"][0], $scope.filters["aggregateGreenkWh"][1]);

        $scope.aggrkWhErrorMessage = $scope.validateMinMax(
            $scope.filters["aggregatekWh"][0], $scope.filters["aggregatekWh"][1]);

        $scope.annkWhErrorMessage = $scope.validateMinMax(
            $scope.filters["annualkWh"][0], $scope.filters["annualkWh"][1]);

        $scope.cashErrorMessage = $scope.validateMinMax($scope.filters["cashbackBalance"][0], $scope.filters["cashbackBalance"][1]);
        $scope.mtaErrorMessage = $scope.validateMinMax($scope.filters["monthsUntilCashAward"][0], $scope.filters["monthsUntilCashAward"][1]);

        if (!$scope.errMsgMinSvnDateFlag) {
            $scope.svcErrorMessage = $scope.validateDates(
                $scope.filters["serviceEndDate"][0],
                $scope.filters["serviceEndDate"][1]);
        }

        $scope.maErrorMessage = $scope.validateMinMax($scope.filters["monthsActive"][0], $scope.filters["monthsActive"][1]);
        $scope.dmErrorMessage = $scope.validateMinMax($scope.filters["monthsSinceDropped"][0], $scope.filters["monthsSinceDropped"][1]);

        $scope.pricingErrorMessage =
            $scope.validateMinMaxFloat($scope.filters["pricing"][0], $scope.filters["pricing"][1]);

        if (!$scope.errMsgDropDateFlag) {
            $scope.dropDateErrorMessage = $scope.validateDates(
                $scope.filters["dropStatusDate"][0],
                $scope.filters["dropStatusDate"][1]);
        }
        if ($scope.aggrkWhErrorMessage || $scope.annkWhErrorMessage || $scope.cashErrorMessage || $scope.mtaErrorMessage || $scope.svcErrorMessage
            || $scope.maErrorMessage || $scope.dmErrorMessage || $scope.pricingErrorMessage || $scope.dropDateErrorMessage || $scope.validDates) {
            return true;
        } else {
            return false;
        }

    };
    /**
     * function to save filters selected by user
     */
    $scope.go = function () {
        console.log("go: hello");
        if (!$scope.validateFilterDetails()) {

            console.log('go, filters valid ');

            $scope.loadingFlag = true;
            $scope.loadingStatus = "saving filters";
            $scope.saveFilters($scope.getSavedFilterValuesFromDB);
        }
    };
    /**
     * function to export grid data into excel
     */
    $scope.exportFilterToCsv = function () {
        console.log("exportFilterToCsv: hello");
        function doCsvRequest() {

            var shownFields = 'calculated.dropDays,dropStatusMapped,accountNumber,accountName,' +
                'normalizedAnnualUsage,aggregatekWh,annualkWh,aggregateGas,' +
                'annualGasUsage,uom,meters,pricing,utilityName,utilityState,' +
                'cashbackBalance,calculated.monthsUntilCashAward,' +
                'calculated.monthsActive,calculated.monthsSinceDropped,' +
                'numOfInvoices,saveCount,dropRep,serviceStartDate,' +
                'serviceEndDate,cashbackDueDate,dropStatusDate,dropStatus,' +
                'dropType,premiseStatus,partner,contactName,commodity,' +
                'promotion,aggregateGreenkWh,greenIndicator,masterCustomerID,';

            var notShownFields = 'accountType,billingAccountNumber,billingPhone,' +
                'campaignCode,channel,contactsPerRecord,dropInsertDT,dropOriginSystem,' +
                'dropReason,dropUpdateDT,energyPlusID,eventID,greenBilled,' +
                'lastCallDate,lastCallResult,lastInvoicesDate,loadProfile,marketer,' +
                'mid,notificationDate,partnerCode,phone,priceBand,priorityLevel,' +
                'priorRep,promotionCode,region,reinstatementDate,repCode,repUserName,' +
                'saleDate,serviceState,startingRate,totalAwardsToDate,utilityAbbr,' +
                'utilityCode,utilityDropDetail';

            var fields = shownFields + notShownFields;


            var sortField = 'dropStatusDate'; // default
            var sortDirection = 'desc'; // default
            if ($scope.gridSortInfo) {
                if ($scope.gridSortInfo.fields && $scope.gridSortInfo.fields.length > 0) {
                    sortField = $scope.gridSortInfo.fields[0];
                }
                if ($scope.gridSortInfo.directions && $scope.gridSortInfo.directions.length > 0) {
                    sortDirection = $scope.gridSortInfo.directions[0];
                }
            }

            var queryString = "?sort=" + sortField + "&direction=" + sortDirection + "&fields=" + fields;


            var encodedFields = encodeURI(queryString);

            // Trigger download call in new window, as you cannot get a download via XHR call like $http.get()
            // http://stackoverflow.com/questions/14215049/how-to-download-file-using-angularjs-and-calling-mvc-api
            console.log("calling $window.open:  ");
            $window.open('/api/csvDownload' + encodedFields);

        }

        if (!$scope.validateFilterDetails()) {

            var count = $scope.gridOptions.totalServerItems;

            if (count > 50000) {
                if (confirm("Only the first 50,000 rows can be downloaded ")) {
                    doCsvRequest();
                }
            } else {
                doCsvRequest();
            }
        }
    };

    $scope.selectAllEvents = function ($event) {

        var checkbox = $event.target;
        var selected = checkbox.checked;

        var eventsLength = $scope.displayItems.length;

        for (var i = 0; i < eventsLength; i++) {
            $scope.displayItems[i].checked = selected;
        }
    };

    $scope.previousAgents = [];

    $scope.collectPrevious = function ($event) {
        var checkbox = $event.target;
        var selected = checkbox.checked;
        var value = {};
        value = eval('(' + checkbox.value + ')');
        if (selected) {
            $scope.previousAgents.push(value);
        } else {
            $scope.previousAgents.splice(value, 1);
        }
    };

    $scope.selectedAgent = null;
    $scope.selectedCampaign = {};

    function sendAgentChangeRequest(workItem, agent) {

        var postData = {
            // Data required for rabbit
            eventID: workItem.eventID,
            energyPlusID: workItem.energyPlusID,
            dropOriginSystem: workItem.dropOriginSystem,
            dropStatusMapped: workItem.dropStatusMapped,

            pendingAgent: {
                userName: agent.name,
                fullName: agent.fullName
            },

            // Data required for logging
            event: "Agent Action",
            oldAgentUsername: workItem.repUserName,
            oldAgentFullname: workItem.dropRep,

            // Data required for updating
            workItemId: workItem["_id"]
        };

        return postData;
    }

    $scope.assignWorkItem = function () {

        console.log("assignWorkItem start: route id:  " + JSON.stringify($routeParams.id));
        console.log("assignWorkItem start: campaign:  " + JSON.stringify($scope.selectedCampaign));
        console.log("assignWorkItem start: agent:  " + JSON.stringify($scope.selectedAgent));
        console.log("assignWorkItem start: selection count:  " + $scope.selectedWorkItems.length);

        var agent = $scope.selectedAgent;
        var campaign = $scope.selectedCampaign;


        if ($routeParams.id == null) {
            $scope.previousCampaign["name"] = "GenPop";
            $scope.previousCampaign["_id"] = null;
        }

        var selectedWorkItems = [];
        var previousWorkItems = [];
        $scope.finalWorkItems = [];
        var eventName = "";
        var displayMessage = "";

        var agentChangeList = [];

        for (var k = 0; k < $scope.selectedWorkItems.length; k++) {
            var workItem = $scope.selectedWorkItems[k];
            selectedWorkItems.push(workItem);
            previousWorkItems.push(workItem);
        }

        if (selectedWorkItems.length > 0) {

            for (var i = 0; i < selectedWorkItems.length; i++) {
                var item = selectedWorkItems[i];


                if (( campaign && campaign.name) && (agent && agent.name)) {


                    if (( ($routeParams.id != null) && (item["campaignId"] &&
                        (item["campaignId"] == campaign["_id"]) ) )
                        ||
                        ( (!$routeParams.id) && ( ( campaign["name"] == "GenPop" )
                            ||
                            ( item["campaignId"] == campaign["_id"] ) ) )) {

                        // TODO: Discuss with Sujal:  Selected 10 record, assigned all to one agent,
                        // one matched 9 updated and 1 failed but saw two alerts.  9 updated 2nd
                        // TODO: test this check
                        if (item["repUserName"] && (item["repUserName"] == agent.name)) {
                            informerService.inform(" A work item must be assigned to a new agent.");
                        } else {
                            console.log("Assigning agent 1 ");
                            displayMessage = " work item(s) has been assigned to " + agent.fullName;
                            agentChangeList.push(sendAgentChangeRequest(item, agent));
                        }
                    } else {

                        console.log("Assigning campaign & agent 1 ");

                        item["campaignId"] = campaign["_id"];

                        agentChangeList.push(sendAgentChangeRequest(item, agent));

                        eventName = "both";
                        $scope.finalWorkItems.push(item);
                        displayMessage = " work item(s) has been assigned to " +
                            campaign["name"] + " and " + agent.name;
                    }

                } else if (( campaign && campaign.name) && !(agent && agent.name)) {


                    if (( ($routeParams.id != null) && (item["campaignId"] &&
                        (item["campaignId"] == campaign["_id"]) ) ) ||
                        ( (!$routeParams.id) && ( ( campaign["name"] == "GenPop" )
                            ||
                            ( item["campaignId"] == campaign["_id"] ) ) )) {
                        informerService.inform(" A work item must be assigned to a new campaign.");
                    } else {

                        console.log("Assigning campaign 1 ");

                        item["campaignId"] = campaign["_id"];
                        eventName = "Work Item Action";
                        $scope.finalWorkItems.push(item);
                        displayMessage = " work item(s) has been assigned to " + campaign["name"];
                    }


                } else if (!( campaign && campaign.name) &&
                    (agent && agent.name)) {


                    if (item["repUserName"] && (item["repUserName"] == agent.name)) {
                        informerService.inform(" A work item must be assigned to a new agent.");
                    } else {

                        console.log("Assigning agent  2 ");

                        displayMessage = " work item(s) has been assigned to " + agent.fullName;
                        agentChangeList.push(sendAgentChangeRequest(item, agent));
                    }
                } else {
                    informerService.inform(" Please Select Campaign or Agent ");
                }
            }
        }
        else {
            informerService.inform("Please select at least one work item");
        }

        if (agentChangeList.length > 0) {
            $http.post("/api/changeAgent", agentChangeList).success(function (data) {

                console.log("agentChangeList success data: " + JSON.stringify(data));

                if (data.successCount == agentChangeList.length) {

                    angular.forEach(agentChangeList, function (changeItem) {
                        angular.forEach($scope.displayItems, function (workItem) {


                            if (changeItem.workItemId === workItem["_id"]) {

                                if (!workItem.acmeData) {
                                    workItem.acmeData = {};
                                }

                                workItem.acmeData.pendingAgent = changeItem.pendingAgent;
                            }
                        });
                    });

                    if( eventName != "both"){
                        informerService.inform(agentChangeList.length + displayMessage);
                    }

                    // TODO: UI is not updating automatically but does on page resize etc...
                    $scope.selectedWorkItems.length = 0;
                }
                else {
                    informerService.inform("update data length mismatch! Server response is " + JSON.stringify(data));
                }

            }).error(function (error) {
                    console.log("Could not process agent change request: '" + error + "'");
                    informerService.inform("Error sending agent change request");
                });
        }

        if ($scope.finalWorkItems.length > 0) {

            $http.post('/api/UpdateWorkItem', $scope.finalWorkItems).
                success(function () {

                    // Clear the selection on success
                    // TODO: Mikey, test this
                    $scope.selectedWorkItems.length = 0;

                    console.log("Work items updated,reload")
                    $scope.loadingFlag = true;

                    $scope.getWorkItemsFromDb();
                    $http.get('/api/user/').success(function (data) {
                        $scope.user = data;
                        logWorkItem($scope, $http, $scope.finalWorkItems, $scope.previousAgents, eventName, $scope.user.userName, $scope.previousCampaign, campaign, "Assign", "Success");
                    });
                    informerService.inform($scope.finalWorkItems.length + displayMessage);
                }).
                error(function (error) {
                    console.log("Could not update work item:  " + error);
                    informerService.inform("Error updating work item");
                });
        }

    };

    $scope.getUserDataFromDB = function () {

        $scope.allAgents = [];
        $scope.agentsList = [];

        $http.get('/api/UserData').
            success(function (userData) {
                $scope.userData = userData.UserData;

                // Make a list of agents in the UserData
                var length = $scope.userData.length;
                for (var i = 0; i < length; i++) {
                    var user = $scope.userData[i];
                    if (user.roles) {
                        for (var j = 0; j < user.roles.length; j++) {
                            if (user.roles[j] === "AGENT") {
                                if (user.isActive) {
                                    $scope.allAgents.push({_id: user._id, fullName: user.fullName, name: user.userName});
                                }
                            }
                        }
                    }
                }
                $scope.agentsList = $scope.allAgents;

                if ($routeParams.id != null && ($scope.selectedCampaign && $scope.selectedCampaign["name"] != "GenPop")) {
                    $scope.AgentsPop($routeParams.id);
                    $scope.checkGenpop = false;
                }

            }).
            error(function (error) {
                informerService.inform(" in getUserDataFromDB error: " + error);
            });
    };


    //to show the title and date in work item details page
    $scope.checkGenpop = true;
    $scope.campaignName = "";
    $scope.campaignStartDate = "";
    $scope.campaignEndDate = "";
    //Repopulate the Agent drop down
    $scope.changefocus = function () {
        $('option').click(function () {
            $('select').blur();
        });
    }
    $scope.AgentsPop = function (selectedCampaignID) {


        var campaignAgentsList = [];
        $scope.agentsList = [];
        if (selectedCampaignID) {
            $http.get('/api/getCampaignById/' + selectedCampaignID).
                success(function (data) {

                    console.log("api getcampaign by id success " + JSON.stringify(data));
                    campaignAgentsList = data.Campaign[0].agents;

                    if ($routeParams.id != null) {

                        $scope.campaignName = data.Campaign[0].name;
                        $scope.campaignStartDate = moment(data.Campaign[0].startDate);
                        $scope.campaignEndDate = moment(data.Campaign[0].endDate);

                    }

                    for (var i = 0; i < campaignAgentsList.length; i++) {
                        var campaignAgent = campaignAgentsList[i];
                        for (var j = 0; j < $scope.allAgents.length; j++) {
                            if (campaignAgent.name == $scope.allAgents[j].name) {
                                $scope.agentsList.push($scope.allAgents[j]);
                            }
                        }
                    }
                }).
                error(function () {
                    informerService.inform(" error ");

                });

        } else {
            $scope.selectedAgent = {};
            $scope.getUserDataFromDB();
        }

    }

    $scope.getUserDataFromDB();
    $scope.getAllCampaignsList();



//    // OK now that all functions are defined, start the load chain
    $http.get('/api/user/').success(function (data) {

        console.log("loaded user " + JSON.stringify(data));

        $scope.user = data;
        $scope.ConfigureGridForAgent($scope.user.role);

        // Now get the master data

        // OK now that all functions are defined, start the load chain
        $scope.getMasterDataFromDB();
    }).error(function (error) {
            console.log("api get user error! " + JSON.stringify(error));
            informerService.inform(error);

        });


} // End of GenPopCtrl
