/**
 * Created with IntelliJ IDEA.
 * User: spoujula
 * Date: 1/5/13
 * Time: 11:27 AM
 * To change this template use File | Settings | File Templates.
 */
//get current logged in user (reusable function)
var getUser = function (http, scope) {
    http.get('/api/user/').success(function (data) {
        scope.user = data;
        scope.userFullName = scope.user.firstname + " " + scope.user.lastname;
    });
}

var formatDate = function (dt) {
    return  dt.replace(/-/gi, "/");
}

/**
 * get the count for the total work items in the grid
 * @param scope
 * @param http
 * @param routeParams
 * @param domUtilityService
 */
var getFilterRecordCount = function (scope, http, routeParams, domUtilityService) {
    var userRole = scope.user.role;
    var apiGet = '/api/getFilterRecordCount';

    // if user in the campaign work items page
    if (routeParams.id) {
        var config =
        {
            params: {
                role: userRole
            }
        };
        apiGet += '/' + routeParams.id;

        //set if user clicks on the "Total Items in Hold" in campaign page
    } else if (routeParams.hold == "hold") {
        var config =
        {
            params: {
                hold: 1,
                role: userRole
            }
        };
        //set if user clicks on the "attention required" in campaign page
    } else if (routeParams.hold == "attention") {
        var config =
        {
            params: {
                attention: 1,
                role: userRole
            }
        };
    }

    console.log("getting: [" + apiGet + "]");

    // get the count matching the filter data
    http.get(apiGet, config)
        .success(function (data) {
            console.log("got count data: " + JSON.stringify(data));

            scope.gridOptions.totalServerItems = data.count;
            scope.pagingOptions.totalPages = Math.ceil(
                scope.gridOptions.totalServerItems / scope.pagingOptions.pageSize);
        })
        .error(function (data, status, headers, config) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            console.log("Error loading master data!  data: " + JSON.stringify(data) +
                " status: " + status +
                " headers: " + JSON.stringify(headers) +
                " config: " + JSON.stringify(config));
            scope.countErrorMsg = false;
        });
}

/**
 * get "Total Items in Hold" and "attention required"
 * @param scope
 * @param http
 */
var getHoldBucketStatistics = function (scope, http) {

    var apiGet = '/api/getHoldBucketStatistics';

    scope.loadingHoldFlag = "Loading Hold details ...."

    console.log("getting: [" + apiGet + "]");

    http.get(apiGet)
        .success(function (data) {

            // FYI, updated server return data:
            // getHoldBucketStatistics data:
            // {"agentHoldWorkItems":2,"attentionRequiredItems":1}
//            console.log("getHoldBucketStatistics data: " + JSON.stringify(data));

            scope.totalHoldWorkItems = data.agentHoldWorkItems;
            scope.attentionRequiredItems = data.attentionRequiredItems;

            scope.loadingHoldFlag = "";

        })
        .error(function (data, status, headers, config) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            scope.statErrorMsg = false;
        });
}

/**
 * set the year to 4 digit if user enters 2 digit year.
 */

var validYear = function (DateVal) {

    var yr = formatDate(DateVal).split("/");
    var  year = yr[2];

    if (!isNaN(year)) {
    //if entered year is below 50 and above 00 then interpret as 20XX
    if (parseInt(year) >= 0 && parseInt(year) < 50) {

        year = (year.length<2)?parseInt("20" + "0"+year):parseInt("20" + year);
        //if entered year is above 50 and below 100 then interpret as 19XX
    } else if (parseInt(year) >= 50 && parseInt(year) < 100) {
        year = parseInt("19" + year);
    }

    if (parseInt(year) < 1950) {
        return false;
    }

    var DateVal = new Date(formatDate(DateVal));

    DateVal.setYear(year);
    var DateVal1 = moment(DateVal).format("MM/DD/YYYY");

    return DateVal1;

    } else {
        return false;
    }
}
/**
 *
 * @param pickerId
 * @param scope
 * @param filterName
 * @param index
 * @param boxId
 */

var datePickerTypeHandler = function (pickerId, scope, filterName, index, boxId) {

    scope.errMsgMinSvnDateFlag = false;
    scope.errMsgDropDateFlag = false;

    //triggers when the user types date manually
    $(boxId).keyup(function () {

        //set the variables while user is typing date manually
        var typeDate = formatDate($(boxId).val());

        //To avoid issues with Firefox & IE
        var DateVal1 = $(boxId).val();
        //check whether date entered by the user is valid or not
        if(DateVal1 == "")
            DateVal1 = moment().format("MM/DD/YYYY");

        var err = moment(DateVal1, "MM/DD/YYYY").isValid();

        if (filterName == "startDate") {

            var momentDate = moment(validYear(typeDate)).format("MM/DD/YYYY");
            scope.campaign.startDate = momentDate;

        } else if (filterName == "endDate") {

            var momentDate = moment(validYear(typeDate)).format("MM/DD/YYYY");

            scope.campaign.endDate = momentDate;
        }
        var dateMatch = DateVal1.match(/^(\d{1,2})\-(\d{1,2})\-(\d{1,4})$/);

        if (dateMatch != null && err) {

            var now = validYear(typeDate);

            switch(pickerId){

                case "#minSvcEndDate":
                $("#maxSvcEndDate").datepicker('setValue', moment(now).toDate())
                    break;
                case "#startDate":
                    $("#endDate").datepicker('setValue', moment(now).toDate())
                    break;
                case "#minDropDate":
                    $("#maxDropDate").datepicker('setValue', moment(now).toDate())
                    break;
            }
        }
    });
};

