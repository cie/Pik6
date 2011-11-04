window.addEvent('domready', function(){
"use strict";

/* Timer */
(function(){
	var pad = function(x){ x = x + ''; if(x.length === 1) return '0' + x; return x; }
	var start = Date.now(), time = $('Pik6-time'), elapsed = $('Pik6-elapsed');
	setInterval(function(){
		var now = Date.now(), diff = new Date(now - start);
		time.set('html', new Date(now).toLocaleTimeString());
		elapsed.set('html', pad(diff.getHours() - 1) + ':' + pad(diff.getMinutes()) + ':' + pad(diff.getSeconds()));
	}, 1000);
})();

});
