// Keeps the presentation **document's background color** in sync with the current slide's
// background color. Add this file to your presentation and that's it!

/*jshint browser:true, mootools:true */
/*globals pik:true */

// Don't activate for framed documents
if(typeof pik !== 'undefined'){

window.addEvent('load', function(){

// Get the element the background color is applied to and save it's original state
var background_element = $$('body'),
    original_background_color  = background_element.getStyle('background-color');

// When a slide activates, check if it has a background color defined. In that case,
// apply the color to the background element. Otherwise apply the original background
// color.
pik.slides.each(function(slide){
	slide.addEvent('slideactivate', function(){
		var background_color = this.getStyle('background-color');
		if(background_color !== 'transparent'){
			background_element.setStyle('background-color', background_color);
		}
		else {
			background_element.setStyle('background-color', original_background_color);
		}
	});
});

});

}