/**
 * @param pickerId
 * @param scope
 * @param filterName
 * @param index
 * @param boxId
 */
var datePickerChangeHandler = function (pickerId, scope, filterName, index, boxId) {

    //triggers when user changes date in the date picker
    $(pickerId)
        .datepicker()
        .on('changeDate', function (event) {

            if (filterName == "serviceEndDate") {
                //set error messages
                scope.errMsgSvnDateText = "";
                scope.errMsgMinSvnDateFlag = false;

            } else if (filterName == "dropStatusDate") {
                //set error messages
                scope.errMsgDropDateText = "";
                scope.errMsgDropDateFlag = false;

            }
            var element = $(pickerId);

            if (filterName == "startDate") {

                var momentDate = moment(event.date);
                scope.campaign.startDate = momentDate.format("MM/DD/YYYY");

            } else if (filterName == "endDate") {

                var momentDate = moment(event.date);
                scope.campaign.endDate = momentDate.format("MM/DD/YYYY");

            }else if (filterName == "dateField") {

                var momentDate = moment(event.date);
                scope.selectedDateValue = momentDate.format("MM-DD-YYYY") ;

            } else if (filterName == "reminderDate") {
                //set changed date to the date picker
                $('#reminderDate').datepicker('setValue', moment(event.date).clone());

            } else {
                //set changed date to the filters
                scope.filters[filterName][index] = moment(event.date).clone();
                console.log('date change fired on picker ' + pickerId +
                    ' filter name: ' + filterName +
                    ' index: ' + index +
                    ' new value: ' + scope.filters[filterName][index]);

                console.log('date iso string is ' +
                    scope.filters[filterName][index].toDate().toISOString());

            }

            //set value in the date text box
            $(boxId).val(moment(event.date).format("MM-DD-YYYY"));
            element.datepicker('hide');

        });
};

/**
 * validates manually entered date values
 * @param scope
 * @param pickerId
 * @param filterName
 * @param index
 * @param boxId
 * @return {boolean}
 */
var dateValidateFn = function (scope, pickerId, filterName, index, boxId) {

    var DateVal = $(boxId).val();
    if (DateVal != undefined) {
        var dateMatch = DateVal.match(/^(\d{1,2})\-(\d{1,2})\-(\d{1,4})$/);

        var flag = true;
        if (DateVal != "") {
            //To avoid issues with Firefox & IE
            var DateVal1 = formatDate($(boxId).val());
            var err = moment(DateVal1, "MM/DD/YYYY").isValid();

            if (dateMatch == null) {
                err = false;
            }

            var newDate = validYear(DateVal1);


            if (!err) {

                if (filterName == "serviceEndDate") {

                    scope.errMsgSvnDateText = "Please enter a valid Svc End Date";

                    if (boxId == "#minSvcEndDateText")
                        scope.errminSvcEndDateFlag = true;

                    if (boxId == "#maxSvcEndDateText")
                        scope.errmaxSvcEndDateFlag = true;

                } else if (filterName == "dropStatusDate") {

                    scope.errMsgDropDateText = "Please enter a valid Drop Date";
                    if (boxId == "#minDropDateText")
                        scope.errminDropDateFlag = true;

                    if (boxId == "#maxDropDateText")
                        scope.errmaxDropDateFlag = true

                }else if(filterName == "startDate"){

                    scope.errCampMsg = "enter valid start date";
                    scope.errstartDateFlag = true;

                }else if(filterName == "endDate"){

                    scope.errCampMsg = "enter valid end Date";
                    scope.errstartDateFlag = true;

                }
                $(boxId).val('');
                flag = false;

            } else if (err && newDate != false) {

                if (filterName == "serviceEndDate") {

                    scope.filters[filterName][index] = moment(newDate);
                    if (boxId == "#minSvcEndDateText")
                        scope.errminSvcEndDateFlag = false;
                    if (boxId == "#maxSvcEndDateText")
                        scope.errmaxSvcEndDateFlag = false;

                    scope.errMsgSvnDateText = "";

                } else if (filterName == "dropStatusDate") {

                    scope.filters[filterName][index] = moment(newDate);
                    scope.errMsgDropDateText = "";

                    if (boxId == "#minDropDateText")
                        scope.errminDropDateFlag = false;
                    if (boxId == "#maxDropDateText")
                        scope.errmaxDropDateFlag = false;

                }else if(filterName == "startDate"){
                    scope.errCampMsg = "";

                }else if(filterName == "endDate"){
                    scope.errCampMsg = "";

                }
                flag = true;

            } else {

                if (filterName == "serviceEndDate") {

                    scope.errMsgSvnDateText = "Please enter a valid Svc End Date";
                    if (boxId == "#minSvcEndDateText")
                        scope.errminSvcEndDateFlag = true;
                    if (boxId == "#maxSvcEndDateText")
                        scope.errmaxSvcEndDateFlag = true

                } else if (filterName == "dropStatusDate") {

                    scope.errMsgDropDateText = "Please enter a valid Drop Date";
                    if (boxId == "#minDropDateText")
                        scope.errminDropDateFlag = true;

                    if (boxId == "#maxDropDateText")
                        scope.errmaxDropDateFlag = true


                } else  if(filterName == "startDate"){
                    scope.errCampMsg = "enter valid start date";

                }else if(filterName == "endDate"){
                    scope.errCampMsg = "enter valid end Date";

                }else if(filterName == "reminderDate"){
                    scope.errRemDateMsg = "enter valid Reminder Date";

                }
                $(boxId).val('');
                flag = false;
            }
        }
        return flag;
    }
}

