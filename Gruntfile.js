'use strict';

module.exports = function( grunt ) {


	// https://github.com/tkellen/node-matchdep
	// load all grunt tasks // Filter devDependencies (with config string indicating file to be required)
	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

	// Project configuration
	// ---------------------

	grunt.initConfig({

		CONFIGS: {
			BUILD: 'build',
			HOSTNAME: 'file:///Users/mma',
			PATH: '<%= CONFIGS.HOSTNAME %>/Desktop/d3.ma/index.html'
		},

		pkg: grunt.file.readJSON('package.json'),

		BANNER: '/*! <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %> \n Author: <%= pkg.author.name %> (<%= pkg.author.email %>)\n\n*/',

		// https://github.com/gruntjs/grunt-contrib-jshint
		// Validate files with JSHint. it is a multi task
		// https://github.com/cowboy/grunt/blob/master/docs/task_lint.md#specifying-jshint-options-and-globals
		jshint: {
			options: {
				jshintrc: '.jshintrc'
				// force: true,  // Report JSHint errors but not fail the task.
				//
				//A map of global variables, with keys as names and a boolean value to determine if they are assignable.
				// globals:   {
				//   jQuery: true
				// }
			},
			all: [
				'Gruntfile.js',
				'src/**/*.js'
			]
		},

		// https://github.com/gruntjs/grunt-contrib-clean
		// Clean files and folders. always be cautious of the paths you clean.
		clean: {
			options: {
				// force: true
			},
			build: {
				src: [
					'<%= CONFIGS.BUILD %>'
				]
			}
		},

		// Uglify task does concat
		// https://github.com/gruntjs/grunt-contrib-concat
		concat: {
			options: {
				separator: '', //Concatenated files will be joined on this string.
				banner:  '<%= BANNER %>'
				//footer: STRING  //Appended to the end of the concatenated output.
				//stripBanners: true  //Strip JavaScript banner comments from source files. /* ... */ block comments are stripped, but NOT /*! ... */ comments.
			},
			build: {
				src: [
					'src/intro.js',
					'src/common/container.js',
					'src/outro.js'
				],
				dest: '<%= CONFIGS.BUILD %>/d3.ma.js'
				// nonull: true  // Warn if a given file is missing or invalid
			}
		},

		// https://github.com/gruntjs/grunt-contrib-uglify
		// Currently is being used by requirejs task, ONLY manual usage
		uglify: {
			options: {
				banner: '<%= BANNER %>'
				// sourceMap: 'path/to/source-map.js'
			},
			minify: {
				files: [{
					src: ['<%= CONFIGS.BUILD %>/d3.ma.js'],
					dest: '<%= CONFIGS.BUILD %>/d3.ma.min.js'
				}]
			}
		},

		// https://github.com/onehealth/grunt-open
		open: {
			dev: {
				path: '<%= CONFIGS.PATH %>'
			}
		},

		watch: {
			livereload: {
				files: [
					'index.html',
					'src/{,**/}*.js'
				],
				tasks: ['livereload']
			}
		},
	});

	grunt.renameTask('regarde', 'watch');

	// Running Development Environment
	grunt.registerTask('server', function () {

		grunt.task.run([
			'livereload-start',
			'open:dev',
			'watch'
		]);
	});

	grunt.registerTask('lint', ['jshint']);

	// Running Production Environment
	grunt.registerTask('build', function () {

		grunt.task.run([
			'concat'	,
			'uglify'
		]);
	});

	// grunt.registerMultiTask('log', 'Log stuff.', function() {
	// 	grunt.log.writeln(this.target + ': ' + this.data);
	// });

	grunt.registerTask('default', [ 'build' ]);
};
