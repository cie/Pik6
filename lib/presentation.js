// This file manages everything related to **the inside of a slide set**. This includes
// setting the font size, maintaining the aspect ratio and exposing the list of slides
// to the parent frame.

/*jshint browser:true, mootools:true */

// Presentation object
// -------------------
// The global presentation serves as an API for the parent document. It's `slide` and
// `hide` properties can be set to control the visibility of slides. The `slides` property
// in turn exposes the list of slides to the parent document.
var pik = (function(){
	"use strict";

	// Store the current, next and previous slide number
	var slide = 0,
	    next  = 1,
	    prev  = -1;

	// The API to the pik object
	var api = Object.create(Object.prototype, {

		// List of slides. Accessible by the parent document, set by the presentation
		// itself.
		'slides': {
			writable: true,
			enumerable: true,
			configurable: true,
			value: []
		},

		// The `current` property can be set by the parent document to control which slide
		// is displayed. The as a result, the classes `pik-current`, `pik-next` and
		// `pik-previous` are assigned to the respective slides. This is accomplished by a
		// setter function that uses the `slide` variable to store the real value.
		'slide': {
			get: function(){
				return slide;
			},
			set: function(x){
				// Find out if this presentation instance is the first in the frame by
				// comparing the local slide variable with the result from the frame's
				// getCurrent(). If they differ, events won't be fired because they are
				// not needed in preview iframes.
				var fire_events = (x === window.parent.pik.getCurrent());
				// Remove old slides' classes
				$$(pik.slides[slide]).removeClass('pik-current');
				$$(pik.slides[next]).removeClass('pik-next');
				$$(pik.slides[prev]).removeClass('pik-prev');
				// Fire `slidedeactivate` event on the previously current slide
				if(fire_events){
					$$(pik.slides[slide]).fireEvent('slidedeactivate');
				}
				// Set new slides
				slide = x;
				next  = x + 1;
				prev  = x - 1;
				// Set new slides' classes
				$$(pik.slides[slide]).addClass('pik-current');
				$$(pik.slides[next]).addClass('pik-next');
				$$(pik.slides[prev]).addClass('pik-prev');
				// Fire `slideactivate` event on the new current slide and the
				// `slidechange` event on the window object
				if(fire_events){
					$$(pik.slides[slide]).fireEvent('slideactivate');
					window.fireEvent('slidechange', [slide]);
				}
			}
		},

		// Toggle the hidden status by toggleing a class on the overlay.
		'hide': {
			set: function(status){
				if(status){
					$('hide').addClass('pik-active');
				}
				else {
					$('hide').removeClass('pik-active');
				}
			}
		}

	});

	// No accidential extensions to `api` please
	Object.preventExtensions(api);
	return api;

})();


(function(){
"use strict";


// Presentation setup
// ------------------
// Take care of the aspect ratio, font size and click events.

window.addEvent('domready', function(){

// Store references to the slides in the global presentation object
$$('.pik-slide').each(function(element, index){
	pik.slides.push(element);
});

// Maintain a 4:3 aspect ratio, body positions, font and slide size
var setFontFrameSizePosition = function(){
	var size      = $$('body').getSize(),
	    ratio     = 4 / 3,
	    newwidth  = (size[0].x > size[0].y * ratio) ? size[0].y * ratio : size[0].x,
	    newheight = (size[0].x > size[0].y * ratio) ? size[0].y : size[0].x / ratio,
	    topmargin = Math.floor((size[0].y - newheight) / 2),
	    fontsize  = (newheight + newwidth) / 6;
	$('Pik-presentation-container').setStyles({
		'width'     : newwidth  + 'px',
		'height'    : newheight + 'px',
		'font-size' : fontsize  + '%',
		'top'       : topmargin + 'px'
	});
};

// Resize and reposition on resize and load
window.addEvent('load', setFontFrameSizePosition);
window.addEvent('resize', setFontFrameSizePosition);

// If there are "browse" links in the presentation, set the browser windows title back
// to default
$$('#Pik-browse').addEvent('click', function(){
	window.parent.$$('title').set('text', 'Browse presentations');
});

});

})();