/**
 * log the agent and work items assignment actions in audit table in db
 * @param $scope
 * @param $http
 * @param selectedWorkItems
 * @param previousWorkItems
 * @param event
 * @param admin
 * @param previousCampaign
 * @param selectedCampaign
 * @param action
 * @param status
 */

var logWorkItem = function ($scope, $http, selectedWorkItems, previousWorkItems, event, admin, previousCampaign, selectedCampaign, action, status) {

    var workItemsToLog = [];
    if (event == "Work Item Action") {
        for (var j = 0; j < selectedWorkItems.length; j++) {
            var item = selectedWorkItems[j];
            var row = {"event": event, "byWhom": admin, "from": previousCampaign["name"], "fromId": previousCampaign["_id"],
                "to": selectedCampaign["name"], "toId": selectedCampaign["_id"], "workItemId": item["_id"],
                "action": action, "status": status};

            workItemsToLog.push(row);
        }
    }
    if (event == "Agent Action") {

        for (var i = 0; i < selectedWorkItems.length; i++) {
            var item = selectedWorkItems[i];

            for (var j = 0; j < previousWorkItems.length; j++) {
                var previousItem = previousWorkItems[j];
                if (item["_id"] == previousItem["_id"]) {
                    var row = {"event": event, "byWhom": admin, "from": previousItem["repUserName"], "fromId": previousItem["repUserName"],
                        "to": item["repUserName"], "toId": item["repUserName"], "workItemId": item["_id"],
                        "action": action, "status": status};

                    workItemsToLog.push(row);
                }

            }

        }

    }

    if (event == "both") {

        for (var i = 0; i < selectedWorkItems.length; i++) {
            var campaignItem = selectedWorkItems[i];

            var campaignRow = {"event": "Work Item Action", "byWhom": admin, "from": previousCampaign["name"], "fromId": previousCampaign["_id"],
                "to": selectedCampaign["name"], "toId": selectedCampaign["_id"], "workItemId": campaignItem["_id"],
                "action": action, "status": status};

            workItemsToLog.push(campaignRow);

            for (var j = 0; j < previousWorkItems.length; j++) {
                var previousItem = previousWorkItems[j];
                if (campaignItem["_id"] == previousItem["_id"]) {
                    var agentRow = {"event": "Agent Action", "byWhom": admin, "from": previousItem["repUserName"], "fromId": previousItem["repUserName"],
                        "to": campaignItem["repUserName"], "toId": campaignItem["repUserName"], "workItemId": campaignItem["_id"],
                        "action": action, "status": status};

                    workItemsToLog.push(agentRow);
                }

            }

        }

    }


    $http.post('/api/logWorkItem', workItemsToLog).success(function () {
        $scope.previousAgents = [];
        console.log(" in audit success");

    }).error(function () {
            console.log(" in audit error");
        })
}

var getEmptyFilters = function () {
    return {
        normalizedAnnualUsage: ["", ""],
        aggregatekWh: ["", ""],
        aggregateGas: ["", ""],
        annualkWh: ["", ""],
        annualGasUsage: ["", ""],
        aggregateGreenkWh: ["", ""],
        cashbackBalance: ["", ""],
        monthsUntilCashAward: ["", ""],
        serviceEndDate: [],
        monthsActive: ["", ""],
        monthsSinceDropped: ["", ""],
        pricing: ["", ""],
        dropStatusMapped: null,
        dropStatusDate: [],
        utilityState: [],
        utilityAbbr: [],
        accountNumber: "",
        partner: [],
        contactName: "",
        dropRep: "",
        accountType: "",
        commodity: 'All',
        dropType: 'All'
    };
};


