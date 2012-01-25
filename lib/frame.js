// A **frame** is a presentation instance or a presenter view. It displays a
// presentation in one or more iframes and synchronizes it's state with other instances
// via a shared worker.

/*jshint browser:true, mootools:true */


// Expose the pik object for the init function to the outside world
var pik = {};


(function(){
"use strict";

// Represents the presentation state for the frame.
var local_state;


// Iframes and slides
// ------------------

// The iframes contain the presentations. The `slides` variable contains a reference to
// the first iframe's slides array, which is the authoritative source for slide
// information. Both variables are populated by the init and re-init functions.
var iframes, num_iframes, slides;

// The iframes are updated by setting the `slide` and `hide` property on their global
// `pik` objects. To make the presenter mode and similar interfaces work, each iframe
// after the first recieves a slide number that's increased by 1.
var updateIframes = function(property, value){
	iframes.each(function(iframe){
		iframe.contentWindow.pik[property] = value;
		if(property === 'slide'){
			value++;
		}
	});
};

// Calculate the common path of two urls. Stolen from http://medialize.github.com/URI.js/
// by Rodney Rehm
var commonPath = function(a, b){
	var length = Math.min(a.length, b.length), pos;
	for(pos = 0; pos < length; pos++){
		if(a[pos] !== b[pos]){
			pos--;
			break;
		}
	}
	if(pos < 1){
		return a[0] === b[0] && a[0] === '/' ? '/' : '';
	}
	if(a[pos] !== '/'){
		pos = a.substring(0, pos).lastIndexOf('/');
	}
	return a.substring(0, pos + 1);
};

// When a pikFile event fires, update the frame's iframes with the new presentation and
// set the current slide to 0
window.addEvent('pikFile', function(file){
	var href_frame = window.location.href,
	    href_presentation_old = iframes[0].contentWindow.location.href,
	    common_path = commonPath(href_frame, href_presentation_old),
	    href_presentation_new = common_path + file;
	iframes.each(function(iframe){
		if(iframe.contentWindow.location.href !== href_presentation_new){
			iframe.contentWindow.location.href = href_presentation_new;
		}
	});
});


// Managing state
// --------------

// The `local_state` variable represents the presentation state for the frame. The
// properties are:
//
// * `initialized`: True once the worker has been initialized by a presentation instance
// * `slide`: Current slide number
// * `file`: Path to the current presentation
// * `hide`: True if the presentation is hidden at the moment
// * `working`: True if PIK6 is loading something (not used ATM)
//
// Changes to the local state automatically trigger the corrosponding events, which in
// turn are used to keep the presentation and the UI up to date.
local_state = (function(){

	// This reflects the real state values that are only accessible by the
	// APIs getter and setter methods
	var internal_state = {
		initialized: false,
		slide: 0,
		file: 'lib/start.html',
		hide: '',
		working: false
	};

	// All getters for this object are the same, so we can generate them here.
	var createGetter = function(key){
		return function(){
			return internal_state[key];
		};
	};

	// Keep a copy of the previous state
	var previous_state = {};

	// Create the api to the real state (`internal_state`)
	var api = Object.create(Object.prototype, {

		// Fire the `pikInitalize` event when this value changes from false to true for
		// the first time.
		initialized: {
			enumerable: true,
			get: createGetter('initialized'),
			set: function(value){
				previous_state.initialized = internal_state.initialized;
				internal_state.initialized = value;
				if(!previous_state.initialized){
					window.fireEvent('pikInitalize');
				}
			}
		},

		// Change the slides, but only if the slide we want to go to actually exists.
		// Fire the `pikSlide` event when the value changes. Pass the new slide previous
		// slide's  numbers as arguments.
		slide: {
			enumerable: true,
			get: createGetter('slide'),
			set: function(value){
				if(slides[value]){
					previous_state.slide = internal_state.slide;
					internal_state.slide = value;
					updateIframes('slide', value);
					window.fireEvent('pikSlide', [internal_state.slide,
					                              previous_state.slide]);
				}
			}
		},

		// Fire the `pikFile` event when the value changes. Pass the new file as
		// argument.
		file: {
			enumerable: true,
			get: createGetter('file'),
			set: function(value){
				// If the file is actually a directory, shave of the final slash
				if(value.lastIndexOf('/') === value.length - 1){
					value = value.substr(0, value.length - 1);
				}
				previous_state.file = internal_state.file;
				internal_state.file = value;
				if(previous_state.file != internal_state.file){
					window.fireEvent('pikFile', [internal_state.file]);
				}
			}
		},

		// Fire the `pikHide` event when the value changes to true and `pikShow` when
		// it changes to false.
		hide: {
			enumerable: true,
			get: createGetter('hide'),
			set: function(value){
				previous_state.hide = internal_state.hide;
				internal_state.hide = value;
				updateIframes('hide', value);
				if(previous_state.hide != internal_state.hide){
					if(internal_state.hide){
						window.fireEvent('pikHide');
					}
					else {
						window.fireEvent('pikShow');
					}
				}
			}
		},

		// Fire the `pikWorking` event when the value changes to true and `pikReady` when
		// it changes to false.
		working: {
			enumerable: true,
			get: createGetter('working'),
			set: function(value){
				previous_state.working = internal_state.working;
				internal_state.working = value;
				if(previous_state.working != internal_state.working){
					if(internal_state.working){
						window.fireEvent('pikDone');
					}
					else {
						window.fireEvent('pikWorking');
					}
				}
			}
		}
	});

	// No accidential extensions to `api` please
	Object.preventExtensions(api);
	return api;

})();


// Managing the URL
// ----------------
// The frames URL reflects the presentation's file, slide number and hidden state. It
// can be manipulated to trigger changes to the state.

// Functions used to build, parse and set the state URL
var buildStateUrl, pushState, parseStateUrl, updateState;

// Build a new url for the browser history. It has the format
// `"#!/frame_file/presentation/slide_number(/hidden)"`, where `slide_number` is actually
// the slide number + 1. Too many people out there start counting at 1...
buildStateUrl = function(){
	var url = window.location.href.split('#')[0];
	url += '#!';
	url += '/' + local_state.file;
	url += '/' + (parseInt(local_state.slide, 10) + 1);
	if(local_state.hide){
		url += '/hide';
	}
	return url;
};

// Replace the browser url with our new url
pushState = function(){
	window.location.href = buildStateUrl();
};

// Parse a state url. This is uber ugly but that's URL parsing for you...
parseStateUrl = function(){
	var parsed_state = { },
	    state_url = window.location.href.split('!/')[1];
	if(typeof state_url !== 'undefined'){
		var split_state_url = state_url.split('/').reverse();
		for(var i = 0, l = split_state_url.length; i < l; i++){
			// If the last member of the state url is "hidden" , treat it as the
			// "hidden" parameter
			if(split_state_url[i] === split_state_url[0] &&
			   split_state_url[i] === 'hide'){
				parsed_state.hide = true;
				// The next member in the state url after the "hidden" parameter
				// must be the "slide" parameter. Remember to substract -1 from the
				// url parameter!
				if(!isNaN(parseInt(split_state_url[++i], 10))){
					parsed_state.slide = parseInt(split_state_url[i], 10) - 1;
				}
				else return;
			}
			// If the last member of the state url is a number, treat it as the
			// "slide" parameter. Also set hide to false. Remember to substract -1
			// from the url parameter!
			else if(split_state_url[i] === split_state_url[0] &&
				    !isNaN(parseInt(split_state_url[i], 10))){
				parsed_state.slide = parseInt(split_state_url[i], 10) - 1;
				parsed_state.hide = false;
			}
			// When we have a slide number and the hidden state, we can concatenate the
			// rest of the state url and treat it as the file path
			else {
				parsed_state.file = split_state_url.slice(i).reverse().join('/');
				break;
			}
		}
	}
	// Return undefined if we we don't have a state url
	else {
		return;
	}
	return parsed_state;
};

// On hash change parse the url and set it as the new state
window.addEvent('hashchange', function(hash){
	var parsed_url = parseStateUrl();
	updateState(parsed_url);
});


// Web Worker
// ----------
// The web worker keeps the different presentation windows in sync. New states can
// be pushed to the worker using the `postState` function.

// Function used by the rest of the code to push the local state to the worker
var postState;

// Does the browser support Shared Web Workers?
var supports_worker = (typeof SharedWorker === 'function');

// The setupWorker function is used to initalize the frame when workers are available
var setupWorker = function(pik_base_url){

	// Connect to the worker using the base url specified in the presentation
	if(typeof pik_base_url === 'undefined'){
		pik_base_url = '';
	}
	var worker = new SharedWorker(pik_base_url + 'lib/worker.js', 'Pik6');

	// Post the local state to the worker. We have to make a copy of the local_state
	// object because sending it (and all it's setter and getter magic) directly causes
	// strange things to happen.
	postState = function(){
		var post_state = { };
		Object.keys(local_state).forEach(function(key){
			post_state[key] = local_state[key];
		});
		worker.port.postMessage(post_state);
	};

	// A new incoming state replaces the old local copy of the state. This only happens
	// for new states that did not come from this presentation instance.
	worker.port.onmessage = function(evt){
		var incoming_state = evt.data;
		// If the worker reports an initialized state, use this state for the presentation
		if(incoming_state.initialized){
			Object.keys(incoming_state).forEach(function(key){
				local_state[key] = incoming_state[key];
			});
			pushState();
		}
		// If the worker has not been initialized yet, read the state from the url, set
		// initialized to true and post back the state
		else {
			var state_from_url = parseStateUrl();
			state_from_url.initialized = true;
			updateState(state_from_url);
		}
	};

};

// When the updateState function is used, changes to the state are made and _are sent
// to the worker too!_ This function should always be used to set state, except when
// dealing with updates recieved from the worker. The function expects a state object. If
// the object contains changes to the local state, the changes are applied, the woker is
// notified and the url is changed.
updateState = function(changes_to_state){
	var state_changes = false;
	Object.keys(changes_to_state).forEach(function(key){
		if(local_state[key] !== changes_to_state[key]){
			local_state[key] = changes_to_state[key];
			state_changes = true;
		}
	});
	if(state_changes){
		if(supports_worker){
			postState();
		}
		pushState();
	}
};


// Initalize
// ---------

// The pikInit function triggers the inital state update and sets up the iframes.
// If we have worker support, let it take care of the initial state. Otherwise
// parse the state url and set the local state.
pik.init = function(pik_base_url){
	iframes = $$('iframe');
	num_iframes = iframes.length;
	slides  = iframes[0].contentWindow.pik.slides;
	var frame_title = iframes[0].contentWindow.document.getElements('title').get('html');
	$$('title').set('html', frame_title);
	if(supports_worker){
		setupWorker(pik_base_url);
	}
	else {
		var state_from_url = parseStateUrl();
		state_from_url.initialized = true;
		updateState(state_from_url);
	}
};

// After init, re-apply all local state variables once. This makes sure iframes, state
// and everything else in always in sync.
window.addEvent('pikInitalize', function(){
	Object.keys(local_state).forEach(function(key){
		local_state[key] = local_state[key];
	});
});


// Re-initalize
// ------------
// Re-initialize when a new presentation file is loaded.

// The re-init function
// * updates the `slides` variable with the contents of the new presentation
// * sets the new title for the frame
// * updates the presentation with it's slide number and hide state
// * post the new presentation's url to the worker
var reInit = function(){
	// New slide set
	slides = iframes[0].contentWindow.pik.slides;
	// New title
	var frame_title = iframes[0].contentWindow.document.getElements('title').get('html');
	$$('title').set('html', frame_title);
	// Update the iframes
	updateIframes('slide', local_state.slide);
	updateIframes('hide', local_state.hide);
	// Update the worker with the new file. The new file's path must be relative to the
	// frame, so we figure out the new presentation's path and post it to the worker.
	var href_frame = window.location.href,
	    href_presentation = iframes[0].contentWindow.location.href,
	    common_path = commonPath(href_frame, href_presentation),
	    file_path = href_presentation.substring(common_path.length);
	updateState({
		'file': file_path
	});
};

// When the iframes fire load events _after_ init has happened, re-initialize the
// presentations. Wait for the last iframe to do so and only re-initalize if the
// new document actually is a presentation.
window.addEvent('pikInitalize', function(){
	var loaded = 0;
	iframes.addEvent('load', function(){
		if(this.contentWindow.pik){
			loaded++;
			if(loaded == iframes.length){
				reInit();
				loaded = 0;
			}
		}
	});
});


// Presentation Events
// -------------------

// Actions in the presentation are triggered by events that come either from key events
// (see `controls.js`) or are delegated to the frame by one of its iframes.
window.addEvents({

	// Go to slide number `slide` when `pikChangeSlide` fires, provided the slide exists.
	'pikChangeSlide': function(slide){
		if(slides[slide]){
			updateState({ 'slide': slide });
		}
	},

	// Go to the previous slide when `pikChangePrev` fires, provided the slide exists.
	'pikChangeSlidePrev': function(){
		var goTo = (local_state['slide'] > 0) ? local_state['slide'] - 1 : 0;
		if(slides[goTo]){
			updateState({ 'slide': goTo });
		}
	},

	// Go to the next slide when `pikChangeNext` fires, provided the slide exists.
	'pikChangeSlideNext': function(){
		var goTo = local_state['slide'] + 1;
		if(slides[goTo]){
			updateState({ 'slide': goTo });
		}
	},

	// Change to file `file` when `pikChangeFile` fires
	'pikChangeFile': function(file){
		updateState({ 'file': file });
	},

	// Toogle the hidden state when `pikChangeHide` fires
	'pikChangeHide': function(){
		if(local_state['hide']){
			updateState({ 'hide': false });
		}
		else{
			updateState({ 'hide': true });
		}
	}

});


// Frame UI
// --------
// Handle everything that's related to controls not activated by keypress events.

window.addEvent('domready', function(){

// Browsing for presentations resets the current slide
$$('#Pik-framecontrols-browse').addEvent('click', function(){
	updateState({ 'slide': 0 });
});

// Keep the frame count and frame number up to date when slides change
window.addEvent('pikSlide', function(slide){
	$$('#Pik-framecontrols-slidecount').set('html', ++slide + ' / ' + slides.length);
});

// Force a reload for all iframes
$$('#Pik-framecontrols-reload').addEvent('click', function(){
	iframes.each(function(iframe){
		iframe.contentWindow.location.reload();
	});
});

});

})();