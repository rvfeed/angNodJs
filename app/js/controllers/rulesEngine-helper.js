/**
 * Created with IntelliJ IDEA.
 * User: spoujula
 * Date: 1/5/13
 * Time: 11:37 AM
 * To change this template use File | Settings | File Templates.
 */

/**
 * helper function to check whether object is empty or not
 *      - returns true if object is empty
 *      - returns false if object is not empty
 *
 * @param object
 * @return {boolean}
 */
var isObjectEmpty = function (object) {
    var isEmpty = true;
    for (var key in object) {
        isEmpty = false;
        break; // exiting since we found that the object is not empty
    }
    return isEmpty;
};

/**
 * function to display manual rule lightbox when user clicks on
 * edit manual rule button
 *
 * @param $scope
 * @param $routeParams
 */
var editManualRule = function ($scope, $routeParams) {
    // variables declaration
    $scope.loadingFlag = true;
    $scope.loadingStatus = "Manual Campaign Rule Edit";
    // set the rule type to "manual" to process manual rule
    // specific functionality
    $scope.ruleType = "manual";
    $scope.summaryToDisplay = {};
    var exists = false;

    // check for existing rule of campaign
    if ($routeParams.id != null) {
        if ($scope.campaign["rules"].visualRule) {
            exists = true;
        }
    } else {
        if ($scope.finalFilters && $scope.finalFilters.length > 0) {
            exists = true;
        }
    }

    //display alert to user based on existing rule
    if (!exists || confirm("Editing Code directly will clear rule set by Edit Rule. Are you sure?")) {
        $(".lightBoxOuter").attr("style", "height:" + $("body").height() + "px")
            .addClass("parentDisable");

        $scope.showManualRuleDiv = true;
        $scope.showVisualRuleDiv = false;

        $('#rulesLightbox').css('display', 'block');
        $('#footer').css('display', 'none');
    }

};

/**
 *  function to display visual rule lightbox when user clicks on
 * edit visual rule button
 *
 * @param $scope
 * @param $routeParams
 */

var editVisualRule = function ($scope, $routeParams) {
    // variables declaration
    $scope.loadingFlag = true;
    $scope.loadingStatus = "Visual Campaign Rule Edit";
    // set the rule type to "visual" to process visual rule
    // specific functionality
    $scope.ruleType = "visual";
    $scope.summaryToDisplay = {};
    var exists = false;

    // check for existing rule of campaign
    if ($routeParams.id != null) {
        if ($scope.campaign["rules"].manualRule) {
            exists = true;
        }
    } else {
        if ($scope.manualRule && $scope.manualRule != "") {
            exists = true;
        }
    }
    //display alert to user based on existing rule
    if (!exists || confirm("Edit Rule will clear the code set by 'Edit Code'. Are you sure?")) {
        $(".lightBoxOuter").attr("style", "height:" + $("body").height() + "px")
            .addClass("parentDisable");

        $scope.showManualRuleDiv = false;
        $scope.showVisualRuleDiv = true;

        $('#rulesLightbox').css('display', 'block');
        $('#footer').css('display', 'none');
        //initialize visual rule specific variables
        initializeVisualRuleBuilder($scope);
    }
};

/**
 * initialize visual rule specific variables
 * @param scope
 */
