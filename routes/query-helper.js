// Helper file for building query objects

function intTypeHelper(filterItem, result, attribute) {
    if (filterItem.length === 1 && filterItem[0]) {
        result[ attribute ] = { "$gte":parseInt(filterItem[0]) };
    } else if (filterItem.length === 2 && !filterItem[1] && filterItem[0]) {
        result[ attribute ] = { "$gte":parseInt(filterItem[0]) };
    } else if (filterItem.length === 2 && !filterItem[0] && filterItem[1]) {
        result[ attribute ] = { "$lte":parseInt(filterItem[1]) };
    } else if (filterItem.length === 2 && filterItem[0] && filterItem[1]) {
        result[ attribute ] = { "$gte":parseInt(filterItem[0]),
            "$lte":parseInt(filterItem[1]) };
    }
}

/*
 ===============
 Purpose: To build mongo db query from genpop  filters
 Input: genpopfilters
 Output: mongo query
 Author: Mikey
 ===============
 */

exports.makeFilterQueryObject = function (filters) {

    var result = {};

    // Example minimum aggregate kwh filter in filter object =  "aggregatekWh":["12345"]
    // matching mongo query is
    // db.WorkItems.find( { campaignId:null, aggregatekWh: { $gte:12345 } } )
    // This also works fine:
    // db.WorkItems.find( { "campaignId":null, "aggregatekWh": { $gte:95500 } } )

    for (var attr in filters) {

        var filterItem = filters[ attr ];

//        console.log( "attr is '" + attr + "' and item is '" + filterItem + "' " );

        if (filterItem) {

            // Check for non array types first:

            // dropRep & contactName:  Match case insensitive start of string using Mongo regex
            if ((attr === "dropRep") || attr === 'contactName') {
                result[ attr ] = { "$regex": filterItem, $options:'i' };
            }

            // accountNumber: match exact
            else if (attr === 'accountNumber') {
                result[ attr ] = filterItem;
            }

            // dropStatus : match lowercase
            else if ((attr === "dropStatusMapped") ) {
                result[ attr ] = filterItem.toLowerCase();
            }

            // commodity & : match exact except for all
            else if ( (attr === "commodity" || attr === 'dropType')
                && (filterItem !== 'All') ) {
                result[ attr ] = filterItem;
            }

            // accountType:  Special hardcoded lookup
            else if (attr === "accountType" ) {

                switch( filterItem ) {
                    case "Residential":
                        result[ attr ] = {"$in": ["1"]};
                        break;
                    case "Commercial":
                        result[ attr ] = {"$in": ["2","3"]};
                        break;
                    case "All":
                        // no filter
                        break;
                    default:
                        console.log( "Error unknown filter accountType:  " + filterItem );
                }
//                result[ attr ] = filterItem;
            }

            // Array filter types
            else if (filterItem.length > 0) {
                // Integer types:
                if ((attr === "aggregatekWh") ||
                    (attr === "annualkWh") ||
                    (attr === "normalizedAnnualUsage") ||
                    (attr === "aggregateGas") ||
                    (attr === "annualGasUsage") ||
                    (attr === "aggregateGreenkWh") ||
                    (attr === "cashbackBalance")) {

                    var attribute = attr;
                    intTypeHelper(filterItem, result, attribute);
                }

                // Calculated fields, assume the value is in the subdocument, but otherwise
                // as integers.
                else  if ((attr === "monthsActive") ||
                    (attr === "monthsUntilCashAward") ||
                    (attr === "monthsSinceDropped")) {

                    var attribute = "calculated." +  attr;
                    intTypeHelper(filterItem, result, attribute);
                }

                // Pricing is odd, it's basically a number but stored as a string, however we can
                // do string min / max matchign on it as it's always between 0 and 1
                // (0 and 0.25 practically speaking )
                else if (attr === "pricing") {
                    if (filterItem.length === 1 && filterItem[0]) {
                        result[ attr ] = { "$gte":filterItem[0] };
                    } else if (filterItem.length === 2 && !filterItem[1] && filterItem[0]) {
                        result[ attr ] = { "$gte":filterItem[0] };
                    } else if (filterItem.length === 2 && !filterItem[0] && filterItem[1]) {
                        result[ attr ] = { "$lte":filterItem[1] };
                    } else if (filterItem.length === 2 && filterItem[0] && filterItem[1]) {
                        result[ attr ] = { "$gte":filterItem[0],
                            "$lte":filterItem[1] };
                    }
                }

                // Dates: make something like this:
                // db.WorkItems.find(
                //  { serviceEndDate: { $gte: new ISODate( '2012-10-09T04:00:00.000Z' ) } ,
                //      campaignId:null },
                //  {accountName:1, serviceEndDate:1, campaignId:1} ).count()
                // Where the iso string is what's coming in from the client
                else if ((attr === "serviceEndDate") || (attr === "dropStatusDate")) {
                    if (filterItem.length === 1 && filterItem[0]) {
                        result[ attr ] = { "$gte":new Date(filterItem[0]) };
                    } else if (filterItem.length === 2 && !filterItem[1] && filterItem[0]) {
                        result[ attr ] = { "$gte":new Date(filterItem[0]) };
                    } else if (filterItem.length === 2 && !filterItem[0] && filterItem[1]) {
                        result[ attr ] = { "$lte":new Date(filterItem[1]) };
                    } else if (filterItem.length === 2 && filterItem[0] && filterItem[1]) {
                        result[ attr ] = { "$gte":new Date(filterItem[0]),
                            "$lte":new Date(filterItem[1]) };
                    }
                }


                // single or multi select lists (utilityState etc: make something like this:
                // { "utilityState":{ $in: ["NJ","NY","OH"] } }
                else if ((attr === "utilityState") ||
                    (attr === "utilityAbbr") ||
                    (attr === "partner")) {
                    result[ attr ] = { "$in":filterItem };
                }


            } // end of array filter types
        }
    }

    return result;
};

