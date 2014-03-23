var d3ma = d3.ma = {version: '0.2.0'}; // semver;

d3ma.assert = function(test, message) {
	if(test) { return; }
	throw new Error('[d3.ma] ' + message);
};



