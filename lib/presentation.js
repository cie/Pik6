/* The global presentation object exposes information
   about the presentation to the parent document */
var Pik6 = {
	slides: []
}

window.addEvent('domready', function(){
"use strict";

/* Assign ids for all the slides that don't already have one
   and store the slides in the global presentation object */
$$('.pik6-slide').each(function(element, index){
	if(element.getProperty('id') === null){
		element.setProperty('id', 'Pik6Slide' + index);
	}
	Pik6.slides.push(element);
});

/* Function to setup aspect ratio, positions, font and slide size */
var setFontFrameSizePosition = function(){
	/* Force 4:3 ratio */
	var size      = $$('body').getSize(),
	    ratio     = 4 / 3,
	    newwidth  = (size[0].x > size[0].y * ratio) ? size[0].y * ratio : size[0].x,
	    newheight = (size[0].x > size[0].y * ratio) ? size[0].y         : size[0].y / ratio,
	    newsize = { 'width':  newwidth + 'px', 'height': newheight + 'px' };
	$('Pik6-presentation-container').setStyles(newsize);
	/* Set font size */
	var fontsize = (newheight + newwidth) / 6;
	$$('body').setStyle('font-size', fontsize + '%');
}

/* Resize and reposition on load and on resize and load */
window.addEvent('load', setFontFrameSizePosition);
window.addEvent('resize', setFontFrameSizePosition);

});

/* Catch keydown events */
document.addEvent('keydown', function(evt){
	var code =   evt.event.keyCode,
	    parent = window.parent;
	if(code == 39 || code == 34){
		parent.fireEvent('slidenext');
	}
	else if(code == 37 || code == 33){
		parent.fireEvent('slideback');
	}
	else if(code == 116 || code == 190 || code == 27){
		parent.fireEvent('togglehide');
		evt.preventDefault();
	}
});
