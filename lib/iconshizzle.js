// ToDo:
// - Create different Handlebars templates for different implementations.
// - Add options for name of each sprite.
// - Look into whether we could create a master SASS mixin that takes dimension
//   parameters and determines from that which file and position you need.

(function(){
	'use strict';

	// Require NodeJS modules
	var path = require('path');
	var fs = require('fs');

	// Require other node modules
	var DirectoryEncoder = require('directory-encoder');
	var svg_to_png = require('svg-to-png');
	var RSVP = require('rsvp');
	var spritesmith = require('spritesmith');
	var Handlebars = require('handlebars');

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
			pngSpriteOptions: {
				template: 'lib/pngIconMixin.hbs',
				spriteCssFile: 'example/output/pngSprite.css'
			}
		};

		var _config;

		var _de;

		/**
		 * Tests a filename to see if it is an SVG file.
		 * @param  {String}  fileName File name to test.
		 * @return {Boolean}          Returns true if it is an SVG file.
		 */
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

		var _makeSvgToPngPromise = function(svgFiles, pngDimensions){
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
				.convert(svgFiles, pngFolderName, svgToPngOptions)
				.then(function(pngFolder){
					var newObj = {
						width: pngDimensions.width,
						height: pngDimensions.height,
						folder: pngFolder
					};

					return new RSVP.Promise(function(resolve, reject){
						resolve(newObj);
					});
				});
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
				.then(_convertPngsToSprites)
				.then(_createCssFromPngCoordinates)
				.then(function(value){
					cb();
				})
				.catch(function(error){
					console.log(error);
				});
		};

		var _createPngSpriteIconsArray = function(spritesmithCoordinates){
			var pngSpriteIconsArray = [];
			var icon;

			for (icon in spritesmithCoordinates){
				pngSpriteIconsArray.push(
					{
						iconName: path.basename(icon, '.png'),
						x: spritesmithCoordinates[icon].x,
						y: spritesmithCoordinates[icon].y
					}
				);
			}

			return pngSpriteIconsArray;
		};

		var _createPngSprite = function(files, spriteFileName, pngFolder){
			return new RSVP.Promise(function(resolve, reject){
				spritesmith({src: files}, function(err, result){
					if (!err) {
						fs.writeFileSync(path.join(_config.pngFileOptions.outputFolder, spriteFileName), result.image, 'binary');
						pngFolder.icons = _createPngSpriteIconsArray(result.coordinates);
						resolve(pngFolder);
					}
				});
			});
		};

		var _convertPngsToSprites = function(pngFolders){
			var i = 0;
			var il = pngFolders.length;
			var pngFiles;
			var pngFolder;
			var spritePromises = [];

			for (; i<il; i++){
				pngFolder = pngFolders[i].folder;
				pngFiles = fs.readdirSync(pngFolder);
				pngFiles = pngFiles.map(function(fileName){
					return path.join(pngFolder,fileName);
				});

				spritePromises.push(_createPngSprite(pngFiles, 'sprite' + i + '.png', pngFolders[i]));
			}

			return RSVP.all(spritePromises);
		};

		var _createCssFromPngCoordinates = function(coordinates){
			var pngSpriteOptions = _config.pngSpriteOptions;

			// Load handlebars template file into a var
			var templateSource = fs.readFileSync(pngSpriteOptions.template,{encoding: 'utf8'});

			// Compile the template using coordinates data
			var template = Handlebars.compile(templateSource);
			var cssFileContent = template({dimensions: coordinates});

			// Save compiled template into a file
			fs.writeFileSync(pngSpriteOptions.spriteCssFile, cssFileContent);

			return new RSVP.Promise(function(resolve, reject){
				resolve(coordinates);
			});
		};

		var _process = function(cb){
			_de = new DirectoryEncoder(svgDirectory, _config.actualSassFile, _config.svgCssOptions);

			_de.encode();

			_convertSvgsToPngs(cb);
		};

		/**
		 * Initialises the object.
		 * @return {Object} Object containing public methods.
		 */
		var _init = function(){
			// Mixin defaults with the options passed through
			if (options)
				_config = mixin(_default, options);

			return {
				process: _process
			};
		};

		return _init();
	};

	module.exports = IconShizzle;

})();
