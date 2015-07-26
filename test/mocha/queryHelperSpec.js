// Dependencies:
// global install of mocha (npm install -g mocha)

var assert = require('assert');

var queryHelper = require('../../routes/query-helper');


var checkMinimumFilter = function (filterName, fieldName ) {

    return function () {

        if( !fieldName ) {
            fieldName = filterName;
        }

        var filter = {};

        filter[filterName] = [
            "12345"
        ];

        filter.otherJunk = [];

        var query = queryHelper.makeFilterQueryObject(filter);

        assert.equal(JSON.stringify(query), '{"' + fieldName + '":{"$gte":12345}}',
            "the actual query object");
    };

};

// input looks like:
// "aggregatekWh": [
//null,
//    "45678"
//],

var checkMaximumFilter = function (filterName, fieldName ) {

    return function () {

        if( !fieldName ) {
            fieldName = filterName;
        }

        var filter = {};

        filter[filterName] = [
            null,
            "12345"
        ];

        filter.otherJunk = [];

        var query = queryHelper.makeFilterQueryObject(filter);

        assert.equal(JSON.stringify(query), '{"' + fieldName + '":{"$lte":12345}}',
            "the actual query object");
    };

};

// min max looks like
//"aggregatekWh": [
//    "33334",
//    "45678"
//] ==> {"aggregatekWh":{"$gte":33335, "$lte":45678}}

var expectedIntFilters = function (checkFunction) {

    it('should return a mongo query object for aggregatekWh',
        checkFunction("aggregatekWh"));

    it('should return a mongo query object for normalizedAnnualUsage',
        checkFunction("normalizedAnnualUsage"));

    it('should return a mongo query object for aggregateGas',
        checkFunction("aggregateGas"));

    it('should return a mongo query object for annualGasUsage',
        checkFunction("annualGasUsage"));

    it('should return a mongo query object for aggregateGreenkWh',
        checkFunction("aggregateGreenkWh"));

    it('should return a mongo query object for annualkWh',
        checkFunction("annualkWh"));

    it('should return a mongo query object for cashbackBalance',
        checkFunction("cashbackBalance"));

}

var expectedCalculatedIntFilters = function (checkFunction) {

    it('should return a mongo query object for monthsActive',
        checkFunction("monthsActive", "calculated.monthsActive"));

    it('should return a mongo query object for monthsUntilCashAward',
        checkFunction("monthsUntilCashAward", "calculated.monthsUntilCashAward"));

    it('should return a mongo query object for monthsSinceDropped',
        checkFunction("monthsSinceDropped", "calculated.monthsSinceDropped"));

}

var checkMinMaxFilter = function (filterName, fieldName ) {

    return function () {

        if( !fieldName ) {
            fieldName = filterName;
        }

        var filter = {};

        filter[filterName] = [
            "456",
            "12345"
        ];

        filter.otherJunk = [];

        var query = queryHelper.makeFilterQueryObject(filter);

        assert.equal(JSON.stringify(query), '{"' + fieldName + '":{"$gte":456,"$lte":12345}}',
            "the actual query object");
    };

};


function checkEmptyFilter(filter) {
    var query = queryHelper.makeFilterQueryObject(filter);

    assert.deepEqual(query, {},
        "the actual query object");
}
describe('Maximum query helper function', function () {

    it('should return a mongo query object for aggregatekWh (Example for clarity)', function () {
        var filter = {
            "aggregatekWh":[
                null,
                "12345"
            ],
            "otherJunk":[]
        };

        var query = queryHelper.makeFilterQueryObject(filter);

        assert.deepEqual(query, { "aggregatekWh":{ $lte:12345 } },
            "the actual query object");

    });

    it('should return an empty query object for random junk', function () {
        var filter = {
            "randomJunk":[
                null,
                "12345"
            ],
            "otherJunk":[]
        };

        checkEmptyFilter(filter);
    });

    it('should ignore null', function () {
        var filter = {
            "aggregatekWh":[
                null,
                null
            ],
            "otherJunk":[]
        };

        checkEmptyFilter(filter);
    });

    it('should ignore empty string', function () {
        var filter = {
            "aggregatekWh":[
                "",
                ""
            ],
            "otherJunk":[]
        };

        checkEmptyFilter(filter);
    });

    it('should ignore empty array', function () {
        var filter = {
            "aggregatekWh":[
            ],
            "otherJunk":[]
        };

        checkEmptyFilter(filter);
    });

    expectedIntFilters(checkMaximumFilter);

    expectedCalculatedIntFilters( checkMaximumFilter );


});


