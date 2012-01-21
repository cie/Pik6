// This file is **the only file** you need to include in your presentation. It loads
// all the necessary resources automatically.

/*jshint browser:true */

// The loader assumes that the presentation resides in presentations/somefolder. Set a
// global variable `pik_base_url` to use a different base path.
if(typeof pik_base_path === 'undefined'){
	var pik_base_path = '../../lib/';
}

// `document.write()` is poor man's script loader
document.write('<script src="' + pik_base_path + 'mootools.js"></script>');
document.write('<script src="' + pik_base_path + 'presentation.js"></script>');
document.write('<script src="' + pik_base_path + 'controls.js"></script>');
document.write('<link href="' + pik_base_path + 'presentation.css" rel="stylesheet">');