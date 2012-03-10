var fs = require('fs');
var cp = require('child_process');



// Create docs
// -----------

// Folders and files to document
var directories = {
	lib : [
		'lib/controls.js',
		'lib/frame.js',
		'lib/presenter.js',
		'lib/presentation.js',
		'lib/worker.js',
		'lib/pik.js',
		'lib/print.js'
	],
	plugins : [
		'plugins/backgroundHarmonizer.js',
		'plugins/inputProtector.js',
		'plugins/printHandout.js'
	],
	remote : [
		'remote/remote.js'
	]
};

// Create docs for a directory
var createDocs = function(dir, callback){
	var args = ' ../' + directories[dir].join(' ../');
	cp.exec('docco ' + args, { 'cwd': 'docs' }, function(){
		cp.exec('mv docs ' + dir, { 'cwd': 'docs' }, callback);
	});
};

// Remove old docs, create new docs
cp.exec('rm * -r', { 'cwd': 'docs' }, function(){
	createDocs('lib', function(){
		createDocs('plugins', function(){
			createDocs('remote');
		});
	});
});