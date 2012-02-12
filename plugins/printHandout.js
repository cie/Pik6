// Enables a **handout mode** for printing, where only slides with the class `handout`
// are printed. The user is prompted for the printing mode (normal or handout) on print.

(function(){

// The following conditions must be met for automatic printing:
//
//  * The window must not be framed
//  * The window's hash must be `#print`
var framed     = (window.top !== window.self),
    print_hash = window.location.href.substr(-6);

if(!framed && print_hash === '#print'){

	// Important: activate before the load event to intercept the automatic printing
	window.addEvent('domready', function(){
		if(window.confirm('Print only handout slides?')){
			$$('.pik-slide:not(.handout)').setStyle('display', 'none');
		}
	});

}

})();