function initializeGrid($scope, $routeParams) {

    console.log("initialize Grid @ " + moment().format());
// ng-grid definition

    $scope.getPendingAgentTitle = function (agent, pendingAgent) {

        var result = agent;
        if (pendingAgent) {
            result = "Pending change to " + pendingAgent;
        }

        return result;
    };

    $scope.getAgentText = function (agent) {

        if (agent && agent.length && agent.length > 0) {
            return agent;
        } else {
            return "--";
        }

    };

    //grid column default configuration
    $scope.getDefaultGridColumns = function () {
        var defaultColumnSpec = [];

        defaultColumnSpec.push(
            {
                field:'calculated.dropDays',
                displayName:'Drop Days',
                width:80
            }
        );
        defaultColumnSpec.push(
            {
                field:'dropStatusMapped',
                displayName:'EP Status',
                width:85,
                minWidth:66
            }
        );
        defaultColumnSpec.push(
            {
                field: 'accountNumber',
                displayName: 'Acct No.',
				cellTemplate: '<div ><a onclick=' +
                    '\"window.open(\'{{row.getProperty(\'url\')}}\',\'Popup\',\'' +
                    'width=520,height=400,left=430,top=23\'); return false;" ' +
                    'target="_blank" href=\"{{row.getProperty(\'url\')}}"> ' +
                    '{{row.getProperty(\'accountNumber\')}} </a><div>',
                width: 165
            });
        defaultColumnSpec.push(
            {
                field: 'accountName',
                displayName: 'Acct Name',
                width: 125
            });
        defaultColumnSpec.push(
            {
                field: 'normalizedAnnualUsage',
                displayName: 'Norm. Ann Usage',
                width: 125,
                cellClass: 'numberCell',
                cellFilter: 'number:0'
            });
        defaultColumnSpec.push(
            {
                field: 'aggregatekWh',
                displayName: 'Aggr kWh',
                cellClass: 'numberCell',
                cellFilter: 'number:0'
            });
        defaultColumnSpec.push(
            {
                field: 'annualkWh',
                displayName: 'Ann kWh',
                cellClass: 'numberCell',
                cellFilter: 'number:0'
            });
        defaultColumnSpec.push(
            {
                field: 'aggregateGas',
                displayName: 'Aggr Gas',
                cellClass: 'numberCell',
                cellFilter: 'number:0'
            });
        defaultColumnSpec.push(
            {
                field: 'annualGasUsage',
                displayName: 'Ann Gas',
                cellClass: 'numberCell',
                cellFilter: 'number:0'
            });
        defaultColumnSpec.push(
            {
                field: 'uom',
                displayName: 'UOM'
            });
        defaultColumnSpec.push(
            {
                field: 'meters',
                displayName: 'Meters'
            });
        defaultColumnSpec.push(
            {
                field: 'pricing',
                displayName: 'Pricing'
            });

        defaultColumnSpec.push(
            {
                field: 'utilityName',
                displayName: 'Utility',
                width: 125
            });
        defaultColumnSpec.push(
            {
                field: 'utilityState',
                displayName: 'State',
                width: 50,
                minWidth: 50
            });
        defaultColumnSpec.push(
            {
                field: 'cashbackBalance',
                displayName: 'Award Bal.',
                cellClass: 'numberCell',
                cellFilter: 'currency',
                width: 72
            });
        defaultColumnSpec.push(
            {
                field: 'calculated.monthsUntilCashAward',
                displayName: 'Mo. Till Award',
                cellFilter: 'number',
                width: 95
            });
        defaultColumnSpec.push(
            {
                field: 'calculated.monthsActive',
                displayName: 'Mo. Active',
                cellFilter: 'number',
                width: 80
            });
        defaultColumnSpec.push(
            {
                field: 'calculated.monthsSinceDropped',
                displayName: 'Mo. Drop',
                cellFilter: 'number'
            });
        defaultColumnSpec.push(
            {
                field: 'numOfInvoices',
                displayName: 'Invoices'
            });
        defaultColumnSpec.push(
            {
                field: 'saveCount',
                displayName: 'Save Count',
                width: 80
            });

        //grid column default configuration for ADMIN user
        if ($scope.user && $scope.user.role === 'ADMIN') {
            defaultColumnSpec.push(
                {field: 'dropRep',
                    displayName: 'Agent',
                    cellTemplate: '<div ng-class="{greenCell: row.getProperty(\'acmeData.pendingAgent\') != null}">' +
                        '<div class="ngCellText" ' +
                        'title="{{getPendingAgentTitle(row.getProperty(\'dropRep\'),' +
                        'row.getProperty(\'acmeData.pendingAgent.fullName\'))}}">' +
                        '{{getAgentText(row.getProperty(col.field))}}</div></div>',
                    width: 125 });
        }


        defaultColumnSpec.push({
            field: 'serviceStartDate',
            displayName: 'Svc Start',
            cellFilter: "date:'yyyy-MM-dd'",
            width: 80
        });
        defaultColumnSpec.push({
            field: 'serviceEndDate',
            displayName: 'Svc End',
            cellFilter: "date:'yyyy-MM-dd'",
            width: 80
        });
        defaultColumnSpec.push({
            field: 'cashbackDueDate',
            displayName: 'Award Due',
            cellFilter: "date:'yyyy-MM-dd'",
            width: 80
        });
        defaultColumnSpec.push({
            field: 'dropStatusDate',
            displayName: 'Drop Date',
            cellFilter: "date:'yyyy-MM-dd'",
            width: 80
        });
        defaultColumnSpec.push({
            field: 'dropStatus',
            displayName: 'Status',
            width: 125
        });
        defaultColumnSpec.push({
            field: 'dropType',
            displayName: 'Type',
            width: 90
        });
        defaultColumnSpec.push({
            field: 'premiseStatus',
            displayName: 'Premise',
            width: 90
        });
        defaultColumnSpec.push({
            field: 'partner',
            displayName: 'Partner',
            width: 125
        });
        defaultColumnSpec.push({
            field: 'contactName',
            displayName: 'Contact Name',
            width: 125
        });

        defaultColumnSpec.push({
            field: 'commodity',
            displayName: 'Commodity',
            width: 100
        });

        defaultColumnSpec.push({
            field: 'promotion',
            displayName: 'Promotion',
            width: 150
        });
        defaultColumnSpec.push(
            {
                field: 'aggregateGreenkWh',
                displayName: 'Aggr. Green kWh',
                cellClass: 'numberCell',
                cellFilter: 'number:0',
                width: 125
            });

        defaultColumnSpec.push({
            field: 'greenIndicator',
            displayName: 'Green Indicator',
            width: 100
        });
        defaultColumnSpec.push(
            {
                field: 'masterCustomerID',
                displayName: 'Master Id'
            });

        if ($scope.user && $scope.user.role === 'AGENT') {
            defaultColumnSpec.push({
                field: 'reminderDate',
                displayName: 'Reminder Date',
                cellFilter: "date:'yyyy-MM-dd'",
                width: 80
            });
            defaultColumnSpec.push({
                field: 'onHold',
                displayName: 'On Hold',
                width: 80
            });
        }
        var customHeaderCellTemplate =
            "<div class=\"ngHeaderSortColumn {{col.headerClass}}\" " +
                "ng-style=\"{'cursor': col.cursor}\" " +
                "ng-class=\"{ 'ngSorted': !noSortVisible }\">" +
                "    <div ng-click=\"col.sort($event)\" ng-class=\"'colt' + col.index\" class=\"ngHeaderText\" title=\"{{col.displayName}} \">{{col.displayName}}</div>" +
                "    <div class=\"ngSortButtonDown\" ng-show=\"col.showSortButtonDown()\"></div>" +
                "    <div class=\"ngSortButtonUp\" ng-show=\"col.showSortButtonUp()\"></div>" +
                "    <div class=\"ngSortPriority\">{{col.sortPriority}}</div>" +
                "    <div ng-class=\"{ ngPinnedIcon: col.pinned, ngUnPinnedIcon: !col.pinned }\" ng-click=\"togglePin(col)\" ng-show=\"col.pinnable\"></div>" +
                "</div>" +
                "<div ng-show=\"col.resizable\" class=\"ngHeaderGrip\" ng-click=\"col.gripClick($event)\" ng-mousedown=\"col.gripOnMouseDown($event)\"></div>";


        for (var i = 0; i < defaultColumnSpec.length; i++) {
            var col = defaultColumnSpec[i];
            col.headerCellTemplate = customHeaderCellTemplate;
            col.visible = true;
            if (!col.width) {
                col.width = 66;
            }

            if (!col.minWidth) {
                col.minWidth = 66;
            }
        }

        return defaultColumnSpec;
    }

    // TODO: Bug: Sorting certain columns causes a js crash
    // TODO: Bug: styling of columns, rows and cell data


    // For ng-grid selections:
    $scope.selectedWorkItems = [];

    $scope.filterOptions = {
        filterText: "",
        useExternalFilter: false
    };

    $scope.pagingOptions = {
        pageSizes: [10, 25, 50, 200],
        pageSize: 25,
//        totalServerItems:0,
        totalPages: 0,
        currentPage: 1
    };

    $scope.gridSortInfo = { fields: [], directions: [] };


    // TODO: Test these functions and enable/disable next/prev pages if we keep this
    $scope.nextPage = function () {
        console.log("next page");

        if ($scope.pagingOptions.currentPage * $scope.pagingOptions.pageSize
            < $scope.gridOptions.totalServerItems)
            $scope.pagingOptions.currentPage++;
    };

    // TODO: Test these functions and enable/disable next/prev pages if we keep this
    $scope.previousPage = function () {
        console.log("previous page");

        if ($scope.pagingOptions.currentPage > 1) {
            $scope.pagingOptions.currentPage--;
        }
    };

    // Watch the grid column collection (in the grid scope) to see changes to the
    // widths, visibilties etc driven by the user
    // TODO: How to handle drag/rearrangement?
    $scope.watchGridColumnChange = function () {

        console.log("gridOptions.$gridScope.columns watch trigger @ " + moment().format('h:mm:ss.SSS'));

        if (!$scope.loadingFlag) {
            if ($scope.gridOptions.$gridScope.columns) {

                var saveGrid = false;

                angular.forEach($scope.gridOptions.$gridScope.columns,
                    function (column, i) {
                        if (column.field) {

                            angular.forEach($scope.gridColumnDefs, function (columnDef) {
                                if (columnDef.field === column.field) {

                                    // Kind of a hack, but a resize will define the orig. width
                                    if (column.origWidth) {
                                        columnDef.width = column.width;
                                        columnDef.save = true;
                                        saveGrid = true;
                                        console.log("set field [" + columnDef.field + "] to width: [" + columnDef.width + "] (from: " + column.origWidth + ")");
                                    }

                                    if (column.visible != columnDef.visible) {

                                        columnDef.visible = column.visible;
                                        columnDef.save = true;
                                        saveGrid = true;
                                        console.log("set field [" + columnDef.field + "] to visible: [" + columnDef.visible + "] ");
                                    }
                                }
                            });
                        }
                    });


            } else {
                console.log("grid scope but no columns");
            }
        } else {
            console.log("loading so skipping column copy");
        }

        if (saveGrid) {
            if (!$scope.saveGridTimeOutPending) {
                $scope.saveGridTimeOutPending = true;
                console.log("setting grid save timeout at " + moment().format('h:mm:ss.SSS'));
                setTimeout(function () {

                    console.log("starting timeout save function at " + moment().format('h:mm:ss.SSS'));

                    // TODO: how to test inside timeout
                    $scope.saveGridConfiguration();

                    $scope.saveGridTimeOutPending = false;
                }, 3000);
            } else {
                console.log("save pending so not setting timeout");
            }
        }
    };

    $scope.saveGridTimeOutPending = false;

    $scope.$watch('gridOptions.$gridScope.columns', $scope.watchGridColumnChange, true);

    // Watch the paging options to trigger data refresh from server
    // TODO: how to test?
    $scope.$watch('pagingOptions', function () {
        console.log("pagingOptions watch trigger @ " + moment().format());

        if (!$scope.loadingFlag) {
            console.log("Getting page " + $scope.pagingOptions.currentPage);

            $scope.loadingFlag = true;
            $scope.loadingStatus = "Getting page " + $scope.pagingOptions.currentPage;

            $scope.getWorkItemsFromDb();
        } else {
            console.log("Work item load request skipped as already loading");
        }

    }, true);


    // grid emits a sort event, with col info
    // $scope.$emit('ngGridEventSorted', col);

    // Could also watch the gridSortInfo object instead.  Not sure there's much difference

    // TODO: Research testing of angular event handlers/watchers
    $scope.respondToSortEvent = function (event, columnInfo) {

        console.log('ngGridEventSorted event: loading ' + $scope.loadingFlag);

        if (columnInfo && !$scope.loadingFlag &&
            $scope.activeUserData && $scope.activeUserData.configuration) {

            var config = $scope.activeUserData.configuration;

            console.log("Got sort info fields '" + JSON.stringify(columnInfo.fields) +
                "' directions '" + JSON.stringify(columnInfo.directions) +
                "'");
            config.grid[0].sortInfo = {
                direction: columnInfo.directions[0] ? columnInfo.directions[0] : 'asc',
                field: columnInfo.fields[0]
            };

            // save the grid config & reload the work items
            $scope.loadingFlag = true;
            $scope.loadingStatus = "saving grid sort info";
            $scope.setGridSortInfo($scope.activeUserData);

            $scope.saveGridConfiguration($scope.getWorkItemsFromDb);
        }
        else {
            var field = columnInfo ? columnInfo.field : 'no field';

            console.log('ngGridEventSorted: loading ' + $scope.loadingFlag + " columnInfo " + field);
        }
    };

    $scope.$on('ngGridEventSorted', $scope.respondToSortEvent);


    //intialize grid configuration
    $scope.gridOptions.data = 'displayItems';


    $scope.gridOptions.enablePaging = true;
    $scope.gridOptions.pagingOptions = $scope.pagingOptions;
    $scope.gridOptions.filterOptions = $scope.filterOptions;
    $scope.gridOptions.showColumnMenu = true;
    $scope.gridOptions.enableRowSelection = true;
    $scope.gridOptions.multiSelect = true;
    $scope.gridOptions.selectedItems = $scope.selectedWorkItems;

    // primary key for selection identification
    $scope.gridOptions.primaryKey = "_id";

    $scope.gridOptions.useExternalSorting = true;
    $scope.gridOptions.sortInfo = $scope.gridSortInfo;
    $scope.gridOptions.enableColumnResize = true;
    $scope.gridOptions.showSelectionCheckbox = true;
    $scope.gridOptions.enableColumnReordering = false;
    $scope.gridOptions.showFooter = true;

    // server item count moved from pagingOptions to gridOptions in 2.0.4
    $scope.gridOptions.totalServerItems = null;


    $scope.displayItems = [{}];

    // TODO: unit test this function
    $scope.displayHoldStyle = function (holdBucket) {

        var result = false;

        if ($routeParams && $routeParams.hold !== 'hold') {
            if (holdBucket && holdBucket.length > 0) {
                angular.forEach(holdBucket, function (bucket) {
                    if (bucket.agent === $scope.user.userName) {

                        result = true;
                    }
                });
            }
        }

        return result;
    }

    // Row template to support do not call flag (future-proofing for when API can write flag
    // also highlight whole row for agent assigment or on hold...
    $scope.gridOptions.rowTemplate = '<div ' +
        'class="ngCell {{col.cellClass}} {{col.colIndex()}}" ' +
        'ng-class="{' +
        'newAgentStyle: row.getProperty(\'acmeData.pendingAgent\')' +
        ', ' +
        'doNotCallStyle: row.getProperty(\'doNotCall\')' +
        ', ' +
        'holdBucketStyle: displayHoldStyle(row.getProperty(\'holdBucket\'))' +
        '}" ' +
        'ng-style="{ \'cursor\': row.cursor }" ' +
        'ng-repeat="col in renderedColumns" ' +
        'ng-cell></div>';


    $scope.gridOptions.footerRowHeight = 46;

    // TODO: Investigate bug with grid version 2.0.4 that maxRows()/totalServerItems are not defined and so we have to poke out of the footerscope into the parent scope (us), which seems hacky (Mikey)
    $scope.gridOptions.footerTemplate =
        "<div class=\"ngFooterPanel\" ng-class=\"{'ui-widget-content': jqueryUITheme, 'ui-corner-bottom': jqueryUITheme}\" ng-style=\"footerStyle()\">" +
            "    <div class=\"span4 ngTotalSelectContainer\" >" +
            "        <div class=\"ngFooterTotalItems\" ng-class=\"{'ngNoMultiSelect': !multiSelect}\" >" +
            "            <span class=\"ngLabel\">{{i18n.ngTotalItemsLabel}} {{$parent.gridOptions.totalServerItems | number: 0}}</span><span ng-show=\"filterText.length > 0\" class=\"ngLabel\">({{i18n.ngShowingItemsLabel}} {{totalFilteredItemsLength()}})</span>" +
            "            <span class=\"ngLabel\"  ng-show=\"multiSelect && selectedItems.length > 0\" > -- {{i18n.ngSelectedItemsLabel}} {{selectedItems.length}}</span>" +
            "        </div>" +
            "    </div>" +
            "<div class=\"span4 rstButton\">" +

            "<button type=\"button\" class=\"btn\" ng-click=\"resetGridColumns()\">Reset Grid</button>" +
            "</div>" +
            "    <div class=\"span4 ngPagerContainer\" style=\"float: right; margin-top: 10px; margin-left:0\" ng-show=\"enablePaging\" ng-class=\"{'ngNoMultiSelect': !multiSelect}\">" +

            "        <div style=\"float:right;  line-height:25px;\" class=\"ngPagerControl ngbottomControl\" >" +
            "            <button class=\"ngPagerButton epPagerButton\" ng-click=\"pageToFirst()\" ng-disabled=\"cantPageBackward()\" title=\"{{i18n.ngPagerFirstTitle}}\"><div class=\"ngPagerFirstTriangle\"><div class=\"ngPagerFirstBar\"></div></div></button>" +
            "            <button class=\"ngPagerButton epPagerButton\" ng-click=\"pageBackward()\" ng-disabled=\"cantPageBackward()\" title=\"{{i18n.ngPagerPrevTitle}}\"><div class=\"ngPagerFirstTriangle ngPagerPrevTriangle\"></div></button>" +
            "            <input class=\"ngPagerCurrent epPagerButton\" type=\"number\" style=\"width:50px; height: 24px; margin-top: 1px; padding: 0 4px;\" ng-model=\"pagingOptions.currentPage\"/>" +
            "            <button class=\"ngPagerButton epPagerButton\" ng-click=\"pageForward()\" ng-disabled=\"cantPageForward()\" title=\"{{i18n.ngPagerNextTitle}}\"><div class=\"ngPagerLastTriangle ngPagerNextTriangle\"></div></button>" +
            "            <button class=\"ngPagerButton epPagerButton\" ng-click=\"pageToLast()\" ng-disabled=\"cantPageToLast()\" title=\"{{i18n.ngPagerLastTitle}}\"><div class=\"ngPagerLastTriangle\"><div class=\"ngPagerLastBar\"></div></div></button>" +
            "        </div>" +
            "        <div style=\"float:right; margin-right: 10px;\" class=\"ngRowCountPicker\">" +
            "            <span style=\"float: left; margin-top: 3px;\" class=\"ngLabel\">{{i18n.ngPageSizeLabel}}</span>" +
            "            <select style=\"float: left;height: 27px; width: 100px\" ng-model=\"pagingOptions.pageSize\" >" +
            "                <option ng-repeat=\"size in pagingOptions.pageSizes\">{{size}}</option>" +
            "            </select>" +
            "        </div>" +
            "    </div>" +
            "</div>";


    // plugins
    $scope.gridOptions.plugins = [new ngGridFlexibleHeightPlugin( {extraHeight:21})];


    $scope.resetGridColumns = function () {

        console.log("verbose resetGridColumns (columns) @ " + moment().format())
        $scope.gridColumnDefs = $scope.getDefaultGridColumns();
        $scope.pagingOptions.pageSize = 25;
        $scope.activeUserData.configuration.grid = $scope.initializeGridConfiguration(true);
        $scope.setGridSortInfo($scope.activeUserData);
        $scope.saveGridConfiguration();

    };
    $scope.gridOptions.columnDefs = 'gridColumnDefs';
}

