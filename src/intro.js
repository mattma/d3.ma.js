(function (root, factory) {
	if (typeof exports === 'object') {
		module.exports = factory( require('d3') );
	} else if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define(['d3'], factory);
	} else {
		factory( window.d3 );
	}
} (typeof window !== "undefined" ? window : this, function (d3) {

'use strict';