var initializeVisualRuleBuilder = function (scope) {
    // get the field specific data from MasterData
    angular.forEach(scope.MasterData, function (data) {
        //get list of filters to display in visual rule

        // TODO: tested
        if (data.key === 'RulesFilterFields') {
            scope.rulesFilterFields = data.value;
        }
        //get EP status list
        if (data.key === 'EPStatuses') {
            scope.epStatusList = data.value;
        }

        // TODO: Not tested
        //get account types list
        if (data.key === 'AccountType') {
            scope.accountTypesList = data.value;
        }
        //get partners list
        if (data.key === 'Partners') {
            scope.partnersList = data.value;
        }
        // get states list
        if (data.key === 'States') {
            scope.statesList = data.value;
        }
        //get Utilities list
        if (data.key === 'Utilities') {
            scope.utilitiesList = data.value;
        }
        //get droptypes list
        if (data.key === 'ItemTypes') {
            scope.itemTypesList = data.value;
        }
        //get drop status list
        if (data.key === 'DropStatuses') {
            scope.dropStatusList = data.value;
        }
    });

    // list of possible conditions among selected filters
    scope.conditions = [
        {name: "AND", value: "and"},
        {name: "OR", value: "or"}
    ];
    //list of possible operators for selected filters
    scope.operatorsList = [
        {name: ">", value: "gt", type: "Number"},
        {name: "<", value: "lt", type: "Number"},
        {name: "=", value: "eq", type: "Number"},
        {name: "!=", value: "ne", type: "Number"},
        {name: ">=", value: "gte", type: "Number"},
        {name: "<=", value: "lte", type: "Number"},
        {name: "Not Equal", value: "ne", type: "Text"},
        {name: "Contains", value: "regex", type: "Text"},
        {name: "Exists", value: "exists", type: "Text"},
        {name: "Equals", value: "eq", type: "SingleLookUp"},
        {name: "Not Equal", value: "ne", type: "SingleLookUp"},
        {name: "In", value: "in", type: "MultiLookup"},
        {name: "Not In", value: "nin", type: "MultiLookup"},
        {name: "yes", value: "yes", type: "boolean"},
        {name: "no", value: "no", type: "boolean"}
    ];

    // date picker if the selected filter type is date
    datePickerChangeHandler('#dateField', scope, 'dateField', 0, '#dateFieldText');
    //initialize display option variables
    scope.showOperatorsField = false;
    scope.showTextField = false;
    scope.showDateField = false;
    scope.showSingleLookupField = false;
    scope.showMultiLookupField = false;
    scope.showBooleanField = false;
    // initialize selected filter object
    scope.selectedField = {name: "", value: "", type: ""};
    scope.selectedCondition = "and";
};

/**
 * function to refresh campaign page when user clicks on
 * Cancel button on rules light box
 *
 * @param $scope
 */


var cancelRules = function ($scope) {

    $('#rulesLightbox').css('display', 'none');
    $('#footer').css('display', 'block');
    $(".lightBoxOuter").removeAttr("style").removeClass("parentDisable");

    $scope.loadingFlag = false;
    $scope.loadingStatus = "";

};

/**
 * helper function to build summary to display based on
 * results from triggers rules
 *
 * @param details
 * @return {{}}
 */
var buildGenPopSummaryToDisplay = function (details) {
    //variables declaration
    var summaryBeforeRule = {};
    var summaryAfterRule = {};
    //looping through results
    for (var i = 0; i <= details.length; i++) {
        var item = details[i];
        for (var key in item) {
            //set summary before rule
            if (key == "summaryBeforeRule") {
                summaryBeforeRule = item[ key ];
            }
            //set summary after rule
            if (key == "summaryAfterRule") {
                summaryAfterRule = item[ key ];
            }
        }
    }

    try {
        //build summary to display based on results
        var summaryToDisplay = {};

        summaryToDisplay["totalGenPopItems"] = summaryBeforeRule[0].totalWorkItems;
        summaryToDisplay["itemsAfterRule"] = summaryAfterRule.length > 0 ? summaryAfterRule[0].totalWorkItems : 0;
        summaryToDisplay["itemsPercentage"] = summaryAfterRule.length > 0 ? (summaryAfterRule[0].totalWorkItems / summaryBeforeRule[0].totalWorkItems) * 100 : 0;

        summaryToDisplay["totalAnnualKwh"] = summaryAfterRule.length > 0 ? summaryAfterRule[0].totalAnnualKwh / 1000 : 0;
        summaryToDisplay["totalAssociatedAccounts"] = summaryAfterRule.length > 0 ? summaryAfterRule[0].totalAssociatedAccounts : 0;
        summaryToDisplay["totalAggregateKwh"] = summaryAfterRule.length > 0 ? summaryAfterRule[0].totalAggregateKwh / 1000 : 0;
    } catch (e) {
        console.log("Error evaluating results: " + e);
    }

    return summaryToDisplay;
};

/**
 * function to run the rules
 *
 * @param scope
 * @param http
 * @param informerService
 */
