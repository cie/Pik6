// The **remote** is useless without a connection to the presentation server, so we prompt
// for the server's address right at the beginning

/*jshint browser:true, mootools:true */
var prompted = false;
window.addEvent('pikInitalize', function(){
	if(!prompted){
		pik.promptForRemoteIp();
		prompted = true;
	}
});