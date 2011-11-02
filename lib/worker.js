/* Pool of connected presentation instances */
var clients = [];

/* Simply broadcast every incoming message */
self.onconnect = function(evt){
	var port = evt.ports[0];
	clients.push(port);
	port.onmessage = function(evt){
		for(var i = 0; i < clients.length; i++){
			if(clients[i] && clients[i] !== port){
				clients[i].postMessage(evt.data);
			}
		}
	};
};
