// The **presenter** is a frame like every other, but has a few special capabilities.

/*jshint browser:true, mootools:true */
/*globals pik:true */

window.addEvent('domready', function(){
"use strict";

// Changing to the presentation
// ----------------------------
// Modify the slides for the presenter every time a new presentation is (re-)initalized.

// For each iframe do the following:
//
// * Add some css that makes the hide overlay partly transparent in the presenter.
['pikInitalize', 'pikReInitalize'].each(function(event){
	window.addEvent(event, function(){
		var iframes = $$('iframe');
		iframes.each(function(iframe){

			new Element('style', {
				'html': '#Pik-hide { opacity:0.75; }'
			}).inject(iframe.contentWindow.document.head);

		});
	});
});


// Timer
// -----
// Diplays the current local time and the time sice the presenter was started.

// Pad a number with a leading zero
var timePad = function(x){
	x = x + '';
	if(x.length === 1){
		return '0' + x;
	}
	return x;
};

// Update the timer elements every seconds.
var timer_start = Date.now();
setInterval(function(){
	var now = Date.now(),
	    diff = new Date(now - timer_start);
	$('Pik-time').set('html', new Date(now).toLocaleTimeString());
	$('Pik-elapsed').set('html', timePad(diff.getHours() - 1) + ':' +
	                             timePad(diff.getMinutes()) + ':' +
	                             timePad(diff.getSeconds()));
}, 1000);


// Slide select
// ------------
// A select element for jumping to a particular slide

var slideselect = $('Pik-slideselect');

// Fill the slide select with options each time the presentation (re-)initalizes
['pikInitalize', 'pikReInitalize'].each(function(event){
	window.addEvent(event, function(){
		var current = pik.getCurrent();
		slideselect.empty();
		var slides = $$('iframe')[0].contentWindow.pik.slides;
		slides.each(function(slide, index){

			// Try to extract a meaningful title from the slide and build an option
			// element with it. If not title can be found, use only the slide number.
			// Pre-select the current option, create and add the option the select
			// element.
			var first = slide.getFirst('h1, h2, h3, h4, h5, h6, p, blockquote, li');
			var option_attributes = {
				'text' : (first) ? index + 1 + ': ' + first.get('text') : index,
				'value': index
			};
			if(index === current){
				option_attributes.selected = 'selected';
			}
			var option = new Element('option', option_attributes);
			option.inject(slideselect);

		});
	});
});

// Got to the selected slide when an option is selected.
slideselect.addEvent('change', function(){
	pik.goTo(this.value);
});

// When slides change, keep the slide select itself updated.
window.addEvent('pikSlide', function(activated){
	slideselect.value = activated;
});

});