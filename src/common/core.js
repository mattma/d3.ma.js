var d3ma = {version: '0.2.1'}; // semver;

// useful to figure out how many svg elements on the current page
// track individual .canvas element
// then retrieve cancas object, could call *draw* method to update its visualization
d3ma.canvas = [];

// getter & setter function
// set the canvas object into the d3ma.canvas array, used to redraw the chart
// optional param, if omit, it will simply retrieve the current d3ma.canvas status
d3ma.setCanvas = function(canvas) {
	if(!canvas && typeof canvas !== 'object') {
		return d3ma.canvas;
	}
	d3ma.canvas.push(canvas);
};