var runRulesHelper = function (scope, http, informerService) {
    //variables declation
    scope.statusFlag = true;
    scope.runRulesFlag = true;
    scope.ruleExists = false;
    scope.invalidRuleFlag = false;
    scope.rule = {};
    //if selected rule type is "manual"
    if (scope.ruleType && scope.ruleType == "manual") {
        $('#footer').css('display', 'block');
        if (scope.manualRule) {
            try {
                console.log("runRule: raw manual rule is " + scope.manualRule);
                console.log("runRule: uri manual rule is " + encodeURIComponent(scope.manualRule));

                //parse entered rule as object
                var value = JSON.parse(scope.manualRule);

                //check for empty object
                if (!isObjectEmpty(value)) {
                    scope.rule = {"manualRule": encodeURIComponent(JSON.stringify(value))};
                    scope.ruleExists = true;
                } else {
                    scope.statusFlag = false;
                    informerService.inform("Please enter a valid Query ");
                }
            }
            catch (e) {
                scope.statusFlag = false;
                console.log("exception in evaluating: " + e);
                informerService.inform("Please enter a valid query : " + e);
            }
        } else {
            scope.statusFlag = false;
            informerService.inform("Please enter Query ");
        }
    }
    //if selected rule type is visual
    if (scope.ruleType && scope.ruleType == "visual") {

        $('#footer').css('display', 'block');

        console.log("Evaluating the visual rule");
        console.log("scope.selectedCondition: " + JSON.stringify(scope.selectedCondition));
        console.log("scope.finalFilters: " + JSON.stringify(scope.finalFilters));
        //check for selected filters and condition among them
        if (scope.finalFilters && scope.finalFilters.length > 0) {
            //  build rules object to trigger
            var innerObj = {};
            if (scope.selectedCondition && scope.selectedCondition != "") {
                innerObj[scope.selectedCondition] = scope.finalFilters;
            }
            else {
                innerObj["and"] = scope.finalFilters;
            }
            scope.rule = {"visualRule": innerObj };
            scope.ruleExists = true;
        } else {
            informerService.inform(' Please Select  Filters');
        }
    }
    //if valid rule exists
    if (scope.ruleExists) {
        try {

            console.log("Posting rule: " + typeof scope.rule);
            console.log("Posting rule: " + scope.rule);
            // get the summary by sending rule
            http.post('/api/getGenPopSummary', scope.rule).
                success(function (data) {
                    scope.statusFlag = false;

                    scope.details = data.Details;
                    //build the summary to display based on results
                    scope.summaryToDisplay = buildGenPopSummaryToDisplay(scope.details);

                }).
                error(function (data, status, headers, config) {
                    console.log("Error loading GenPopSummary data!  data: " + JSON.stringify(data) +
                        " status: " + status +
                        " headers: " + JSON.stringify(headers) +
                        " config: " + JSON.stringify(config));

                    informerService.inform("There was a problem loading the GenPopSummary!");
                });
        }
        catch (e) {
            console.log("exception in evaluating: " + e);
            informerService.inform("There was a problem evaluating the query: " + e);

        }
    }

};

/**
 * save the rules
 *
 * @param scope
 * @param http
 * @param routeParams
 * @param informerService
 */
