window.addEvent('load', function(){
"use strict";

/* Only fire events in the main presentation */
var fireEvents = (window.location.href.split('#')[0].substr(-10) === 'frame.html');

/* DOM reference */
var iframes = $$('iframe');

/* Get current slide */
var getCurrent = (function(){
	var saved = 0;
	return function(){
		var hash = parseInt((location.hash) ? (location.hash.indexOf('#') == 0) ? location.hash.substr(1) : location.hash : 0);
		if(isNaN(hash)){
			return saved;
		} else {
			saved = hash;
			return hash;
		}
	};
})();

/* Set current slide */
var setCurrent = function(x){
	location.hash = x;
}

/* Apply a slide change to the iframes. Offset the iframes slide index
   by their index to make the presenter preview frame work */
var updateIframes = function(){
	var to = getCurrent();
	iframes.each(function(element, index){
		var win        = element.contentWindow,
		    slideIndex = to + index,
		    slideId    = win.Pik6.slides[slideIndex].get('id');
		win.location.hash = slideId;
	});
};

/* Fires the slide events in the iframes */
var fireEventsInIframes = function(deactivate, activate){
	iframes.each(function(element, index){
		var win = element.contentWindow;
		if(fireEvents){
			if(deactivate !== null) win.Pik6.slides[deactivate].fireEvent('deactivate');
			if(activate !== null) win.Pik6.slides[activate].fireEvent('activate');
			win.document.fireEvent('change', [deactivate, activate]);
		}
	});
};

/* Update the main UI elements */
var updateUi = function(){
	$('Pik6-framecontrols-slidecount').set('html', 1 + getCurrent() + ' / ' + numSlides);
}

/* The current slide index */
location.hash = getCurrent();

/* Read the number of slides and the presentation's title
   from one of the iframes */
$$('title').set('text', $($$('iframe')[0].contentWindow.document).getElements('title').get('text'))
var numSlides = iframes[0].contentWindow.Pik6.slides.length;

/* Inital updates */
updateIframes();
fireEventsInIframes(null, getCurrent());
updateUi();

/* The slide functions only trigger hash canges */
var slideTo = function(to){
	if(to < numSlides && to > -1){
		fireEventsInIframes(getCurrent(), to);
		setCurrent(to);
	}
};
var slideNext = function(){
	slideTo(getCurrent() + 1);
};
var slideBack = function(){
	slideTo(getCurrent() - 1);
};
var toggleHide = function(){
	var hash = (location.hash.indexOf('#') == 0 ? location.hash.substr(1) : location.hash);
	setCurrent((hash === 'hide') ? getCurrent() : 'hide');
};

/* Catch keydown events */
document.addEvent('keydown', function(evt){
	var code = evt.event.keyCode;
	if(code == 39 || code == 34){
		slideNext();
	}
	else if(code == 37 || code == 33){
		slideBack();
	}
	else if(code == 116 || code == 190 || code == 27){
		toggleHide();
		evt.preventDefault();
	}
});

/* Catch custom triggers */
window.addEvents({
	'slidenext':  slideNext,
	'slideback':  slideBack,
	'togglehide': toggleHide,
	'slideto':    function(x){ slideTo(x); }
});

/* Watch own window for hash changes and delegate the changes
   to the iframes. */
window.addEvent('hashchange', function(hash){
	if(hash === 'hide'){
		iframes.each(function(element, index){
			var window     = element.contentWindow;
			window.location.hash = 'hide';
		});
	}
	else {
		setCurrent(hash);
		updateIframes();
		updateUi();
	}
});

});