describe('Minimum query helper function', function () {

    it('should return a mongo query object for aggregatekWh (Example for clarity)', function () {
        var filter = {
            "aggregatekWh":[
                "12345"
            ],
            "otherJunk":[]
        };

        var query = queryHelper.makeFilterQueryObject(filter);

        assert.deepEqual(query, { "aggregatekWh":{ $gte:12345 } },
            "the actual query object");

    });


    it('should ignore null', function () {
        var filter = {
            "aggregatekWh":[
                null
            ],
            "otherJunk":[]
        };

        checkEmptyFilter(filter);
    });


    it('should ignore empty string', function () {
        var filter = {
            "aggregatekWh":[
                ""
            ],
            "otherJunk":[]
        };

        checkEmptyFilter(filter);
    });


    it('should return an empty query object for random junk', function () {
        var filter = {
            "randomJunk":[
                "12345"
            ],
            "otherJunk":[]
        };

        checkEmptyFilter(filter);
    });

    // handle "annualkWh":["9000",""]

    it('should handle val + empty string', function () {
        var filter = {
            "annualkWh":["9000", ""],
            "otherJunk":[]
        };

        var query = queryHelper.makeFilterQueryObject(filter);

        assert.deepEqual(query, { "annualkWh":{ $gte:9000 } },
            "the actual query object");
    });


    expectedIntFilters(checkMinimumFilter);

    expectedCalculatedIntFilters( checkMinimumFilter );

});


describe('Min and max query helper function', function () {

    it('should return a mongo query object for aggregatekWh (Example for clarity)', function () {
        var filter = {
            "aggregatekWh":[
                "444",
                "12345"
            ],
            "otherJunk":[]
        };

        var query = queryHelper.makeFilterQueryObject(filter);

        assert.deepEqual(query, { "aggregatekWh":{ $gte:444, $lte:12345 } },
            "the actual query object");

    });

    it('should return an empty query object for random junk', function () {
        var filter = {
            "randomJunk":[
                "333",
                "12345"
            ],
            "otherJunk":[]
        };

        checkEmptyFilter(filter);
    });

    expectedIntFilters(checkMinMaxFilter);

    expectedCalculatedIntFilters( checkMinMaxFilter );

});


describe("Should handle all combinations", function () {
    it('works', function () {

        var filter = {
            "aggregatekWh":["5000", "7000"],
            "annualkWh":["9000", ""],
            "cashbackBalance":[null, "6001"],
            "monthsUntilCashAward":[],
            "serviceEndDate":[], "monthsActive":[],
            "monthsSinceDropped":[], "pricing":[],
            "dropStatus":"", "dropStatusDate":[],
            "state":[], "utilityAbbr":[],
            "accountNumber":"", "partner":[],
            "contactName":"", "dropRep":"", "accountType":""};

        var query = queryHelper.makeFilterQueryObject(filter);

        assert.deepEqual(query,
            {"aggregatekWh":{"$gte":5000, "$lte":7000},
                "annualkWh":{"$gte":9000},
                "cashbackBalance":{"$lte":6001}},
            "the actual query object");
    });
});

// pricing: "pricing":["0.111"] goes to
// { pricing:{ $lte:"0.111"}
// note the quotes as the db val is a string