var saveRulesHelper = function (scope, http, routeParams, informerService) {
    scope.loadingFlag = true;
    scope.loadingStatus = "Saving Rules";
    scope.saveFlag = true;
    scope.showTransformRule = false;

    var rule = {};
    //if selected rule type is "manual"
    if (scope.ruleType && scope.ruleType == "manual") {

        if (scope.manualRule && scope.manualRule != "") {

            //parse entered rule as object
            var value = JSON.parse(scope.manualRule);
            scope.campaign["rules"] = {"manualRule": encodeURIComponent(JSON.stringify(value))};
        }
    }
    //if selected rule type is visual
    if (scope.ruleType && scope.ruleType == "visual") {

        if ((scope.selectedCondition && scope.selectedCondition != "") || (scope.finalFilters && scope.finalFilters.length == 1)) {
            var innerObj = {};
            if (scope.selectedCondition && scope.selectedCondition != "") {
                innerObj[scope.selectedCondition] = scope.finalFilters;
            }
            else {
                innerObj["and"] = scope.finalFilters;
            }
            scope.campaign["rules"] = {"visualRule": innerObj }
        }
    }

    if (scope.runRulesFlag) {
        //check for saving the rules with empty results
        if (scope.summaryToDisplay["itemsAfterRule"] || confirm("Would you like to save the rule with no results ")) {
            if (scope.ruleType && scope.ruleType == "visual") {
                scope.showTransformRule = true;
            }
            if (routeParams.id != null && routeParams.page != "copy") {
                //update the campaign with entered rule
                http.post('/api/saveCampaignRule', scope.campaign).
                    success(function (data) {
                        var result = data.result;
                        console.log(result);
                        $('#rulesLightbox').css('display', 'none');
                        $(".lightBoxOuter").removeAttr("style").removeClass("parentDisable");

                        scope.getCampaignById();
                    }).
                    error(function (data, status, headers, config) {
                        console.log("Error loading GenPopSummary data!  data: " + JSON.stringify(data) +
                            " status: " + status +
                            " headers: " + JSON.stringify(headers) +
                            " config: " + JSON.stringify(config));
                        informerService.inform("There was a problem loading the GenPopSummary!");
                    });
            }
            else {
                $('#rulesLightbox').css('display', 'none');
                $(".lightBoxOuter").removeAttr("style").removeClass("parentDisable");

                if (scope.ruleType && scope.ruleType == "manual") {
                    scope.selectedCondition = "";
                    scope.finalFilters = [];
                    scope.showManualRuleTextArea = true;
                    scope.showVisualRuleFilterData = false;
                    scope.showTransformRule = false;
                }
                if (scope.ruleType && scope.ruleType == "visual") {
                    scope.manualRule = "";
                    scope.showManualRuleTextArea = false;
                    scope.showVisualRuleFilterData = true;
                    scope.showTransformRule = true;
                }
            }
        }
    } else {
        scope.saveFlag = false;
        informerService.inform("Calculate the summary before saving the rule");
    }


};

/**
 * display boolean options when "exists" operator
 * is selected for "Text" field type
 *
 * @param scope
 */
var showExistsBooleanField = function (scope) {

    if (scope.selectedFieldType == "Text") {
        if (scope.selectedOperator.value == "exists") {
            scope.showExistsField = true;
            scope.showTextField = false;
        }
        else {
            scope.showExistsField = false;
            scope.showTextField = true;
        }
    }
};

/**
 * helper function to display operators list
 * based on selected field type
 *
 *
 * @param selectedFieldType
 * @param scope
 * @return {Array}
 */
var buildOperators = function (selectedFieldType, scope) {
    var operators = [];
    for (var i = 0; i < scope.operatorsList.length; i++) {
        var item = scope.operatorsList[i];
        if (selectedFieldType == item.type) {
            operators.push(item);
        }
    }
    return operators;
};

/**
 * helper function to show/hide text boxes based on
 * selected field type
 *
 * @param textField
 * @param dateField
 * @param singleLookupField
 * @param multiLookupField
 * @param booleanField
 * @param scope
 * @param selectedField
 */
