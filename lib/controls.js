window.addEvent('domready', function(){

// Catch key events für the presentation controls
document.addEvent('keydown', function(evt){
	var code = evt.event.keyCode;
	if(code === 39 || code === 34){
		// Next
	}
	else if(code === 37 || code === 33){
		// Back
	}
	else if(code === 116 || code === 190 || code === 27){
		// Hide
		evt.preventDefault();
	}
});

});