describe("Should handle basic min pricing", function () {

    var minHelper = function (filter) {
        return function () {

            var query = queryHelper.makeFilterQueryObject(filter);

            assert.equal(JSON.stringify(query),
                '{"pricing":{"$gte":"0.111"}}',
                "the actual json stringify");
            assert.deepEqual(query,
                {"pricing":{ $gte:"0.111"} },
                "the actual query object");
        }
    };

    it('should work with just one value', minHelper({ "pricing":["0.111"] }));
    it('should work with just one value and null', minHelper({ "pricing":["0.111", null ] }));
    it('should work with just one value and empty string', minHelper({ "pricing":["0.111", ""] }));
});


describe("Should handle basic max pricing", function () {

    var maxHelper = function (filter) {
        return function () {

            var query = queryHelper.makeFilterQueryObject(filter);

            assert.equal(JSON.stringify(query),
                '{"pricing":{"$lte":"0.111"}}',
                "the actual json stringify");
            assert.deepEqual(query,
                {"pricing":{ $lte:"0.111"} },
                "the actual query object");
        }
    };

    it('should work with just one value (and null)', maxHelper({ "pricing":[null, "0.111"] }));
    it('should work with just one value and empty string', maxHelper({ "pricing":["", "0.111"] }));
});

describe("Should handle min max pricing", function () {

    var maxHelper = function (filter) {
        return function () {

            var query = queryHelper.makeFilterQueryObject(filter);

            assert.equal(JSON.stringify(query),
                '{"pricing":{"$gte":"0.011","$lte":"0.111"}}',
                "the actual json stringify");
            assert.deepEqual(query,
                {"pricing":{ $gte:"0.011", $lte:"0.111"} },
                "the actual query object");
        }
    };

    it('should work with just two values', maxHelper({ "pricing":["0.011", "0.111"] }));
});

var minDateHelper = function (filter, fieldName) {
    return function () {

        var query = queryHelper.makeFilterQueryObject(filter);

        assert.equal(JSON.stringify(query),
            '{"' + fieldName + '":{"$gte":"2012-10-09T04:00:00.000Z"}}',
            "the actual json stringify");
        var object = {};
        object[fieldName] = { $gte:new Date("2012-10-09T04:00:00.000Z") };
        assert.deepEqual(query, object,
            "the actual query object");
    }
};

var maxDateHelper = function (filter, fieldName) {
    return function () {

        var query = queryHelper.makeFilterQueryObject(filter);

        assert.equal(JSON.stringify(query),
            '{"' + fieldName + '":{"$lte":"2012-10-09T04:00:00.000Z"}}',
            "the actual json stringify");
        var object = {};
        object[fieldName] = { $lte:new Date("2012-10-09T04:00:00.000Z") };
        assert.deepEqual(query, object,
            "the actual query object");
    }
};
var minMaxDateHelper = function (filter, fieldName) {
    return function () {

        var query = queryHelper.makeFilterQueryObject(filter);

        assert.equal(JSON.stringify(query),
            '{"' + fieldName + '":{"$gte":"2011-09-11T04:00:00.000Z","$lte":"2012-10-09T04:00:00.000Z"}}',
            "the actual json stringify");
        var object = {};
        object[fieldName] = { $gte:new Date("2011-09-11T04:00:00.000Z"),
            $lte:new Date("2012-10-09T04:00:00.000Z") };

        assert.deepEqual(query, object,
            "the actual query object");
    }
};


// ,"serviceEndDate":["2012-10-09T04:00:00.000Z",null]
describe("Should handle basic min service end date", function () {

    it('should work with just one value',
        minDateHelper({ "serviceEndDate":["2012-10-09T04:00:00.000Z"] }, "serviceEndDate"));
    it('should work with just one value and null',
        minDateHelper({ "serviceEndDate":["2012-10-09T04:00:00.000Z", null] }, "serviceEndDate"));
    it('should work with just one value and empty string',
        minDateHelper({ "serviceEndDate":["2012-10-09T04:00:00.000Z", ""] }, "serviceEndDate"));
});

