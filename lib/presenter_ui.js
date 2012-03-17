// The presenter has a few **special UI features** that this file takes care of.

/*jshint browser:true, mootools:true */
/*globals pik:true */

window.addEvent('domready', function(){
"use strict";

// Draggables
// ---------
// Lets the user resize and reposition the presenter interface

// Resize and reposition the main frame. To keep resize and drag functionality from
// colliding, detach and re-attach the resize listener when dragging
var main_resize = $('Pik-frame').makeResizable({
	handle: 'Pik-frame-resize-handle'
});
var main_drag = new Drag('Pik-frame', {
	handle: 'Pik-frame-handle'
}).addEvents({
	start: function(el){
		main_resize.detach();
	},
	complete: function(el){
		main_resize.attach();
	}
});

// Same story for the preview frame
var preview_resize = $('Pik-frame-preview').makeResizable({
	handle: 'Pik-frame-preview-resize-handle'
});
var preview_drag = new Drag('Pik-frame-preview', {
	handle: $('Pik-frame-preview-handle')
}).addEvents({
	start: function(el){
		preview_resize.detach();
	},
	complete: function(el){
		preview_resize.attach();
	}
});

// The timer box, controls and notes are only draggable, not resizeable
var timer_drag    = new Drag('Pik-timecontainer', { handle: 'Pik-timecontainer-handle' }),
    controls_drag = new Drag('Pik-framecontrols', { handle: 'Pik-framecontrols-handle' }),
    notes_drag    = new Drag('Pik-notes', { handle: 'Pik-notes-handle' });

// All draggable elements must have an incredibly high z-index while being dragged to keep
// them rom disappearing behind other elements. This is done using the `pik-dragging`
// class
[main_drag, preview_drag, timer_drag, controls_drag, notes_drag].each(function(drag){
	drag.addEvents({
		start: function(el){
			el.addClass('pik-dragging');
		},
		complete: function(el){
			el.removeClass('pik-dragging');
		}
	});
});

});