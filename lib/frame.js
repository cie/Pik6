// A **frame** is a presentation instance or a presenter view. It displays a presentation in one or
// more iframes and synchronizes it's state with other instances via a shared worker.


(function(baseUrl){
"use strict";


// Managing state
// --------------

// Keep a local copy of the state, The properties are:
//
// * `initialized`: True once the worker has been initialized by a presentation instance
// * `slide`: Current slide number
// * `file`: Path to the current presentation
// * `hide`: True if the presentation is hidden at the moment
// * `working`: True if PIK6 is loading something
//
// Changes to the local state automatically trigger the corrosponding events, which in turn are used
// to keep the presentation and the UI up to date.
var local_state = (function(){

	// All getters for this object are the same
	var createGetter = function(key){
		return function(){
			return internal_state[key];
		};
	}

	// Represents the real state values
	var internal_state = {
		initialized: false,
		slide: 0,
		file: '',
		hide: '',
		working: false
	};

	// Keeps a copy of the previous state
	var previous_state = {};

	// Return the api to the real state (internal_state)
	return Object.create(Object.prototype, {

		// Fire the "pikInitalize" event when this value changes from false to true for the first time.
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

		// Fire the "pikSlide" event when the value changes. Pass the new slide and the previous slide as arguments.
		slide: {
			enumerable: true,
			get: createGetter('slide'),
			set: function(value){
				previous_state.slide = internal_state.slide;
				internal_state.slide = value;
				window.fireEvent('pikSlide', [internal_state.slide, previous_state.slide]);
			}
		},

		// Fire the "pikFile" event when the value changes. Pass the new file as argument.
		file: {
			enumerable: true,
			get: createGetter('file'),
			set: function(value){
				previous_state.file = internal_state.file;
				internal_state.file = value;
				window.fireEvent('pikFile', [internal_state.file]);
			}
		},

		// Fire the "pikHide" event when the value changes to true and "pikShow" when it changes to false.
		hide: {
			enumerable: true,
			get: createGetter('hide'),
			set: function(value){
				previous_state.hide = internal_state.hide;
				internal_state.hide = value;
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

		// Fire the "pikWorking" event when the value changes to true and "pikReady" when it changes to false.
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
})();


// Web Worker
// ----------
// The web worker keeps the different presentation windows in sync.

// If our browser doesn't support shared workers, we need to work around some things later.
var supports_worker = (typeof SharedWorker === 'function');
if(supports_worker){

	// If we have support, connect to the worker
	if(typeof baseUrl === 'undefined'){
		var baseUrl = '';
	}
	var worker = new SharedWorker(baseUrl + 'lib/worker.js', 'Pik6');

	// Post the local state to the worker. We have to make a copy of the local_state object because sending
	// it directly causes strange things to happen.
	var postState = function(){
		var post_state = {};
		Object.keys(local_state).forEach(function(key){
			post_state[key] = local_state[key];
		});
console.log('Poste', post_state);
		worker.port.postMessage(post_state);
	}

	// A new incoming state replaces the old local copy of the state. This only happens for new states that did
	// not come from this presentation instance.
	worker.port.onmessage = function(evt){
		var incoming_state = evt.data;
console.log('Empfange', incoming_state.slide, 'aus', incoming_state);
		if(incoming_state.initialized){
			Object.keys(incoming_state).forEach(function(key){
				local_state[key] = incoming_state[key];
			});
		}
	};

}


// When the updateState function is used, changes to the state are made and _are sent to the worker too!_ This
// function should always be used to set state, except when dealing with updates recieved from the worker.
var updateState = function(changes_to_state){
	Object.keys(changes_to_state).forEach(function(key){
		local_state[key] = changes_to_state[key];
	});
	postState();
};


// Presentation Events
// -------------------
// Actions in the presentation are triggered by events that come either from key events (see `controls.js`) or
// are delegated to the frame by one of its iframes.

// Listen to the events that trigger changes in the presentation
window.addEvents({

	// Go to slide number `slide`
	'pikChangeSlide': function(slide){
		updateState({ 'slide': slide });
	},

	// Go to the previous slide
	'pikChangeSlidePrev': function(){
		var goTo = (local_state['slide'] > 0) ? local_state['slide'] - 1 : 0;
		updateState({ 'slide': goTo });
	},

	// Go to the next slide
	'pikChangeSlideNext': function(){
		var goTo = local_state['slide'] + 1;
		updateState({ 'slide': goTo });
	},

	// Change to file `file`
	'pikChangeFile': function(file){
		updateState({ 'file': file });
	},

	// Toogle the hidden state
	'pikChangeHide': function(){
		if(local_state['hide']){
			updateState({ 'hide': false });
		}
		else{
			updateState({ 'hide': true });
		}
	}

});

















['pikInitalize', 'pikSlide', 'pikFile', 'pikHide', 'pikShow', 'pikWorking', 'pikDone'].forEach(function(evt){
	window.addEvent(evt, function(){
		console.log('Event', evt, 'feuert', arguments[0], arguments[1]);
	});
});


})(pik6BaseUrl);
