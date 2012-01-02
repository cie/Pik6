// This file manages the inside of a slide set

// The global presentation object exposes information about the presentation to the parent document
var Pik = {
	slides: []
}

window.addEvent('domready', function(){
"use strict";

// Assign ids for all the slides that don't already have one and store references to the slides in
// the global presentation object
$$('.Pik-slide').each(function(element, index){
	if(element.getProperty('id') === null){
		element.setProperty('id', 'PikSlide' + index);
	}
	Pik.slides.push(element);
});

// Retain a 4:3 aspect ratio, body positions, font and slide size
var setFontFrameSizePosition = function(){
	var size      = $$('body').getSize(),
	    ratio     = 4 / 3,
	    newwidth  = (size[0].x > size[0].y * ratio) ? size[0].y * ratio : size[0].x,
	    newheight = (size[0].x > size[0].y * ratio) ? size[0].y         : size[0].x / ratio,
	    topmargin = Math.floor((size[0].y - newheight) / 2),
	    fontsize = (newheight + newwidth) / 6;
	$('Pik-presentation-container').setStyles({
		'width'  : newwidth + 'px',
		'height' : newheight + 'px',
		'font-size'  : fontsize + '%',
		'top' : topmargin + 'px'
	});
}

// Resize and reposition on resize and load
window.addEvent('load', setFontFrameSizePosition);
window.addEvent('resize', setFontFrameSizePosition);

// If there's a "browse" link in the presentation, keep the browser windows title up to date
$$('#Pik-browse').addEvent('click', function(){
	window.parent.$$('title').set('text', 'Browse presentations');
});

});