var showRequiredInputTextBoxes = function (textField, dateField, singleLookupField, multiLookupField, booleanField, scope, selectedField) {
    scope.showTextField = textField;
    scope.showDateField = dateField;
    scope.showSingleLookupField = singleLookupField;
    scope.showMultiLookupField = multiLookupField;
    scope.showBooleanField = booleanField;
    scope.multiLookupValuesList = [];
    scope.singleLookupValuesList = [];

    // TODO: hardcoded on field name, can this be made data driven?
    // TODO: if left like this would be clearer as a switch

    // TODO: Not tested

    //load the drop down values if selected field type is "multiLookupField"
    if (multiLookupField) {
        if (selectedField.value == "accountType") {
            scope.multiLookupValuesList = scope.accountTypesList;
        }
        if (selectedField.value == "partner") {
            for (var i = 0; i < scope.partnersList.length; i++) {
                scope.multiLookupValuesList.push(scope.partnersList[i].partnerName);
            }
        }
        if (selectedField.value == "partnerCode") {
            for (var j = 0; j < scope.partnersList.length; j++) {
                scope.multiLookupValuesList.push(scope.partnersList[j].partnerCode);
            }
        }
        if (selectedField.value == "serviceState" || selectedField.value == "utilityState") {
            for (var k = 0; k < scope.statesList.length; k++) {
                scope.multiLookupValuesList.push(scope.statesList[k].abbrev);
            }
        }
        if (selectedField.value == "utilityAbbr") {
            for (var l = 0; l < scope.utilitiesList.length; l++) {
                scope.multiLookupValuesList.push(scope.utilitiesList[l].utilityAbbrev);
            }
        }
        if (selectedField.value == "utilityCode") {
            for (var m = 0; m < scope.utilitiesList.length; m++) {
                scope.multiLookupValuesList.push(scope.utilitiesList[m].utilityCode);
            }
        }
        if (selectedField.value == "utilityName") {
            for (var n = 0; n < scope.utilitiesList.length; n++) {
                scope.multiLookupValuesList.push(scope.utilitiesList[n].utility);
            }
        }
    }
    //load the drop down values if selected field type is "singleLookupField"
    if (singleLookupField) {
        if (selectedField.value == "dropStatus") {
            for (var p = 0; p < scope.dropStatusList.length; p++) {
                scope.singleLookupValuesList.push(scope.dropStatusList[p].statusName);
            }
        }
        if (selectedField.value == "dropStatusMapped") {
            for (var p = 0; p < scope.epStatusList.length; p++) {
                scope.singleLookupValuesList.push(scope.epStatusList[p].statusName);
            }
        }
        if (selectedField.value == "dropType") {
            scope.singleLookupValuesList = scope.itemTypesList;
        }

    }
};
/**
 * display operators based on selected field type
 *
 * @param scope
 * @param selectedField
 */

var showOperators = function (scope, selectedField) {

    scope.showExistsField = false;
    scope.showOperatorsField = true;
    scope.selectedFieldType = selectedField.type;
    scope.selectedOperator = {name: "", value: ""};

    if (scope.selectedFieldType == "Number" || scope.selectedFieldType == "Date" || scope.selectedFieldType == "Decimal") {
        scope.operators = buildOperators("Number", scope);

        if (scope.selectedFieldType == "Number" || scope.selectedFieldType == "Decimal") {
            showRequiredInputTextBoxes(true, false, false, false, false, scope, null);
        } else {
            showRequiredInputTextBoxes(false, true, false, false, false, scope, null);
        }
    }
    if (scope.selectedFieldType == "Text") {
        scope.operators = buildOperators(scope.selectedFieldType, scope);
        showRequiredInputTextBoxes(true, false, false, false, false, scope, null);
    }
    if (scope.selectedFieldType == "SingleLookUp") {
        scope.operators = buildOperators(scope.selectedFieldType, scope);
        showRequiredInputTextBoxes(false, false, true, false, false, scope, selectedField);
    }
    if (scope.selectedFieldType == "MultiLookup") {
        scope.operators = buildOperators(scope.selectedFieldType, scope);
        showRequiredInputTextBoxes(false, false, false, true, false, scope, selectedField);
    }
    if (scope.selectedFieldType == "boolean") {
        scope.operators = buildOperators(scope.selectedFieldType, scope);
        showRequiredInputTextBoxes(false, false, false, false, true, scope, null);
        scope.showOperatorsField = false;
    }
};
/**
 * helper function to build final filters which  needs to be saved as visual rule
 *
 * @param scope
 */
var buildFinalFiltersElements = function (scope) {

    console.log("buildFinalFiltersElements: " + JSON.stringify(scope.selectedField));

    var filter = {displayName: "", fieldName: "", type: "", operator: "", value: ""};

    filter.displayName = scope.selectedField.name;
    filter.fieldName = scope.selectedField.value;
    filter.type = scope.selectedField.type;
    filter.operator = scope.selectedOperator.name;

    if ((scope.selectedFieldType == "Number") || (scope.selectedFieldType == "Decimal")) {

        filter.value = scope.selectedTextValue;
        scope.selectedTextValue = "";
    }
    if (scope.selectedFieldType == "Text") {

        if (scope.selectedOperator.value == "exists") {
            filter.value = scope.selectedExistsBooleanValue;

            scope.showTextField = true;
            scope.showExistsField = false;

        } else {
            filter.value = scope.selectedTextValue;
        }
        scope.selectedTextValue = "";
        scope.selectedExistsBooleanValue = "";
    }
    if (scope.selectedFieldType == "Date") {
        filter.value = scope.selectedDateValue;
        scope.selectedDateValue = "";
        $('#dateFieldText').val('');
    }
    if (scope.selectedFieldType == "SingleLookUp") {
        filter.value = scope.selectedSingleLookupValue;
        scope.selectedSingleLookupValue = "";
    }

    if (scope.selectedFieldType == "MultiLookup") {
        filter.value = scope.selectedMultiLookupValue;
        scope.selectedMultiLookupValue = [];
    }

    if (scope.selectedFieldType == "boolean") {

        filter.operator = "Equals";
        filter.value = scope.selectedBooleanValue;
        scope.selectedBooleanValue = "";
    }

    scope.finalFilters.push(filter);
    scope.selectedOperator = {name: "", value: ""};
};

