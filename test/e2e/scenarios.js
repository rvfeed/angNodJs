describe( 'ACME app', function() {

	it( 'should load the main app page', function() {
		browser().navigateTo('../../index.html');

		var selector = 'div.span6 a:eq(0)';
		
		expect( element( selector ).text() ).toBe( 'Admin' );
		
// 		expect( element( '.adminArea', 'Example element' ).text()).toBe( 'Admin : Jordon McConnell' );
		
// 		expect( element( '.brand', 'EP Logo Image' ).attr( 'style' )).toBe('foo.jpg');
		
	});

});