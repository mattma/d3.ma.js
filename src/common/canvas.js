d3.ma.canvas = function(selection) {
	console.log("hello");
	var container = d3.ma.container(selection);

	var width,
		height,
		// Create a new group element append to svg
		// Set the canvas layout with a good amount of offset, has canvas class for easy targeting
		canvas = container.append('g').classed('canvas', true);

	canvas.width = function(_width) {
		if (!arguments.length) return width;
		canvas.attr('width', _width);
		return canvas;
	};

	canvas.height = function(_height) {
		if(!arguments.length) return height;
		canvas.attr('height', _height);
		return canvas;
	};

	return canvas;
};
