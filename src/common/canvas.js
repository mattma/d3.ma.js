
d3.ma = {};

/*
	return element:
	All methods return svg canvas object for easy chaining, but the canvas() will return the g element represent the canvas g element with class canvas. So after called canvas('body') will auto set the body>svg>g, g as the current context to take more actions

	E.G: d3.ma.canvas('body').margin({top: 80, left: 80}).box(600, 500)

	d3.ma.canvas(selection) is absolutely required, others are optional.

	canvas() will take a css selector, which will be the container to contain the svg element

	margin()  is optional, to set/get margin object, must take an object as value, e.g. {top: 80}, normally come before box()

	box() is optional, by default, it will take the container width and height. to set/get/retrieve the svg/container width and height, if  only one value provide, width and height would be the same

	width() and height() is optional, will set/get the canvas width and height
 */

d3.ma.canvas = function(selection) {

	var container = d3.select(selection);

	var margin = {top: 30, right: 20, bottom: 20, left: 30},
		containerW = container[0][0].clientWidth || document.body.clientWidth,
		containerH = container[0][0].clientHeight || document.body.clientHeight,
		width,
		height,
		canvas = container.append('svg'),  // append svg element to the selection
		// Create a new group element append to svg
		// Set the canvas layout with a good amount of offset, has canvas class for easy targeting
		g = canvas.append('g').classed('canvas', true);

	canvas.width = function(_width) {
		if (!arguments.length) return g.attr("width");
		g.attr('width', _width);
		return canvas;
	};

	canvas.height = function(_height) {
		if(!arguments.length) return g.attr("height");
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

		setCanvasWidth(_width);
		setCanvasHeight(h);

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

		// Reinit the initContainer function
		// After set the new margin, and maintain svg container width and height, canvas width and height ratio
		initContainer();

		return canvas;
	};

	// Set the canvas width
	function setCanvasWidth (_width) {
		width = parseInt(_width) - margin.left - margin.right;
		g.attr('width', width);
	}

	// Set the canvas height
	function setCanvasHeight (_height) {
		height = parseInt(_height) - margin.top - margin.bottom;
		g.attr('height', height);
	}

	// Set the canvas transform attr, call it when needed
	function gTransform () {
		g.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
	}

	// Set the svg container width and height
	// Set the canvas width and height, and its transform values
	function initContainer(){
		if( containerW && containerH ) {
			canvas.box(containerW, containerH);
		} else {
			console.error('Error from d3.ma.canvas() \nPlease, provide the width and the height for svg container. \nUse canvas.box(width, height) to set explicitly or set element width and height in CSS');
		}
	}

	initContainer();

	return g;
};