describe("Should handle basic max service end date", function () {

    it('should work with just one value (and null)',
        maxDateHelper({ "serviceEndDate":[null, "2012-10-09T04:00:00.000Z"] }, "serviceEndDate"));
    it('should work with just one value and empty string',
        maxDateHelper({ "serviceEndDate":["", "2012-10-09T04:00:00.000Z"] }, "serviceEndDate"));
});

describe("Should handle min & max service end date", function () {

    it('should work with two values',
        minMaxDateHelper({ "serviceEndDate":["2011-09-11T04:00:00.000Z",
            "2012-10-09T04:00:00.000Z"] }, "serviceEndDate"));
});


// ,"dropStatusDate":["2012-10-09T04:00:00.000Z",null]
describe("Should handle basic min drop status date", function () {

    it('should work with just one value',
        minDateHelper({ "dropStatusDate":["2012-10-09T04:00:00.000Z"] }, "dropStatusDate"));
    it('should work with just one value and null',
        minDateHelper({ "dropStatusDate":["2012-10-09T04:00:00.000Z", null] }, "dropStatusDate"));
    it('should work with just one value and empty string',
        minDateHelper({ "dropStatusDate":["2012-10-09T04:00:00.000Z", ""] }, "dropStatusDate"));
});

describe("Should handle basic max drop status date", function () {

    it('should work with just one value (and null)',
        maxDateHelper({ "dropStatusDate":[null, "2012-10-09T04:00:00.000Z"] }, "dropStatusDate"));
    it('should work with just one value and empty string',
        maxDateHelper({ "dropStatusDate":["", "2012-10-09T04:00:00.000Z"] }, "dropStatusDate"));
});

describe("Should handle min & max drop status date", function () {

    it('should work with two values',
        minMaxDateHelper({ "dropStatusDate":["2011-09-11T04:00:00.000Z",
            "2012-10-09T04:00:00.000Z"] }, "dropStatusDate"));
});


var regexHelper = function (filter, fieldName) {
    return function () {

        var query = queryHelper.makeFilterQueryObject(filter);

        assert.equal(JSON.stringify(query),
            '{"' + fieldName +
                '":{"$regex":"stoo","$options":"i"}}',
            "the actual json stringify");

        var object = {};
        object[fieldName] = { $regex:"stoo", $options: "i" } ;
        assert.deepEqual(query, object,
            "the actual query object");
    };
};


// dropRep:  Should match case insensitive start: "dropRep":"stoo" ==>  {dropRep: { $regex: '^stoo', $options: 'i' }

describe("Should handle dropRep", function () {
    it('should work with basic values', regexHelper({ "dropRep":"stoo" }, "dropRep") );

    it('should work with empty dropRep', function() {
        checkEmptyFilter({ "dropRep":"" });
    } );

    it('should work with null dropRep',function() {
        checkEmptyFilter({ "dropRep":null });
    } );
});

// contactName as dropRep

describe("Should handle contactName", function () {

    it('should work with basic values', regexHelper({ "contactName":"stoo" }, "contactName" ) );

    it('should work with empty contactName', function() {
        checkEmptyFilter({ "contactName":"" });
    } );

    it('should work with null contactName',function() {
        checkEmptyFilter({ "contactName":null });
    } );
});


var equalsHelper = function (filter, fieldName, filterValue ) {
    return function () {

        var query = queryHelper.makeFilterQueryObject(filter);

        assert.equal(JSON.stringify(query),
            '{"' + fieldName + '":"' + filterValue + '"}',
            "the actual json stringify");

        var object = {};
        object[fieldName] = filterValue ;
        assert.deepEqual(query, object,
            "the actual query object");
    };
};




// Drop status: {"aggregatekWh":[null,"9999"],
// "dropStatus":"Lost",
// goes to db.WorkItems.find({"dropStatus":"Lost",  "aggregatekWh":{"$lte":9999},"campaignId":null} ).count()


