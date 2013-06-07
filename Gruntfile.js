'use strict';

module.exports = function(grunt) {

    grunt.initConfig({
        uglify: {
            build: {
                files: {
                    'jquery.timeAutocomplete.min.js': [
                        'src/jquery.timeAutocomplete.js',
                        'src/formatters/ampm.js',
                        'src/formatters/24hr.js',
                        'src/formatters/french.js'
                    ]
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.registerTask('default', ['uglify']);

};