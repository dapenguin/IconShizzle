(function(){
	'use strict';

	// Require our modules
	var path = require('path');
	var DirectoryEncoder = require('directory-encoder');

	// Define variables that will have values assigned later
	var de;

	// Define IconShizzle
	var IconShizzle = function(svgDirectory, scssOutputFile, options){
		de = new DirectoryEncoder( svgDirectory, scssOutputFile, options);
	};

	// Declare our methods for IconShizzle here
	IconShizzle.prototype.process = function(){
		de.encode();
	};

	module.exports = IconShizzle;

})();
