
d3.ma = {};

/*
	return element: All methods return svg canvas object for easy chaining
	E.G: d3.ma.canvas('body').margin({top: 80, left: 80}).box(600, 500)
			.select('.canvas'))  // always need to select g element/.canvas element to append children

	d3.ma.canvas(selection) is absolutely required, others are optional.

	canvas() will take a css selector, which will be the container to contain the svg element

	margin()  is optional, to set/get margin object, must take an object as value, e.g. {top: 80}, normally come before box()

	box() is optional, by default, it will take the container width and height. to set/get/retrieve the svg/container width and height, if  only one value provide, width and height would be the same

	width() and height() is optional, will set/get the canvas width and height
 */

d3.ma.container = function(selection) {

	var container = d3.select(selection);

	var margin = {top: 30, right: 20, bottom: 20, left: 30},
		containerW = container[0][0].clientWidth || document.body.clientWidth || 960,
		containerH = container[0][0].clientHeight || document.body.clientHeight || 540,
		width,
		height,
		canvas = container.append('svg'),  // append svg element to the selection
		// Create a new group element append to svg
		// Set the canvas layout with a good amount of offset, has canvas class for easy targeting
		g = canvas.append('g').classed('canvas', true);

	canvas.width = function(_width, boxCalled) {
		if (!arguments.length) return g.attr("width");
		if(boxCalled) _width = parseInt(_width) - margin.left - margin.right;
		g.attr('width', _width);
		return canvas;
	};

	canvas.height = function(_height, boxCalled) {
		if(!arguments.length) return g.attr("height");
		if(boxCalled) _height = parseInt(_height) - margin.top - margin.bottom;
		g.attr('height', _height);
		return canvas;
	};

	canvas.box = function(_width, _height) {
		if(!arguments.length) {
			var m = canvas.margin();
			return {
				'containerWidth': canvas.width() + m.left + m.right,
				'containerHeight': canvas.height() + m.top + m.bottom
			};
		}

		// When arguments are more than one, set svg and canvas width & height
		var h = (_height) ? _height : _width;

		canvas.width(_width, true);
		canvas.height(h, true);

		canvas.attr({
			'width': _width,
			'height': h
		});

		gTransform();

		return canvas;
	};

	canvas.margin = function(_) {
		if (!arguments.length) return margin;
		margin.top  = typeof _.top  != 'undefined' ? _.top  : margin.top;
		margin.right  = typeof _.right  != 'undefined' ? _.right  : margin.right;
		margin.bottom = typeof _.bottom != 'undefined' ? _.bottom : margin.bottom;
		margin.left   = typeof _.left   != 'undefined' ? _.left   : margin.left;

		// After set the new margin, and maintain svg container width and height, canvas width and height ratio
		canvas.box(containerW, containerH);

		return canvas;
	};

	// Set the canvas transform attr, call it when needed
	function gTransform () {
		g.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
	}

	// Set the svg container width and height
	// Set the canvas width and height, and its transform values
	canvas.box(containerW, containerH);

	return canvas;
};