/**
 * helper function to build filters to the list
 *
 * @param $scope
 * @param informerService
 */
var addFilters = function ($scope, informerService) {

    var isExists = false;
    if ($scope.selectedField && $scope.selectedField.name != "") {

        if (($scope.selectedOperator && $scope.selectedOperator.value != "") || ($scope.selectedFieldType == "boolean")) {

            if (($scope.selectedTextValue && $scope.selectedTextValue != "") || ($scope.selectedSingleLookupValue && $scope.selectedSingleLookupValue != "")
                || ($scope.selectedMultiLookupValue && $scope.selectedMultiLookupValue.length > 0) || ($scope.selectedBooleanValue && $scope.selectedBooleanValue != "" )
                || ($scope.selectedDateValue && $scope.selectedDateValue != "") || ($scope.selectedExistsBooleanValue && $scope.selectedExistsBooleanValue != "")) {

                if ($scope.finalFilters && $scope.finalFilters.length > 0) {

                    for (var i = 0; i < $scope.finalFilters.length; i++) {
                        var item = $scope.finalFilters[i];
                        if ($scope.selectedField.name == item.displayName && $scope.selectedOperator.name == item.operator) {
                            isExists = true;
                        }
                    }
                    if (isExists) {
                        informerService.inform($scope.selectedField.name + " and " + $scope.selectedOperator.name + " combination already exists ");

                    } else {
                        buildFinalFiltersElements($scope);
                    }
                }
                else {
                    buildFinalFiltersElements($scope);
                }
            } else {
                informerService.inform(" Please Enter Value ");
            }
        } else {
            informerService.inform(" Please Select Operator ");
        }
    } else {
        informerService.inform(" Please Select Field  ");
    }

};
/**
 * function to remove selected filters from the list
 *
 * @param scope
 * @param filter
 */
var removeFilter = function (scope, filter) {

    var index = scope.finalFilters.indexOf(filter);
    scope.finalFilters.splice(index, 1);
};

/**
 * transform visual rule to manual rule
 *
 * @param scope
 * @param routeParams
 * @param http
 * @param informerService
 */
var transformVisualRule = function (scope, routeParams, http, informerService) {

    if (confirm("Do you want to transform 'Edit Rule' to 'Code' ?? ")) {

        var transformedQuery = makeVisualRuleQueryObject(scope.campaign["rules"]["visualRule"]);
        scope.manualRule = JSON.stringify(transformedQuery);
        scope.campaign["rules"] = {"manualRule": encodeURIComponent(JSON.stringify(transformedQuery))};

        if (routeParams.id != null && routeParams.page != "copy") {
            //update the campaign with entered rule
            http.post('/api/saveCampaignRule', scope.campaign).
                success(function (data) {
                    var result = data.result;
                    console.log(result);
                    $('#rulesLightbox').css('display', 'none');
                    $(".lightBoxOuter").removeAttr("style").removeClass("parentDisable");

                    scope.getCampaignById();
                }).
                error(function (data, status, headers, config) {
                    console.log("Error transforming visual rule to manual rule " + JSON.stringify(data) +
                        " status: " + status +
                        " headers: " + JSON.stringify(headers) +
                        " config: " + JSON.stringify(config));
                    informerService.inform("There was a problem in transforming 'Edit Rule' to 'Code'!");
                });
        }
        else {

            scope.finalFilters = [];
            scope.showManualRuleTextArea = true;
            scope.showManualRule = true;
            scope.showVisualRuleFilterData = false;
            scope.showTransformRule = false;

            $('#rulesLightbox').css('display', 'none');
            $(".lightBoxOuter").removeAttr("style").removeClass("parentDisable");
        }


    }
};

