// The **Remote** is a Node.js program that works exactly like the Web Worker that enables
// synchronized presentations in multiple browser windows. The difference is, that the
// remote uses the network to synchronize the presentation, which means that you can use
// multiple browsers or even mutiple devices to control your slides. Want to use your
// iPhone as a remote control? Start this script, open the presentation on both your
// presentation computer and your phone, use the "Remote" link in the control and enter
// the remote server's ip address.

/*jshint node:true, globalstrict:true */

"use strict";

// Setup Socket.io
var io = require('socket.io').listen(16911);
console.log('Remote running @ localhost:16911');

// The remote caches a copy of the presentation state. Its properties are:
//
// * `initialized`: True once the remote has been initialized by a presentation instance
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

// On connenction, post the cached state and setup the event to recieve states from the
// presentation
io.sockets.on('connection', function(socket){
	console.log('Client connected');
	socket.on('message', handleIncomingState);  // Standard update
	socket.on('request_update', function(){     // Initial update
		socket.emit('message', cached_state);
	});
	clients.push(socket);
});

// Process an incoming state from one of the presentation instances. Merge the incoming
// state with the current state and, if there was any new information, broadcast the
// result to all connected presentations except the specified client.
var handleIncomingState = function(data, source){
	Object.keys(data).forEach(function(key){
		cached_state[key] = data[key];
	});
	broadcastCurrentState(source);
};

// Broadcast the cached state to all presentation instances except the specified client.
var broadcastCurrentState = function(source){
	for(var i = 0, l = clients.length; i < l; i++){
		if(clients[i] && clients[i] !== source){
			clients[i].emit('message', cached_state);
		}
	}
};
