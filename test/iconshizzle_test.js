'use strict';

// Require our modules
var fs = require('fs');
var path = require('path');
var IconShizzle = require('../lib/iconshizzle.js');

// Set up our parameters for IconShizzle
var svgLocation = path.join(__dirname,'svg');
// var actualSassFile = path.join(__dirname,'../tmp/testSassSvg.scss');
var options = {
	actualSassFile: 'tmp/output/result.css',
	svgCssOptions: {
		prefix: ".icon-", // used to prefix the name of the file for the CSS classname, .icon- is the default
		templatePrepend: "/* Start of SVG icons */\n", // this string is prepended to the destinationCSSFile, defaults to ""
		template: path.join(__dirname,'templates/default-css.hbs'), //template in handlebars, FANCY!
		templateAppend: "/* End of SVG icons */" // this string is appended to the destinationCSSFile, defaults to ""
	},
	pngFileOptions: {
		outputFolder: 'tmp/output/',
		compress: false,
		optimizationLevel: 3,
		dimensions: [
			{
				width: "400px",
				height: "300px"
			},
			{
				width: "40px",
				height: "40px"
			}
		]
	},
	pngSpriteOptions: {
    	template: 'lib/pngIconMixin.hbs',
    	spriteCssFile: 'tmp/output/pngSprite.css'
	}
};

// Variables for storing the actual and expected output of IconShizzle
var actualOutput;
var expectedOutput;
var expectedSassFile = path.join(__dirname,'expected/testSassSvg.scss');

// Create an instance of IconShizzle for our tests
var iShizz = new IconShizzle(svgLocation, options);

exports.iconshizzle = {
	'setUp' : function(done){
		iShizz.process(function(){
			done();
		});
	},
	'tearDown' : function(done){
		done();
	},
	'Correct SASS output' : function(test){
		test.expect(1);
		actualOutput = fs.readFileSync(options.actualSassFile,{encoding: 'utf-8'});
		expectedOutput = fs.readFileSync(expectedSassFile,{encoding: 'utf-8'});
		test.equal(actualOutput,expectedOutput,'Should give us the expected output in the generated SASS file');
		test.done();
	},
	'PNG created' : function(test){
		test.expect(1);
		test.ok(fs.existsSync(path.join(options.pngFileOptions.outputFolder,'w400px_h300px','MapPin.png')),'Should give us one of the PNG files created');
		test.done();
	},
};
