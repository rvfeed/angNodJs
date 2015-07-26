describe( 'The filters should ', function() { 
	
	beforeEach( module( 'myApp' ) );
	
	describe( 'startFrom', function() {
		
		var list = [ 1,3,5,7,9,13 ];
	
		it( 'should return the same list', inject( function( startFromFilter) {
		
			expect( startFromFilter( list, 0 ) ).toContain( 1 );
			expect( startFromFilter( list, 0 ).length ).toBe( list.length );
		    
		    var i = 0;
		    var len = list.length;
		    
		    for( i = 0; i < len; i++ ) {
		    	expect( startFromFilter( list, 0 )[i] ).toBe( list[i] );
		    }
		})); 
		
		it( 'should return a sub list', inject( function( startFromFilter) {
		
			expect( startFromFilter( list, 3 ) ).not.toContain( 1 );
			expect( startFromFilter( list, 3 ).length ).toBe( list.length - 3 );
		    
		    var i = 3;
		    var len = list.length;
		    
		    for( ; i < len; i++ ) {
		    	expect( startFromFilter( list, 3 )[i-3] ).toBe( list[i] );
		    }
		})); 
		
	} );
	
} );	
		
