(function(){
	'use strict';

	// Require NodeJS modules
	var path = require('path');
	var fs = require('fs');

	// Require other node modules
	var DirectoryEncoder = require('directory-encoder');
	var svg_to_png = require('svg-to-png');
	var RSVP = require('rsvp');

	// Require modules that are a part of IconShizzle
	var mixin = require('./mixin.js');

	// Define IconShizzle
	var IconShizzle = function(svgDirectory, options){
		// Default options
		var _default = {
	        actualSassFile: 'example/output/result.css',
	        svgCssOptions: {},
	        pngFileOptions: {
	        	outputFolder: 'example/output/',
				compress: false,
				optimizationLevel: 3,
				dimensions: [
					{
						width: "400px",
						height: "300px"
					}
				]
	        },
	        pngSpriteOptions: {}
		};

		var _config;

		var _de;

		// ToDo: Test this
		var _isSvgFile = function(fileName){
			return path.extname(fileName) === '.svg';
		};

		// ToDo: Test this
		var _setFullPathToSvgFile = function(fileName){
			return path.join(svgDirectory, fileName);
		};

		// ToDo: Test this
		var _createSvgFileArray = function(files){
			return files.filter(_isSvgFile)
				.map(_setFullPathToSvgFile);
		};

		// ToDo: Test this
		var _createPngFolderName = function(width, height){
			return 'w' + width + '_h' + height;
		};

		var _makeSvgToPngPromise = function(svgFiles, pngDimensions, callback){
			var pngFileOptions = _config.pngFileOptions;

			var svgToPngOptions = {
				compress: pngFileOptions.compress,
				optimizationLevel: pngFileOptions.optimizationLevel,
				defaultWidth: pngDimensions.width,
				defaultHeight: pngDimensions.height
			};

			// Build our output folder
			var pngFolderName = path.join(pngFileOptions.outputFolder, _createPngFolderName(svgToPngOptions.defaultWidth, svgToPngOptions.defaultHeight));

			return svg_to_png
				.convert(svgFiles, pngFolderName, svgToPngOptions);
		};

		var _convertSvgsToPngs = function(cb){
			var pngDimensions = _config.pngFileOptions.dimensions;
			var svgFiles = fs.readdirSync(svgDirectory);
			var svgToPngPromises = [];

			var i = 0;
			var il = pngDimensions.length;

			svgFiles = _createSvgFileArray(svgFiles);

			for (; i<il; i++){
				svgToPngPromises.push(_makeSvgToPngPromise(svgFiles, pngDimensions[i]));
			}

			RSVP.all(svgToPngPromises)
				.then(function(value){
					cb();
				})
				.catch(function(error){
					console.log(false);
				});
		};

		var _process = function(cb){
			_de.encode();

			_convertSvgsToPngs(cb);
		};

		var _init = function(){
			// Mixin defaults with the options passed through
			if (options)
				_config = mixin(_default, options);

			_de = new DirectoryEncoder( svgDirectory, _config.actualSassFile, _config.svgCssOptions);

			return {
				process: _process
			};
		};

		return _init();
	};

	module.exports = IconShizzle;

})();
