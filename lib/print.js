// This file triggers **prining** if there is reason to assume that's what the user wants.

/*jshint browser:true, mootools:true */

(function(){

// The following conditions must be met for automatic printing:
//
//  * The window must not be framed
//  * The window's hash must be `#print`
var framed     = (window.top !== window.self),
    print_hash = window.location.href.substr(-6);
if(!framed && print_hash === '#print'){
	window.addEvent('load', function(){
		window.print();
	});
}

})();