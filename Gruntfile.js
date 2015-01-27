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
			TMP: 'tmp',
			HOSTNAME: 'file:///Users/qma17',
			PATH: '<%= CONFIGS.HOSTNAME %>/Desktop/repos/d3.ma.js/examples/tree.html'
		},

		pkg: grunt.file.readJSON('package.json'),

		BANNER: '/*! \n 	<%= pkg.name %> - v<%= pkg.version %>\n 	Author: <%= pkg.author.name %> (<%= pkg.author.email %>) \n 	Date: <%= grunt.template.today("yyyy-mm-dd") %>\n*/\n',

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
			},
			tmp: {
				src: [
					'<%= CONFIGS.TMP %>'
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
					'src/lib/d3chart.js',
					'src/common/core.js',
					'src/common/utils.js',
					'src/common/container.js',
					'src/components/clippath.js',

					'src/core/scale.js',
					'src/core/base.js',

					'src/components/axis.js',

					'src/basic/bars.js',
					'src/basic/line.js',
					'src/basic/area.js',
					'src/basic/circle.js',
					'src/basic/simpleLine.js',

					'src/outro.js'
				],
				dest: '<%= CONFIGS.TMP %>/d3.ma.js'
				// nonull: true  // Warn if a given file is missing or invalid
			}
		},

		// https://github.com/gruntjs/grunt-contrib-copy
		copy: {
			build: {
				files: [{
					src: ['<%= CONFIGS.TMP %>/d3.ma.js'],
					dest: '<%= CONFIGS.BUILD %>/d3.ma.js'
				}]
			},
			release: {
				files: [
					{
						expand: true,
						dot: false,   // Enable the dot file when copy
						cwd: '<%= CONFIGS.BUILD %>',
						dest: '',
						src: [
							'*.js'
						]
					}
				]
			}
		},

		// https://github.com/gruntjs/grunt-contrib-uglify
		// Currently is being used by requirejs task, ONLY manual usage
		uglify: {
			options: {
				banner: '<%= BANNER %>',
				report: 'gzip',
				preserveComments: 'false'
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
					'examples/*.html',
					'index.html',
					'src/{,**/}*.js'
				],
				tasks: ['livereload']
			},
			test: {
				files: [
					'src/{,**/}*.js'
				],
				tasks: ['livereload', 'build']
			}
		},

		// https://github.com/karma-runner/grunt-karma
		// @usage  grunt test:karma  or   grunt karma
		// karma.conf.js should work independently, can be called by `karma start`
		// Setting defined here should override the karma.conf.js setting
		// watch task is for running a development, update on file changes
		// single task is running for a single time, output its coverage report
		karma: {
			options: {
				configFile: 'karma.conf.js',
				browsers: ['Chrome'],
				reporters: 'dots'
			},
			watch: {
				options: {
					singleRun: false,
					autoWatch: true
				}
			},
			single: {
				options: {
					singleRun: true,
					autoWatch: false
				}
			}
		},

		concurrent: {
			test: {
				options: {
					logConcurrentOutput: true
				},
				tasks: ['watch:test', 'karma:watch']
			}
		}
	});

	grunt.renameTask('regarde', 'watch');

	// Running Development Environment
	grunt.registerTask('server', function () {

		grunt.task.run([
			'livereload-start',
			'open:dev',
			'watch:livereload'
		]);
	});

	grunt.registerTask('lint', ['jshint']);

	// Running Production Environment
	grunt.registerTask('build', function () {

		grunt.task.run([
			'test:ci',
			'copy:build',
			'uglify',
			'clean:tmp'
		]);
	});

	grunt.registerTask('test', [
		'concat',
		'livereload-start',
		'concurrent:test'
	]);

	grunt.registerTask('test:ci', [
		'concat',
		'karma:single'
	]);

	grunt.registerTask('release', [
		'build',
		'copy:release',
		'clean:build'
	]);

	// grunt.registerMultiTask('log', 'Log stuff.', function() {
	// 	grunt.log.writeln(this.target + ': ' + this.data);
	// });

	grunt.registerTask('default', [ 'build' ]);
};
