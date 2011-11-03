/* The init function needs to be callable by the outside world */
var init;

(function(){
"use strict";

var iframes, numSlides;

/* Only fire events in the main presentation */
var fireEvents = (window.location.href.split('#')[0].substr(-10) === 'frame.html');

/* Create the web worker for synchronisation */
var worker, postMessage, handleMessage = null;
if(typeof SharedWorker === 'function'){
	worker = new SharedWorker('lib/worker.js', 'Pik6');
}

/* Process incoming worker messages */
var handleMessage = (function(){
	return (!worker) ? null : function(evt){
		if(typeof evt.data.hash !== 'undefined' && evt.data.hash !== getCurrent()){
			setCurrent(evt.data.hash, false);
		}
		if(typeof evt.data.file !== 'undefined' && evt.data.file !== iframes[0].contentWindow.location.href.split('#')[0]){
			iframes.each(function(iframe){
				iframe.contentWindow.location.href = evt.data.file;
			});
		}
	}
})();
if(worker) worker.port.onmessage = handleMessage;

/* Function to post the current state to the worker */
var postMessage = (function(){
	return (!worker) ? null : function(){
		return worker.port.postMessage({
			'file': iframes[0].contentWindow.location.href.split('#')[0],
			'hash': getHash()
		});
	}
})();

/* Return the current hash */
var getHash = function(){
	return (location.hash) ? (location.hash.indexOf('#') == 0) ? location.hash.substr(1) : location.hash : 0;
}

/* Get current slide from the window's hash or, if that fails
   from the function's cache */
var getCurrent = (function(){
	var cached = 0;
	return function(){
		var hash = parseInt(getHash());
		if(isNaN(hash)){
			return cached;
		} else {
			cached = hash;
			return hash;
		}
	};
})();

/* Change the current slide by setting the window's hash to x.
   Notify the worker if propagate is truthy */
var setCurrent = function(x, propagate){
	location.hash = x;
	if(propagate && worker){
		postMessage();
	}
}

/* The slide functions are nothing but shortcuts for triggering
   hash canges via setCurrent */
var slideTo   = function(to){
	if(to < numSlides && to > -1){
		fireEventsInIframes(to, getCurrent());
		setCurrent(to, true);
	}
};
var slideNext = function(){ slideTo(getCurrent() + 1) };
var slideBack = function(){ slideTo(getCurrent() - 1) };

/* Toggle the hidden status by switching the hash between the last
   known slide (getCurrent) or 'hide' */
var toggleHide = function(){
	var hash = (location.hash.indexOf('#') == 0 ? location.hash.substr(1) : location.hash);
	setCurrent((hash === 'hide') ? getCurrent() : 'hide', true);
};

/* Catch custom triggers für the slide and hide functions */
window.addEvents({
	'slideto'    : function(x){ slideTo(x); },
	'slidenext'  : slideNext,
	'slideback'  : slideBack,
	'togglehide' : toggleHide
});

/* Catch keydown events für the slide and hide functions */
document.addEvent('keydown', function(evt){
	var code = evt.event.keyCode;
	if(code === 39 || code === 34){
		slideNext();
	}
	else if(code === 37 || code === 33){
		slideBack();
	}
	else if(code === 116 || code === 190 || code === 27){
		toggleHide();
		evt.preventDefault();
	}
});

/* Apply a slide change to the iframes. Offset the iframes slide index
   by their index to make the presenter preview frame work */
var updateIframes = function(){
	var to = getCurrent();
	iframes.each(function(element, index){
		var win        = element.contentWindow,
		    slideIndex = to + index,
		    slide      = win.Pik6.slides[slideIndex];
		// "slide" may be undefined if a presentation with only one slide is opened in the presenter view
		if(typeof slide !== 'undefined'){
			win.location.hash = slide.get('id');
		}
	});
};

/* Fire the activate, deactivate and change events in the iframes */
var fireEventsInIframes = function(activate, deactivate){
	iframes.each(function(element, index){
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
init = function(i){
console.log('Init');
console.log(i);
	/* Save the iframes for later */
	iframes = i;

	/* Read the number of slides and the presentation's title
	   from one of the iframes */
	$$('title').set('text', iframes[0].contentWindow.document.getElements('title').get('text'))
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
			updateIframes();
			updateUi();
		}
	});

	/* Setup the "open presentation" dialog */
	$('Pik6-open-presentation').addEvent('click', function(){
		var url = window.prompt('Enter presentation URL to open');
		if(url){
			iframes.each(function(iframe){
				iframe.contentWindow.location.href = url;
			});
		}
	});

	/* Reload the current presentation */
	$('Pik6-reload-presentation').addEvent('click', function(){
		iframes.each(function(iframe){
			iframe.contentWindow.location.reload(true);
		});
	});

	/* Trigger inital updates */
	setCurrent(0, true);
	updateIframes();
	fireEventsInIframes(getCurrent(), null);
	updateUi(getCurrent(), numSlides);
	location.hash = getCurrent();

}

})();
