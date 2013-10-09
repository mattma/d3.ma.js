/*
	return element: Most of methods return svg canvas object for easy chaining

	Initalization:
		var container = d3.ma.container('#vis').margin({top: 80, left: 80}).box(1400, 600);
		var canvas = container.canvas().chart("FinalChart", container.info() );
		canvas.draw(data);

		Note: container.info() as 2nd parameter is absolutely the core required. It allows each individual layer to know what is the context of the current canvas, passing an object of dataset like container width, height, canvas info including its id, clippath id, width, height, and other info

	Syntax:
		d3.ma.container(selector)    // is absolutely required, others are optional.
		# container(selector) will take a css selector, which will be the container to append the svg element

	Note:
		by default, when the svg element initialized, it will create a canvas g element and a defs element contain the clip-path info, random generated cid for clip-path id and id for canvas id attribute.

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
			# Optional. It should always handle the resize using onResize() or resize() for each instance
			Take no args, by default, the graph would not resize when window resize, by calling container.resize() will enable the graph resize when window size changes. It is chainable, could be chained at anywhere after you initialized container object.

		container.ratio(_ratio)
			#Optional. setter/getter  update canvas attribute preserveAspectRatio for resize() purpose. aspectRatio variable in this case.

		container.canvas()
			# getter. Return the canvas object for easy chaining

		container.info()
			# getter. Return all the infomation about this container. expose all the data to the world
			include value of   marginTop, marginRight, marginBottom, marginLeft, containerW, containerH, canvasW, canvasH, id, cid
*/
d3.ma.container = function(selector) {

	var selection = d3.select(selector);

	var margin = { top: 30, right: 10, bottom: 20, left: 40 },
		containerW = d3.ma.$$(selector).clientWidth || selection[0][0].clientWidth || document.body.clientWidth || 960,
		containerH = d3.ma.$$(selector).clientHeight || selection[0][0].clientHeight || window.innerHeight || 540,
		canvasW,
		canvasH,
		container = selection.append('svg'),  // Create container, append svg element to the selection
		random = Math.floor(Math.random() * 1000),

		// Setup the clipPath to hide the content out of the canvas
		defs = container.append('defs'),
		cid = 'clip-' + random,
		clipPath = defs.append('clipPath').attr('id', cid),
		rect = clipPath.append('rect'),

		// Create a new group element append to svg
		// Set the canvas layout with a good amount of offset, has canvas class for easy targeting
		id = 'd3ma-' + random,
		g = container.append('g').classed('canvas', true).attr({
			'class': 'canvas',
			'id': id
		}),

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
		var m = container.margin();
		if(!arguments.length) {
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

		_gTransform(m.left, m.top);
		_initClipPath(_width, h, m.left);

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
			'canvasH': canvasH(),
			'id': '#'+id,
			'cid': '#'+cid,
			'parentNode': selector
		};
	};

	// Set the canvas element transform attribute, call it when needed
	function _gTransform (_marginLeft, _marginTop) {
		g.attr('transform', 'translate(' + _marginLeft + ',' + _marginTop + ')');
	}

	// setup the defs>clip>rect element width and height, x and y attrs
	// width and height should equal to the containerW and containerH
	// x equal to the -marginLeft, so it starts where the origin of the canvas before the transform
	// y equal to the 0 value of the origin, remain static, here use -1 because to show the y-axis tick top
	function _initClipPath(_width, _height, _marginLeft) {
		rect.attr({
			width: _width,
			height: _height,
			x: -(_marginLeft),
			y: -1  // Static, -1 to show the y-axis top tick
		});

		g.attr('clip-path', 'url(#'+cid+')' );
	}

	// e.g container.resize().box(1400, 600);
	// container.resize() fn could be called from container object, it is chainable
	// d3.ma.resize() should be used all the time. This resize() is the old implementation
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
