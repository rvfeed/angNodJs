// Substitute for console.log for IE8/9.  Reference this file in early index.html
// comment out the alert for production testing, but it can be useful for testing without the 
// ie developer tools open.
var alerttext = '';

if( !window.console) {
    window.console = {};
    alerttext += 'Made window.console... ';
}

if( !window.console.log ) {
    window.console.log = function( val ) {
//         alert( 'console.log: ' + val );
    };

    alerttext += 'Made window.console.log... ';
}

if( alerttext.length > 0 )
    //alert( alerttext );

if( !console ) {
    console = window.console;
    console.log( 'assigned console');
}