// csv processing

// home page: http://www.adaltas.com/projects/node-csv/

var csv = require('csv');

/*
 The test function is merely for testing and should be removed when in production
 */
exports.test = function() {

    console.log( "CSV basic:" );
    csv()
        .from('"1","2","3","4","5"')
        .to(function(data){ console.log( 'z: ' + data) });

    var array = [
        {
            "_id":"513e2502ca0cb04fb2cd3e38",
            "accountName":"APPLEWOOD ORCHARDS, LLC",
            "accountNumber":"9029785009",
            "aggregatekWh":20443
        },
        {
            "_id":"513e2502ca0cb04fb2cd3e37",
            "accountName":"APPLEWOOD ORCHARDS LLC",
//            "accountNumber":"9008785009",
            "aggregatekWh":3232323
        },
        {
            "_id":"513e30c0ca0cb04fb2cd8045",
            "accountName":"APPLEWOULD APPARTMENTS",
            "accountNumber":"5638027000",
            "aggregatekWh":113130
        }
    ];


//    console.log( "CSV: about to do columns:" );
    csv()
        .from(array, {columns:['_id', 'accountName', 'accountNumber','aggregatekWh']
        })
        .to(function (data) {
            console.log('a: ' + data)
        });


//    console.log("CSV: about to do headers & columns:");
    csv()
        .from(array,
        {columns:['_id', 'accountName', 'accountNumber', 'aggregatekWh'],
            header:true
        })
        .to(function (data) {
            console.log('b: '+ data)
        });

//    console.log("CSV: about to do headers & columns:");
    csv()
        .from(array,
        {columns:['_id', 'accountName', 'accountNumber', 'aggregatekWh'],
            header:true
        })
        .to(function (data) {
            console.log('c: '+ data)
        }, { header:true});

};

/*
 Process fields from data and return to the dataCallback

  fields:  comma separated list of fields that should be in the export
  data: Array of JSON objects representing data
  dataCallback: function to return the csv (as a string) to.  CSV data will
                have header line and \n separated lines of data
 */
exports.processToCsv = function( fields, data, dataCallback ) {

    console.log("CSV: processing " + data.length + " items, fields = '" + fields + "'" );

    var columns = fields.split( ',' );

    csv()
        .from(data,
        {columns:columns,
            header:true
        })
        .to(dataCallback, { header:true});

};