describe("Should handle dropStatus", function () {
    it('should work with basic values', equalsHelper({ "dropStatusMapped":"Lost" }, "dropStatusMapped", "lost") );

    it('should work with empty dropStatus', function() {
        checkEmptyFilter({ "dropStatusMapped":"" });
    } );

    it('should work with null dropStatus',function() {
        checkEmptyFilter({ "dropStatusMapped":null });
    } );
});




//commodity ALL/Gas/Electric.  All is special

describe("Should handle commodity", function () {
    it('should work with basic values', equalsHelper({ "commodity":"Gas" }, "commodity", "Gas") );

    it('should work with empty commodity', function() {
        checkEmptyFilter({ "commodity":"" });
    } );

    it('should work with null commodity',function() {
        checkEmptyFilter({ "commodity":null });
    } );

    it('special case, all == no filter',function() {
        checkEmptyFilter({ "commodity":"All" });
    } );
});


//dropType Pre/Drop.  All is special

describe("Should handle dropType", function () {
    it('should work with basic values', equalsHelper({ "dropType":"PreDrop" }, "dropType", "PreDrop") );

    it('should work with empty dropType', function() {
        checkEmptyFilter({ "dropType":"" });
    } );

    it('should work with null dropType',function() {
        checkEmptyFilter({ "dropType":null });
    } );

    it('special case, all == no filter',function() {
        checkEmptyFilter({ "dropType":"All" });
    } );
});


// Random scrape from CI 2013-04-15
//"accountName" : null,
//    "accountNumber" : "0537622209",
//    "accountType" : "1",
//    "aggregateGas" : null,


describe("Should handle accountNumber", function () {
    it('should work with basic values', equalsHelper({ "accountNumber":"0537622209" },
        "accountNumber", "0537622209"));

    it('should work with empty accountNumber', function () {
        checkEmptyFilter({ "accountNumber":"" });
    });

    it('should work with null accountNumber', function () {
        checkEmptyFilter({ "accountNumber":null });
    });
});

// State:  Array with 0 or more items: "utilityState":["NJ","NY","OH"] ==> { "utilityState":{ $in: ["NJ","NY","OH"] } }

var arrayHelper = function (filter, fieldName, filterValue ) {
    return function () {

        var query = queryHelper.makeFilterQueryObject(filter);

        assert.equal(JSON.stringify(query),
            '{"' + fieldName + '":{"$in":' + JSON.stringify( filterValue ) + '}}',
            "the actual json stringify (1) ");


        var object = {};
        object[fieldName] = { "$in": filterValue } ;
        assert.deepEqual(query, object,
            "the actual query object");

    };
};

describe("Should handle utilityState", function () {
    it('should work with one value', arrayHelper({ "utilityState":["TX"] }, "utilityState", ["TX"]) );
    it('should work with many values', arrayHelper({ "utilityState":["NJ","NY","OH"] }, "utilityState", ["NJ","NY","OH"]) );

    it('should work with empty utilityState', function() {
        checkEmptyFilter({ "utilityState":"" });
    } );

    it('should work with null utilityState',function() {
        checkEmptyFilter({ "utilityState":null });
    } );
});

// TODO: Test utilityAbbr with full load
// Querying with : {"utilityAbbr":{"$in":["CHU","ORU","UI"]},"partner":{"$in":["American Airlines"]},"campaignId":null}


describe("Should handle utilityAbbr", function () {
    it('should work with one value', arrayHelper({ "utilityAbbr":["TX"] }, "utilityAbbr", ["TX"]) );
    it('should work with many values', arrayHelper({ "utilityAbbr":["NJ","NY","OH"] }, "utilityAbbr", ["NJ","NY","OH"]) );

    it('should work with empty utilityAbbr', function() {
        checkEmptyFilter({ "utilityAbbr":"" });
    } );

    it('should work with null utilityAbbr',function() {
        checkEmptyFilter({ "utilityAbbr":null });
    } );
});

