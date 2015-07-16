(function(){
	'use strict';

	// Require NodeJS modules
	var path = require('path');
	var fs = require('fs');

	// Require other node modules
	var DirectoryEncoder = require('directory-encoder');
	var svg_to_png = require('svg-to-png');

	// Require modules that are a part of IconShizzle
	var mixin = require('./mixin.js');

	// Define IconShizzle
	var IconShizzle = function(svgDirectory, scssOutputFile, options){
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

		var de;

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

		var _convertSvgsToPngs = function(){
			console.time('_convertSvgsToPngs');

			var pngFileOptions = _config.pngFileOptions;
			var pngDimensions = pngFileOptions.dimensions;
			var svgToPngOptions = {
				compress: pngFileOptions.compress,
				optimizationLevel: pngFileOptions.optimizationLevel
			};
			var svgFiles = fs.readdirSync(svgDirectory);

			var i;
			var il;
			var pngFolderName;

			svgFiles = _createSvgFileArray(svgFiles);
			console.log(svgFiles);

			for (i=0, il=pngDimensions.length; i<il; i++){
				//Build our options for svg_to_png
				svgToPngOptions.defaultWidth = pngDimensions[i].width;
				svgToPngOptions.defaultHeight = pngDimensions[i].height;
				
				// Build our output folder
				pngFolderName = pngFileOptions.outputFolder + _createPngFolderName(svgToPngOptions.defaultWidth, svgToPngOptions.defaultHeight);

				console.log(svgToPngOptions);
				// Convert SVGs using the current dimensions
				svg_to_png.convert(svgFiles, pngFolderName, svgToPngOptions)
				.then(function(){
					console.log('PNGs created for w:' + svgToPngOptions.defaultWidth + ' h:' + svgToPngOptions.defaultHeight);
				});
			}

			console.timeEnd('_convertSvgsToPngs');
		};

		var _process = function(){
			de.encode();

			_convertSvgsToPngs();
		};

		var _init = function(){
			// Mixin defaults with the options passed through
			if (options)
				_config = mixin(_default, options);

			de = new DirectoryEncoder( svgDirectory, scssOutputFile, _config.svgCssOptions);

			return {
				process: _process
			};
		};

		return _init();
	};

	module.exports = IconShizzle;

})();
