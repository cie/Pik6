// TODO

/*jshint browser:true, mootools:true */
/*globals pik:true */

window.addEvent('domready', function(){
"use strict";


// Timer
// -----
// Diplays the current local time and the time sice the presenter was started
var timer_start = Date.now(),
    timer_time = $('Pik-time'),
    timer_elapsed = $('Pik-elapsed');

// Pad a number with a leading zero
var timePad = function(x){
	x = x + '';
	if(x.length === 1){
		return '0' + x;
	}
	return x;
};

// Update the timer every second
setInterval(function(){
	var now = Date.now(),
	    diff = new Date(now - timer_start);
	timer_time.set('html', new Date(now).toLocaleTimeString());
	timer_elapsed.set('html', timePad(diff.getHours() - 1) + ':' +
	                          timePad(diff.getMinutes()) + ':' +
	                          timePad(diff.getSeconds()));
}, 1000);


// Slide select
// ------------
// A simple slelect element for jumping to a particular slide

var slideselect = $('Pik-slideselect');

// Fill the slide select with options each time the presentation (re-)initalizes
['pikInitalize', 'pikReInitalize'].each(function(event){
	window.addEvent(event, function(){
		var current = pik.getCurrent();
		slideselect.empty();
		var slides = $$('iframe')[0].contentWindow.pik.slides;
		slides.each(function(slide, index){
			// Try to extract a meaningful title from the slide and build an option
			// element with it
			var first = slide.getFirst('h1, h2, h3, h4, h5, h6, p, blockquote, li');
			var option_attributes = {
				'text' : (first) ? index + 1 + ': ' + first.get('text') : index,
				'value': index
			};
			// Pre-select the current option
			if(index === current){
				option_attributes.selected = 'selected';
			}
			var option = new Element('option', option_attributes);
			option.inject(slideselect);
		});
	});
});

// Got to the selected slide
slideselect.addEvent('change', function(){
	pik.goTo(this.value);
});

// When slides change, keep the slide select updated.
window.addEvent('pikSlide', function(activated){
	slideselect.value = activated;
});

});