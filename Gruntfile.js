/*
 * grunt-iconshizzle
 * https://github.com/dapenguin/iconShizzle
 *
 * Copyright (c) 2015 Anthony Jeffery
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    clean: {
      tests: ['tmp']
    },
    // Unit tests.
    nodeunit: {
      tests: ['test/*_test.js']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-contrib-clean');

  grunt.registerTask('test', ['clean','nodeunit']);

  grunt.registerTask('default', ['test']);

};
