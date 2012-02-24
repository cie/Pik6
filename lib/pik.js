// This file is **the only file** you need to include in a presentation. It loads
// all the necessary resources automatically. `document.write()` is a pretty poor
// resource loader, but there's really no need to get fancy here.

/*jshint browser:true */

// The loader assumes that the presentation resides in presentations/somefolder. Set a
// global variable `pik_base_url` to use a different base path.
if(typeof pik_base_path === 'undefined'){
	var pik_base_path = '../../';
}

(function(){

// Include MooTools, PrefixFree and basic print resources
document.write('<script src="' + pik_base_path + 'lib/mootools/mootools.js"></script>');
document.write('<script src="' + pik_base_path + 'lib/prefixfree/prefixfree.min.js"></script>');
document.write('<script src="' + pik_base_path + 'lib/print.js"></script>');
document.write('<link media="print" rel="stylesheet" href="' + pik_base_path + 'lib/css/print.css">');

// The presentation script and style files are not required when the presentation is not
// framed (e.g. for printing)
var framed = (window.top !== window.self);
if(framed){
	document.write('<script src="' + pik_base_path + 'lib/presentation.js"></script>');
	document.write('<script src="' + pik_base_path + 'lib/controls.js"></script>');
	document.write('<link rel="stylesheet" href="' + pik_base_path + 'lib/css/presentation.css">');
}

})();