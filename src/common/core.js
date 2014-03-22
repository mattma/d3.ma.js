var d3 = window.d3;

var previousD3ma = window.d3.ma;

var d3ma = d3.ma = {version: '0.2.0'}; // semver;

d3ma.noConflict = function() {
	window.d3ma= previousD3ma;
	return d3ma;
};

d3ma.assert = function(test, message) {
	if(test) { return; }
	throw new Error('[d3.ma] ' + message);
};

d3ma.assert(d3, 'd3.js is required');

d3ma.assert( typeof d3.version === 'string' && d3.version.match(/^3/), 'd3.js version 3 is required' );



