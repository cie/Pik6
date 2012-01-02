// A **frame** is a presentation instance or a presenter view. It displays a presentation in one or
// more iframes and synchronizes it's state with other instances via a shared worker.


(function(){
"use strict";


// Managing state
// --------------

// Keep a local copy of the state, The properties are:
//
// * `initialized`: True once the worker has been initialized by a presentation instance
// * `slide`: Current slide number
// * `file`: Path to the current presentation
// * `hidden`: True if the presentation is hidden at the moment
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
		hidden: '',
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
		hidden: {
			enumerable: true,
			get: createGetter('hidden'),
			set: function(value){
				previous_state.hidden = internal_state.hidden;
				internal_state.hidden = value;
				if(previous_state.hidden != internal_state.hidden){
					if(internal_state.hidden){
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


// If our browser doesn't support shared workers, we need to work around some things later.
var supports_worker = (typeof SharedWorker === 'function');
if(supports_worker){

	// If we have support, connect to the worker
	var worker = new SharedWorker('lib/worker.js', 'Pik6');

	// Post the local state to the worker
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


// If the updateState function is used, changes to the state are sent to the worker too. This should always be used
// except when dealing with worker messages.
var updateState = function(changes_to_state){
	Object.keys(changes_to_state).forEach(function(key){
		local_state[key] = changes_to_state[key];
	});
	postState();
};















['pikInitalize', 'pikSlide', 'pikFile', 'pikHide', 'pikShow', 'pikWorking', 'pikDone'].forEach(function(evt){
	window.addEvent(evt, function(){
		console.log('Event', evt, 'feuert', arguments[0], arguments[1]);
	});
});




/*setTimeout(function(){
	console.log('Update ausgelöst!');
	updateState({ slide: 8 });
	console.log('State', local_state.slide);
}, 3000);

setTimeout(function(){
	console.log('Update ausgelöst!');
	updateState({ slide: 12, file: 'foo' });
	console.log('State', local_state.slide);
}, 6000);

setTimeout(function(){
	console.log('Update!');
	local_state.slide = 14;
}, 9000);*/



})();
