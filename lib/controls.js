// This file handles all the events related to **controlling presentations** via keyboard
// or touch screen.

/*jshint browser:true, mootools:true */

(function(){


// The target for the events that are fired by control actions is either the frame's
// parent or, if there is no parent, the window itself.
var targetWindow = window.parent || window;


// Catch swipe events
if(typeof MooSwipe !== 'undefined'){
	new MooSwipe(window, {
		tolerance: 100,
		onSwipeLeft: function(){
			targetWindow.fireEvent('pikChangeSlidePrev');
		},
		onSwipeRight: function(){
			targetWindow.fireEvent('pikChangeSlideNext');
		},
		onSwipeUp: function(){
			targetWindow.fireEvent('pikShowControlPanel');
		},
		onSwipeDown: function(){
			targetWindow.fireEvent('pikHideControlPanel');
		}
	});
}


// Catch key events für the presentation controls and delegate them to the window that
// is responsible for controlling the presentation
window.addEvent('keydown', function(evt){
	var code = evt.event.keyCode;

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


})();