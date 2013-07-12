/*
	return element: Most of methods return svg canvas object for easy chaining
	E.G: d3.ma.container('body').margin({top: 80, left: 80}).box(600, 500)

		var container = d3.ma.container('#vis'),
			canvas = container.canvas().chart("LabeledCirclesChart");

	d3.ma.container(selector) is absolutely required, others are optional.

	container() will take a css selector, which will be the container to contain the svg element

	margin()  is optional, to set/get margin object, must take an object as value, e.g. {top: 80}, normally come before box()

	box() is optional, by default, it will take the container width and height. to set/get/retrieve the svg/container width and height, if  only one value provide, width and height would be the same

	canvasW() and canvasH() is optional, will set/get the canvas width and height. Normally, do not need to set explicitly, Use box() will auto set the canvas width and height as properly
 */

d3.ma.container = function(selector) {

	var selection = d3.select(selector);

	var margin = { top: 30, right: 10, bottom: 20, left: 40 },
		containerW = selection[0][0].clientWidth || document.body.clientWidth || 960,
		containerH = selection[0][0].clientHeight || document.body.clientHeight || 540,
		canvasW,
		canvasH,
		container = selection.append('svg'),  // Create container, append svg element to the selection
		// Create a new group element append to svg
		// Set the canvas layout with a good amount of offset, has canvas class for easy targeting
		g = container.append('g').classed('canvas', true),

		// http://www.w3.org/TR/SVGTiny12/coords.html#PreserveAspectRatioAttribute
		aspectRatio = 'xMidYMid',
		scaleRatio = containerW / containerH;

	// var aspect = 1400 / 600;
	// // TODO: working on the window resize and resize the graph
	// d3.ma.onResize( function() {
	// 	var targetWidth = d3.ma.windowSize().width;
	// 	container.attr("width", targetWidth);
	// 	container.attr("height", targetWidth / aspect);
	// });

	var canvasW = container.canvasW = function(_width, boxCalled) {
		if (!arguments.length) { return g.attr('width'); }
		if(boxCalled) { _width = parseInt(_width) - margin.left - margin.right; }
		g.attr('width', _width);
		return container;
	};

	var canvasH = container.canvasH = function(_height, boxCalled) {
		if(!arguments.length) { return g.attr('height'); }
		if(boxCalled) { _height = parseInt(_height) - margin.top - margin.bottom; }
		g.attr('height', _height);
		return container;
	};

	container.box = function(_width, _height) {
		if(!arguments.length) {
			var m = container.margin();
			return {
				'containerWidth': +canvasW() + (+m.left) + (+m.right),
				'containerHeight': +canvasH() + (+m.top) + (+m.bottom)
			};
		}

		// When arguments are more than one, set svg and container width & height
		var h = (_height) ? _height : _width;

		canvasW(_width, true);
		canvasH(h, true);

		container.attr({
			'width': _width,
			'height': h,
			'viewBox': '0 0 '+ _width + ' ' + h,
			'preserveAspectRatio': aspectRatio
		});

		scaleRatio = _width / h;

		containerW = _width;
		containerH = h;

		gTransform();

		return container;
	};

	container.margin = function(_) {
		if (!arguments.length) { return margin; }
		margin.top  = typeof _.top  !== 'undefined' ? _.top  : margin.top;
		margin.right  = typeof _.right  !== 'undefined' ? _.right  : margin.right;
		margin.bottom = typeof _.bottom !== 'undefined' ? _.bottom : margin.bottom;
		margin.left   = typeof _.left   !== 'undefined' ? _.left   : margin.left;

		// After set the new margin, and maintain svg container width and height, container width and height ratio
		container.box(containerW, containerH);

		return container;
	};

	container.ratio = function(_ratio){
		if(!arguments.length) { return aspectRatio; }
		aspectRatio = _ratio;
		container.attr('preserveAspectRatio', _ratio);
		return container;
	};

	// Return the canvas object for easy chaining
	container.canvas = function(){
		return container.select('g');
	};

	// Set the canvas transform attr, call it when needed
	function gTransform () {
		g.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
	}

	// The Graph will auto scale itself when resize
	d3.ma.onResize( function() {

		var windowWidth = d3.ma.windowSize().width

		if ( windowWidth < containerW ) {
			container.attr({
				'width': windowWidth,
				'height':  Math.round( windowWidth / scaleRatio )
			});
		} else {
			// if it is the same value, do not need to set any more
			// reset the graph value to its original width and height
			if( containerW !== +containerW) {
				container.attr({
					'width': containerW,
					'height':  Math.round( containerW / scaleRatio )
				});
			}
		}
	});

	// Set the svg container width and height
	// Set the container width and height, and its transform values
	container.box(containerW, containerH);
	return container;
};
