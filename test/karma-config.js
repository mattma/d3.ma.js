'use strict';

var allTestFiles = [];
var TEST_REGEXP = /Test\.js$/;

Object.keys(window.__karma__.files).forEach(function(file) {
	if (TEST_REGEXP.test(file)) {
		allTestFiles.push(file);
	}
});

require.config({

	// Base URL relative to the test runner
	// Paths are relative to this
	baseUrl: '/base',

	paths: {
		'd3': 'libs/d3.v3',
		'd3ma': 'tmp/d3.ma',
		'chai': 'test/libs/chai',
		'mocha': 'test/libs/mocha/mocha',
		'common': 'test/libs/common',
		'sinon-chai': 'test/libs/sinon-chai',
		'sinon': 'test/libs/sinon'
	},

	shim: {
		d3ma: {
			deps : ['d3']
		},
		sinon: {
			exports: 'sinon'
		},
		'sinon-chai': {
			exports: 'sinon-chai'
		}
	},

	hbs : {
		disableI18n: true,
		disableHelpers: true
	},

	//dynamically load all test files
	deps: allTestFiles,

	// we have to kick of mocha, as it is asynchronous
	callback: window.__karma__.start
});
