// This file handles all the events related to **controlling presentations** via keyboard

/*jshint browser:true, mootools:true */

// Catch key events für the presentation controls and delegate them to the window that
// is responsible for controlling the presentation
window.addEvent('keydown', function(evt){
	var code = evt.event.keyCode;

	// The target for the events is either the frame's parent or, if there is no parent,
	// the window itself.
	var targetWindow = window.parent || window;

	// Go to the previous slide (left arrow key)
	if(code === 37 || code === 33){
		targetWindow.fireEvent('pikChangeSlidePrev');
	}

	// Go to the next slide (right arrow key)
	else if(code === 39 || code === 34){
		targetWindow.fireEvent('pikChangeSlideNext');
	}

	// Hide the presentation (F5)
	else if(code === 116 || code === 190 || code === 27){
		targetWindow.fireEvent('pikChangeHide');
		evt.preventDefault();
		evt.stopPropagation();
		return false;
	}

});