/**
 *
 * @param activeCampaignsList
 * @param user
 * @param $filter
 * @return {*}
 */
function calculateWorkItemsSummary(activeCampaignsList, user, $filter) {


    function calculatePercentages(category, total) {
        if (total.workItems > 0) {
            category.workItemsPercentage = 100 * category.workItems / total.workItems;
        }
        if (total.kWh > 0) {
            category.kWhPercentage = 100 * category.kWh / total.kWh;
        }
        if (total.associatedAccounts > 0) {
            category.associatedAccountsPercentage = 100 * category.associatedAccounts / total.associatedAccounts;
        }
        if (total.associatedAccountskWh > 0) {
            category.associatedAccountskWhPercentage = 100 * category.associatedAccountskWh / total.associatedAccountskWh;
        }
    }

    function ContainsCategoryValue(sourceArray, category){
        for(var k=0; k< sourceArray.length; k++){
            var it =  sourceArray[k];
            if(it.category && it.category == category){
                return true;
            }
        }
        return false;
    }

    for (var i = 0; i < activeCampaignsList.length; i++) {

        var activeCampaign = activeCampaignsList[i];

        activeCampaign.workItemsExists = false;


        // Split the adminSummary into two blocks, Total & the categories.
        // Use the total to calculate the percentages and sum the categories and subtract from the total to get the 'other'

        // Angular's 'filter' filter (can be confusing)
        // Angular will copy each item in the source array to the
        // destination array  if the provided function returns true

        var sourceArray = null;
        var defaultCategoriesArray = [{"workItems":0,"kWh":0,"associatedAccounts":0,"associatedAccountskWh":0,"category":"Saved","order":1,"workItemsPercentage":0,"kWhPercentage":0,"associatedAccountsPercentage":0,"associatedAccountskWhPercentage":0},
            {"workItems":0,"kWh":0,"associatedAccounts":0,"associatedAccountskWh":0,"category":"Lost","order":2,"workItemsPercentage":0,"kWhPercentage":0,"associatedAccountsPercentage":0,"associatedAccountskWhPercentage":0},
            {"workItems":0,"kWh":0,"associatedAccounts":0,"associatedAccountskWh":0,"category":"Contacted","order":3,"workItemsPercentage":0,"kWhPercentage":0,"associatedAccountsPercentage":0,"associatedAccountskWhPercentage":0},
            {"workItems":0,"kWh":0,"associatedAccounts":0,"associatedAccountskWh":0,"category":"Not Contacted","order":4,"workItemsPercentage":0,"kWhPercentage":0,"associatedAccountsPercentage":0,"associatedAccountskWhPercentage":0},
            {"workItems":0,"kWh":0,"associatedAccounts":0,"associatedAccountskWh":0,"category":"Other","order":5,"workItemsPercentage":0,"kWhPercentage":0,"associatedAccountsPercentage":0,"associatedAccountskWhPercentage":0},
            {"workItems":0,"kWh":0,"associatedAccounts":0,"associatedAccountskWh":0,"category":"Total","order":6,"workItemsPercentage":0,"kWhPercentage":0,"associatedAccountsPercentage":0,"associatedAccountskWhPercentage":0}];
        if (user && user.role === 'AGENT') {

            sourceArray = $filter('filter')(activeCampaign.agentSummary, function (element) {

                var result = element.agent === user.userName;
                return result;
            });
        } else {
            sourceArray = activeCampaign.adminSummary;
        }

        var total = $filter('filter')(sourceArray, function (element) {
            return element.category === 'Total';
        });


        // sanity checks.  If there's data should have one total
        if (total && total.length === 1) {

            total = total[0];

            if( total.workItems > 0 ) {
                activeCampaign.workItemsExists = true;
                activeCampaign.totalWorkItems = total.workItems;
            }

            angular.forEach(sourceArray, function (category) {

                // Define the percentages of the total:
                calculatePercentages(category, total);
            });
            //ACME-487: check to display all the categories if they are not present
            for(var j=0; j< defaultCategoriesArray.length; j++){
                var exists = false;
                var item = {};
                if(!ContainsCategoryValue(sourceArray,defaultCategoriesArray[j].category)){
                    sourceArray.push(defaultCategoriesArray[j]);
                }
            }
        }
		else
		{
			sourceArray = defaultCategoriesArray;
          
		}

        activeCampaign.summary = $filter('orderBy')(sourceArray, 'order', false);
    }

    return activeCampaignsList;
}