/*
 ===============
 Purpose: To build mongo db query from visual rule filters
 Input: visualRuleFilters
 Output: mongo query
 Author: sravanthi
 ===============
 */
// TODO: Test method
exports.makeVisualRuleQueryObject = function (visualRuleFilters){

    //  get the condition among selected filters by user
    var condition = visualRuleFilters.and ? "and" :"or" ;
    // get the selected filters by user based on condition
    var filters = visualRuleFilters[ condition ];


    var queryElements =[];
    var finalQuery={};

    //looping on selected filters to build mongo db query
    for(var i=0;i < filters.length; i++){
        var filter = filters[i];

        var query ={};
        var innerQuery = {};

        // convert String to Integer if selected field is  Number type
        if(filter.type == "Number"){
            filter.value = parseInt(filter.value);
        }
        // convert String to Date if selected field is  Date type
        if(filter.type == "Date"){
            filter.value = new Date(filter.value);
        }
        // convert String to Decimal if selected field is  Decimal type
        if(filter.type == "Decimal"){
            filter.value = parseFloat(filter.value);
        }

        //build proper inner query  based on selected operator if selected field type is Number/Date/Decimal
        if( (filter.type == "Number") || (filter.type == "Date") || (filter.type == "Decimal") ){
            if(filter.operator == "<"){
                innerQuery = {"$lt" : filter.value} ;
            }
            if(filter.operator == ">"){
                innerQuery = {"$gt" : filter.value} ;
            }
            if(filter.operator == "<="){
                innerQuery = {"$lte" : filter.value} ;
            }
            if(filter.operator == ">="){
                innerQuery = {"$gte" : filter.value} ;
            }
            if(filter.operator == "="){
                innerQuery =  filter.value ;
            }
            if(filter.operator == "!="){
                innerQuery = {"$ne" : filter.value} ;
            }
        }
        //build proper inner query  based on selected operator if selected field type is Text
        if(filter.type == "Text"){
            if(filter.operator == "Not Equal"){
                innerQuery = {"$ne" : filter.value} ;
            }
            if(filter.operator == "Contains"){
                innerQuery = {"$regex" : filter.value,$options:'i' } ;
            }
            if(filter.operator == "Exists"){
                if(filter.value == "yes"){
                    innerQuery = {"$exists" : true} ;
                }else{
                    innerQuery = {"$exists" : false} ;
                }

            }
        }
        //build proper inner query  based on selected operator if selected field type is SingleLookUp
        if(filter.type == "SingleLookUp"){
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
        if(filter.type == "MultiLookup"){
            if(filter.fieldName =="accountType"){
                var tempArray =[];
                for(var j=0;j < filter.value.length;j++ ){
                    var item = filter.value[j];
                    switch( item ) {
                        case "Residential":
                            tempArray.push("1");
                            break;
                        case "Commercial":
                            tempArray.push("2","3");
                            break;
                        case "All":
                            // no filter
                            break;
                        default:
                            console.log( "Error unknown filter accountType:  " + filter.fieldName );
                    }
                }
                filter.value = tempArray;
            }

            if(filter.operator == "In"){
                innerQuery = {"$in" : filter.value} ;
            }
            if(filter.operator == "Not In"){
                innerQuery = {"$nin" : filter.value} ;
            }
        }
        //build proper inner query  based on selected operator if selected field type is boolean
        if( filter.type == "boolean" ){
            innerQuery = filter.value == "yes" ? true : false ;
        }

        // build inner query
        query[filter.fieldName] = innerQuery;
        // add inner query to Query elements
        queryElements.push(query);
    }
    //build final mongo db query
    finalQuery["$"+condition] =  queryElements;

    // return final mongo query
    return finalQuery;
};