// TODO: test partner with full load
// Querying with : {"utilityAbbr":{"$in":["CHU","ORU","UI"]},"partner":{"$in":["American Airlines"]},"campaignId":null}

describe("Should handle partner", function () {
    it('should work with one value', arrayHelper({ "partner":["TX"] }, "partner", ["TX"]) );
    it('should work with many values', arrayHelper({ "partner":["NJ","NY","OH"] }, "partner", ["NJ","NY","OH"]) );

    it('should work with empty partner', function() {
        checkEmptyFilter({ "partner":"" });
    } );

    it('should work with null partner',function() {
        checkEmptyFilter({ "partner":null });
    } );
});

// TODO: test AccountType with full load

// accountType:  currently UI sends Residential | Commercial | All
// Res == type 1, (but String according to API)
// Comm = type 2 or 3 (String, according to API)
// ALL = no filter
// "accountType":"All" ==> no filter
// "accountType":"Residential" ==> { accountType: {$in: ["1"]}
// "accountType":"Commercial" ==> { accountType: {$in: ["2","3"]}

describe("Should handle accountType", function () {
    it('should work with residential', arrayHelper({ "accountType":"Residential" }, "accountType", ["1"]) );
    it('should work with commercial', arrayHelper({ "accountType":"Commercial" }, "accountType", ["2","3"]) );

    it('should work with all', function() {
        checkEmptyFilter({ "accountType":"ALL" });
    } );

    it('should work with empty accountType', function() {
        checkEmptyFilter({ "accountType":"" });
    } );

    it('should work with null accountType',function() {
        checkEmptyFilter({ "accountType":null });
    } );
    it('should ignore garbage accountType',function() {
        checkEmptyFilter({ "accountType":"garbage" });
    } );
});

// TODO: redo some of these tests against the api logic??
////  {"direction":"asc","field":"annualkWh"}
//
//describe("Should make sort object", function () {
//
//    it('should assign field', function () {
//
//        var pageSort = {"direction":"asc","field":"annualkWh"};
//
//        var sort = queryHelper.sortHelper( pageSort );
//
//        assert.deepEqual( { "annualkWh":1 }, sort, "the sort object" );
//    });
//
//    it('should sort descending with desc', function () {
//
//        var pageSort = {"direction":"desc","field":"annualkWh"};
//
//        var sort = queryHelper.sortHelper( pageSort );
//
//        assert.deepEqual( { "annualkWh":-1 }, sort, "the sort object" );
//    });
//
//
//    it('should sort descending with DESC', function () {
//
//        var pageSort = {"direction":"DESC","field":"annualkWh"};
//
//        var sort = queryHelper.sortHelper( pageSort );
//
//        assert.deepEqual( { "annualkWh":-1 }, sort, "the sort object" );
//    });
//
//    it('should sort ascending with ASC', function () {
//
//        var pageSort = {"direction":"ASC","field":"annualkWh"};
//
//        var sort = queryHelper.sortHelper( pageSort );
//
//        assert.deepEqual( { "annualkWh":1 }, sort, "the sort object" );
//    });
//
//    it('should sort ascending by default', function () {
//
//        var pageSort = {"field":"annualkWh"};
//
//        var sort = queryHelper.sortHelper( pageSort );
//
//        assert.deepEqual( { "annualkWh":1 }, sort, "the sort object" );
//    });
//
//
//    it('should be empty if empty', function () {
//
//        var pageSort = {};
//
//        var sort = queryHelper.sortHelper( pageSort );
//
//        assert.deepEqual( {}, sort, "the sort object" );
//    });
//
//    it('should be null safe', function () {
//
//        var pageSort = null;
//
//        var sort = queryHelper.sortHelper( pageSort );
//
//        assert.deepEqual( {}, sort, "the sort object" );
//    });
//
//});