/**
 * @param thingy
 */
function objectHelperLogger(thingy) {
    for (var key in thingy) {

        var thingType = typeof thingy[key];

        if (thingType === 'function') {
//            console.log('skipping function ' + key);
        } else if (thingType === 'object') {
            try {
                console.log("thingy key '" + key +
                    "' is val '" + JSON.stringify(thingy[key]) +
                    "' object, so recursing... ");
            } catch (e) {
                console.log("thingy key '" + key +
                    "' is non stringify val '" + thingy[key] +
                    "' object, so recursing... ");
            }


            console.log('Prototype of ' + key +
                ' is ' + Object.prototype.toString.apply(thingy[key]));

            if (confirm("recurse on " + key)) {
                objectHelperLogger(thingy[key]);
            }

            console.log('done with ' + key);

        } else {
            console.log("thingy key '" + key +
                "' is val '" + JSON.stringify(thingy[key]) +
                "' type '" + typeof thingy[key] +
                "'");
        }
    }
}

/**
 * @param val
 */

function slideToggle(val) {
    // show/hide slideToggle functionality
    if (val == '-') {
        $('#btnshow').hide();
        $('#btnhide').show();
    }
    if (val == '+') {
        $('#btnhide').hide();
        $('#btnshow').show();
    }
    $('#filters').slideToggle();
}

/**
 * this is the function used to get the appropriate url based on the item drop origin system
 * @param genpopdata - array of work items to prepare urls for
 * @param scope - scope containing reference info
 */

function getDropOriginSystem(genpopdata, scope) {

    for (var i = 0; i < genpopdata.length; i++) {
        if (parseInt(genpopdata[i].dropOriginSystem) == 1) {
            genpopdata[i].url = scope.eventIDURL + "" + genpopdata[i].eventID;
        } else {
            genpopdata[i].url = scope.accountNumberURL + "" + genpopdata[i].energyPlusID;
        }
    }
}


