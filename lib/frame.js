(function(){
"use strict";

var numSlides;

/* Only fire events in the main presentation */
var fireEvents = (window.location.href.split('#')[0].substr(-10) === 'frame.html');

/* Get current slide from the window's hash or, if that fails
   from the function's cache */
var getCurrent = (function(){
	var cached = 0;
	return function(){
		var hash = parseInt((location.hash) ? (location.hash.indexOf('#') == 0) ? location.hash.substr(1) : location.hash : 0);
		if(isNaN(hash)){
			return cached;
		} else {
			cached = hash;
			return hash;
		}
	};
})();

/* Change the current slide by setting the window's hash */
var setCurrent = function(x){
	location.hash = x;
}

/* The slide functions are nothing but shortcuts for triggering
   hash canges via setCurrent */
var slideTo   = function(to){
	if(to < numSlides && to > -1){
		fireEventsInIframes(to, getCurrent());
		setCurrent(to);
	}
};
var slideNext = function(){ slideTo(getCurrent() + 1) };
var slideBack = function(){ slideTo(getCurrent() - 1) };

/* Toggle the hidden status by switching the hash between the last
   known slide (getCurrent) or 'hide' */
var toggleHide = function(){
	var hash = (location.hash.indexOf('#') == 0 ? location.hash.substr(1) : location.hash);
	setCurrent((hash === 'hide') ? getCurrent() : 'hide');
};

/* Catch custom triggers für the slide and hide functions */
window.addEvents({
	'slideto':    function(x){ slideTo(x); },
	'slidenext':  slideNext,
	'slideback':  slideBack,
	'togglehide': toggleHide
});

/* Catch keydown events für the slide and hide functions */
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

/* Apply a slide change to the iframes. Offset the iframes slide index
   by their index to make the presenter preview frame work */
var updateIframes = function(iframes){
	var to = getCurrent();
	iframes.each(function(element, index){
		var win        = element.contentWindow,
		    slideIndex = to + index,
		    slideId    = win.Pik6.slides[slideIndex].get('id');
		win.location.hash = slideId;
	});
};

/* Fire the activate, deactivate and change events in the iframes */
var fireEventsInIframes = function(activate, deactivate){
	fireEventsInIframes.iframes.each(function(element, index){
		var win = element.contentWindow;
		if(fireEvents){
			if(activate !== null) win.Pik6.slides[activate].fireEvent('activate');
			if(deactivate !== null) win.Pik6.slides[deactivate].fireEvent('deactivate');
			win.document.fireEvent('change', [activate, deactivate]);
		}
	});
};

/* Update the main UI elements */
var updateUi = function(){
	$('Pik6-framecontrols-slidecount').set('html', 1 + getCurrent() + ' / ' + numSlides);
}

/* Setup the iframes after a change or the inital loading */
var init = function(iframes){

	/* Read the number of slides and the presentation's title
	   from one of the iframes */
	$$('title').set('text', $($$('iframe')[0].contentWindow.document).getElements('title').get('text'))
	numSlides = iframes[0].contentWindow.Pik6.slides.length;

	/* Remove any hashchange events that may be present, then add a new
	   event that watches the window for hash changes and delegate the changes
	   to the iframes */
	window.removeEvents('hashchange');
	window.addEvent('hashchange', function(hash){
		if(hash === 'hide'){
			iframes.each(function(element, index){
				element.contentWindow.location.hash = 'hide';
			});
		}
		else if(hash !== ''){
			setCurrent(hash);
			updateIframes(iframes);
			updateUi();
		}
	});

	/* Trigger inital updates */
	updateIframes(iframes);
	fireEventsInIframes(getCurrent(), null);
	updateUi(getCurrent(), numSlides);
	location.hash = getCurrent();

}

/* Trigger init function when ALL iframes are ready */
window.addEvent('domready', function(){
	var iframes = $$('iframe');
	fireEventsInIframes.iframes = iframes;
	iframes.addEvent('load', function(){
		for(var i = 0; i < iframes.length; i++){
			if(!iframes[i].contentWindow.Pik6 || !iframes[i].contentWindow.Pik6.ready){
				location.hash = '';
				return;
			}
		}
		init(iframes);
	});
});

})();
