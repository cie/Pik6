// Keeps the presentation document's background color in sync with the current slide's
// background color. Add this file to your presentation and that's it

/*jshint browser:true, mootools:true */

window.addEvent('load', function(){
	var background_element = $$('body'),
	    original_background_color  = background_element.getStyle('background-color');
	pik.slides.each(function(slide){
		slide.addEvent('slideactivate', function(){
			var background_color = this.getStyle('background-color');
			console.log(background_color);
			if(background_color !== 'transparent'){
				background_element.setStyle('background-color', background_color);
			}
			else {
				background_element.setStyle('background-color', original_background_color);
			}
		});
	});
});