/**
 * helper function to convert visual rule to manual rule
 *
 * @param visualRuleFilters
 * @return {{}}
 */
    // TODO: Test method
var makeVisualRuleQueryObject = function (visualRuleFilters) {

    //  get the condition among selected filters by user
    var condition = visualRuleFilters.and ? "and" : "or";
    // get the selected filters by user based on condition
    var filters = visualRuleFilters[ condition ];


    var queryElements = [];
    var finalQuery = {};

    //looping on selected filters to build mongo db query
    for (var i = 0; i < filters.length; i++) {
        var filter = filters[i];

        var query = {};
        var innerQuery = {};

        // convert String to Integer if selected field is  Number type
        if (filter.type == "Number") {
            filter.value = parseInt(filter.value);
        }
        // convert String to Date if selected field is  Date type
        if (filter.type == "Date") {
            filter.value = new Date(filter.value);
        }
        // convert String to Decimal if selected field is  Decimal type
        if (filter.type == "Decimal") {
            filter.value = parseFloat(filter.value);
        }

        //build proper inner query  based on selected operator if selected field type is Number/Date/Decimal
        if ((filter.type == "Number") || (filter.type == "Date") || (filter.type == "Decimal")) {
            if (filter.operator == "<") {
                innerQuery = {"$lt": filter.value};
            }
            if (filter.operator == ">") {
                innerQuery = {"$gt": filter.value};
            }
            if (filter.operator == "<=") {
                innerQuery = {"$lte": filter.value};
            }
            if (filter.operator == ">=") {
                innerQuery = {"$gte": filter.value};
            }
            if (filter.operator == "=") {
                innerQuery = filter.value;
            }
            if (filter.operator == "!=") {
                innerQuery = {"$ne": filter.value};
            }
        }
        //build proper inner query  based on selected operator if selected field type is Text
        if (filter.type == "Text") {
            if (filter.operator == "Not Equal") {
                innerQuery = {"$ne": filter.value};
            }
            if (filter.operator == "Contains") {
                innerQuery = {"$regex": filter.value, $options: 'i' };
            }
            if (filter.operator == "Exists") {
                if (filter.value == "yes") {
                    innerQuery = {"$exists": true};
                } else {
                    innerQuery = {"$exists": false};
                }

            }
        }
        //build proper inner query  based on selected operator if selected field type is SingleLookUp
        if (filter.type == "SingleLookUp") {
            var value = filter.value || '';
            value = value.toLowerCase();

            if(filter.operator == "Equals"){
                innerQuery = value ;
            }
            if(filter.operator == "Not Equal"){
                innerQuery = {"$ne" : value} ;
            }
        }

        //build proper inner query  based on selected operator if selected field type is MultiLookup
        if (filter.type == "MultiLookup") {
            if (filter.fieldName == "accountType") {
                var tempArray = [];
                for (var j = 0; j < filter.value.length; j++) {
                    var item = filter.value[j];
                    switch (item) {
                        case "Residential":
                            tempArray.push("1");
                            break;
                        case "Commercial":
                            tempArray.push("2", "3");
                            break;
                        case "All":
                            // no filter
                            break;
                        default:
                            console.log("Error unknown filter accountType:  " + filter.fieldName);
                    }
                }
                filter.value = tempArray;
            }

            if (filter.operator == "In") {
                innerQuery = {"$in": filter.value};
            }
            if (filter.operator == "Not In") {
                innerQuery = {"$nin": filter.value};
            }
        }
        //build proper inner query  based on selected operator if selected field type is boolean
        if (filter.type == "boolean") {
            innerQuery = filter.value == "yes" ? true : false;
        }

        // build inner query
        query[filter.fieldName] = innerQuery;
        // add inner query to Query elements
        queryElements.push(query);
    }
    //build final mongo db query
    finalQuery["$" + condition] = queryElements;

    // return final mongo query
    return finalQuery;
};
