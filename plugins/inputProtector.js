// This plugin prevents Pik6 from interpreting **key events** fired on input elements
// inside the presentation as presentation commands.

/*jshint browser:true, mootools:true */

window.addEvent('domready', function(){
	var navigation_keys = [33, 37, 34, 39],
	    refresh_keys    = [116, 190, 27];
	$$('input, textarea').addEvent('keydown', function(evt){
		var code = evt.event.keyCode;
		if(navigation_keys.indexOf(code) !== -1){
			evt.stopPropagation();
		}
		else if(refresh_keys.indexOf(code) !== -1){
			evt.stopPropagation();
			evt.preventDefault();
		}
	});
});