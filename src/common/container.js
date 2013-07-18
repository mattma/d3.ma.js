/*
	return element: Most of methods return svg canvas object for easy chaining

	Initalization:
		d3.ma.container('body').margin({top: 80, left: 80}).box(600, 500);
		// or
		var container = d3.ma.container('#vis'),
			canvas = container.canvas().chart("LabeledCirclesChart");

	Syntax:
		d3.ma.container(selector)    // is absolutely required, others are optional.
		# container(selector) will take a css selector, which will be the container to append the svg element

	Arguments:
		private atrribute:
			x & y:  scale representation for the x axis and y axis. take x or y as a key, value should be a string representation of scale value, default value is linear, everything will override the default

			Note: x, y could only be set by the initialization fn, option objects.

		public attributes:
			width, height,  ( # axis container width and height values. from scale.js )
			xScale, yScale (# scale fn on the x & y axis. from scale.js)
			guide: Boolean. Optional,  default to false. Draw the grid guides along x, y axis when guide is true
			xAxis, yAxis   ( # could use to override its default value, like defined ticks(), orient(), etc. )
			xAxisG, yAxisG ( # could use to defined custom element attributes )

		Note:  currently, xGuide, yGuide is remaining as private object, if needed, it could expose out to the api

	APIs:
		container(selector)
			# in general, selector is a single dom element, id in most of the case.

		container.margin(_margin)
			# Optional, setter/getter  margin object, must take an object as value, e.g. {top: 80}, normally come before box()

		container.box()
			# Optional, by default, it will take the container width and height.
			setter/getter retrieve the svg/container width and height, if only one value provide, width and height would be the same

		container.canvasW()
			# Optional, setter/getter  canvas width. Normally, do not need to set explicitly, Use container.box() will auto set the canvas width and height as properly

		container.canvasH()
			# Optional, setter/getter  canvas height. Normally, do not need to set explicitly, Use container.box() will auto set the canvas width and height as properly

		container.resize()
			# Optional. Take no args, by default, the graph would not resize when window resize, by calling container.resize() will enable the graph resize when window size changes. It is chainable, could be chained at anywhere after you initialized container object.

		container.ratio(_ratio)
			#Optional. setter/getter  update canvas attribute preserveAspectRatio for resize() purpose. aspectRatio variable in this case.

		container.canvas()
			# getter. Return the canvas object for easy chaining

		container.info()
			# getter. Return all the infomation about this container. expose all the data to the world
*/
d3.ma.container = function(selector) {

	var selection = d3.select(selector);

	var margin = { top: 30, right: 10, bottom: 20, left: 40 },
		containerW = d3.ma.$$(selector).clientWidth || selection[0][0].clientWidth || document.body.clientWidth || 960,
		containerH = d3.ma.$$(selector).clientHeight || selection[0][0].clientHeight || window.innerHeight || 540,
		canvasW,
		canvasH,
		container = selection.append('svg'),  // Create container, append svg element to the selection
		// Create a new group element append to svg
		// Set the canvas layout with a good amount of offset, has canvas class for easy targeting
		g = container.append('g').classed('canvas', true),

		// http://www.w3.org/TR/SVGTiny12/coords.html#PreserveAspectRatioAttribute
		aspectRatio = 'xMidYMid',
		scaleRatio = containerW / containerH;

	var canvasW = container.canvasW = function(_width, boxCalled) {
		if (!arguments.length) { return +(g.attr('width')); }
		if(boxCalled) { _width = parseInt(_width) - margin.left - margin.right; }
		g.attr('width', _width);
		return container;
	};

	var canvasH = container.canvasH = function(_height, boxCalled) {
		if(!arguments.length) { return +(g.attr('height')); }
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

	container.margin = function(_margin) {
		if (!arguments.length) { return margin; }
		margin.top  = typeof _margin.top  !== 'undefined' ? _margin.top  : margin.top;
		margin.right  = typeof _margin.right  !== 'undefined' ? _margin.right  : margin.right;
		margin.bottom = typeof _margin.bottom !== 'undefined' ? _margin.bottom : margin.bottom;
		margin.left   = typeof _margin.left   !== 'undefined' ? _margin.left   : margin.left;

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

	// Return all the infomation about this container
	// expose all the data to the world
	container.info = function(){
		var margin = container.margin(),
			box = container.box();
		return {
			'marginTop': margin.top,
			'marginRight': margin.right,
			'marginBottom': margin.bottom,
			'marginLeft': margin.left,
			'containerW': box.containerWidth,
			'containerH': box.containerHeight,
			'canvasW': canvasW(),
			'canvasH': canvasH()
		};
	};

	// Set the canvas transform attr, call it when needed
	function gTransform () {
		g.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
	}

	// e.g container.resize().box(1400, 600);
	// resize() fn could be called from anywhere, it is chainable
	container.resize = function() {
		//The Graph will auto scale itself when resize
		d3.ma.onResize( function() {

			var windowWidth = d3.ma.windowSize().width;

			if ( windowWidth < containerW ) {
				container.attr({
					'width': windowWidth,
					'height':  Math.round( windowWidth / scaleRatio )
				});
			} else {
				// reset the graph value to its original width and height
				// if it is the same value, do not need to set any more
				var _w = +(container.attr('width'));
				if( containerW !== _w) {
					container.attr({
						'width': containerW,
						'height':  containerH
					});
				}
			}
		});
		return container;
	};

	// Set the svg container width and height
	// Set the container width and height, and its transform values
	container.box(containerW, containerH);
	return container;
};

/*
http://www.w3.org/TR/SVGTiny12/coords.html#ViewBoxAttribute

 viewBox = "min-x min-y width height" | "none"

 separated by white space and/or a comma, which specify a rectangle in viewport space which must be mapped to the bounds of the viewport established by the given element, taking into account the 'preserveAspectRatio' attribute. If specified, an additional transformation is applied to all descendants of the given element to achieve the specified effect.

 preserveAspectRatio =  ["defer"] <align> [<meet>]

 typically when using the 'viewBox' attribute, it is desirable that the graphics stretch to fit non-uniformly to take up the entire viewport. In other cases, it is desirable that uniform scaling be used for the purposes of preserving the aspect ratio of the graphics.
 */
