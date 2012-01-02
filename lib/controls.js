// Catch key events für the **presentation controls** and delegate them to the window that is responsible
// for controlling the presentation

window.addEvent('domready', function(){

	// The target for the events is either the frame's parent or, if there is no parent, the window itself.
	var targetWindow = window.parent || window;

	document.addEvent('keydown', function(evt){
		var code = evt.event.keyCode;

		// Previous slide
		if(code === 37 || code === 33){
			targetWindow.fireEvent('pikChangeSlidePrev');
		}

		// Next slide
		else if(code === 39 || code === 34){
			targetWindow.fireEvent('pikChangeSlideNext');
		}

		// Hide presentation
		else if(code === 116 || code === 190 || code === 27){
			targetWindow.fireEvent('pikChangeHide');
			evt.preventDefault();
		}

	});

});
