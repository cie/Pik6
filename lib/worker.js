// The **Worker** is responsible for synchronizing the presentation state between
// windows. Each presentation instance (presentation window or presenter) connects
// to the worker and exchanges JS objects describing the presentation's state.

/*jshint globalstrict:true */
/*global self:false */

"use strict";

// The worker caches a copy of the presentation state. Its properties are:
//
// * `initialized`: True once the worker has been initialized by a presentation instance
// * `file`: Path to the current presentation
// * `slide`: Current slide number
// * `hide`: True if the presentation is hidden at the moment
var cached_state = {
	initialized: false,
	file: 'index/index.html',
	slide: 0,
	hide: ''
};

// The list of connected presentation instances.
var clients = [];

// When a presentation instance connects, push it to the client list, add the event
// listener for incoming message  and post the cached state.
self.onconnect = function(evt){
	var port = evt.ports[0];
	clients.push(port);
	port.onmessage = handleIncomingState.bind(null, port);
	port.postMessage(cached_state);
};

// Process an incoming state from one of the presentation instances. Merge the incoming
// state with the current state and, if there was any new information, broadcast the
// result to all connected presentations except the specified port.
var handleIncomingState = function(port, evt){
	var incoming_state = evt.data;
	Object.keys(incoming_state).forEach(function(key){
		cached_state[key] = incoming_state[key];
	});
	broadcastCurrentState(port);
};

// Broadcast the cached state to all presentation instances except the specified port.
var broadcastCurrentState = function(port){
	for(var i = 0, l = clients.length; i < l; i++){
		if(clients[i] && clients[i] !== port){
			clients[i].postMessage(cached_state);
		}
	}
};