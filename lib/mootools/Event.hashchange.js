/*jshint browser:true, mootools:true */

/*
---
description: Added the onhashchange event

license: MIT-style

authors:
- sdf1981cgn
- Greggory Hernandez

requires:
- core/1.2.4: '*'

provides: [Element.Events.hashchange]

...
*/
Element.Events.hashchange = {
	onAdd: function(){
		var hash = location.hash;
		var hashchange = function(){
			if (hash == location.hash) return;
			else hash = location.hash;
			var value = (hash.indexOf('#') === 0 ? hash.substr(1) : hash);
			window.fireEvent('hashchange', value);
			document.fireEvent('hashchange', value);
		};
		if("onhashchange" in window){
			window.onhashchange = hashchange;
		}
		else{
			hashchange.periodical(50);
		}
	}
};
