/*! 
 	d3.ma.js - v0.1.0
 	Author: Matt Ma (matt@mattmadesign.com) 
 	Date: 2013-10-24
*/
(function(){

'use strict';

var d3 = window.d3;

var previousD3ma = window.d3.ma;

var d3ma = d3.ma = {};

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

// Need to sync this version with package.json version
d3ma.version = '0.1.0';



// Pull Straight out of nvd3 library
// get the current windowSize() out of the DOM
// return and object has width value and height value
d3.ma.windowSize = function() {
	// Sane defaults
	var size = {width: 640, height: 480};

	// Earlier IE uses Doc.body
	if (document.body && document.body.offsetWidth) {
		size.width = document.body.offsetWidth;
		size.height = document.body.offsetHeight;
	}

	// IE can use depending on mode it is in
	if (document.compatMode=='CSS1Compat' &&
		document.documentElement &&
		document.documentElement.offsetWidth ) {
		size.width = document.documentElement.offsetWidth;
		size.height = document.documentElement.offsetHeight;
	}

	// Most recent browsers use
	if (window.innerWidth && window.innerHeight) {
		size.width = window.innerWidth;
		size.height = window.innerHeight;
	}
	return (size);
};


// Default color chooser uses the index of an object as before.
d3.ma.Color = function() {
	var colors = d3.scale.category20().range();
	return function(d, i) { return d.color || colors[i % colors.length] };
};


/* For situations where we want to approximate the width in pixels for an SVG:text element.
Most common instance is when the element is in a display:none; container.
Forumla is : text.length * font-size * constant_factor
*/
d3.ma.calcTextWidth = function (svgTextElem) {
	if (svgTextElem instanceof d3.selection) {
		var fontSize = parseInt(svgTextElem.style('font-size').replace('px',''));
		var textLength = svgTextElem.text().length;

		return textLength * fontSize * 0.5;
	}
	return 0;
};


// Work the same way how underscore.js signiture each method
d3.ma.each = function(obj, iterator, context) {

	if (obj == null) return;

	var breaker = {},
		nativeForEach = Array.prototype.forEach;

	if (nativeForEach && obj.forEach === nativeForEach) {
		obj.forEach(iterator, context);
	} else if (obj.length === +obj.length) {
		for (var i = 0, l = obj.length; i < l; i++) {
			if (iterator.call(context, obj[i], i, obj) === breaker) return;
		}
	} else {
		for (var key in obj) {
			if (Object.prototype.hasOwnProperty.call(obj, key)) {
				if (iterator.call(context, obj[key], key, obj) === breaker) return;
			}
		}
	}
};

// Pull Straight out of nvd3 library
// Easy way to bind multiple functions to window.onresize
// TODO: give a way to remove a function after its bound, other than removing all of them
d3.ma.onResize = function(fun, context){
	var oldresize = window.onresize;

	window.onresize = function(e) {
		if (typeof oldresize === 'function') oldresize.call(context || this, e);
		fun.call(context || this, e);
	}
};

// Convinient method to call onResize() bind to the right context
// E.G  d3.ma.onResize(line._resize, line);
// E.G  d3.ma.onResize(area._resize, area);
// New Approach:  d3.ma.resize(line, area);  //actually, bind the right context to execute the onResize()
d3.ma.resize = function(array)  {
	array = ( Object.prototype.toString.call(array) === '[object Array]' ) ? array : Array.prototype.slice.call(arguments);

	if( array.length ){
		d3.ma.each(array, function(context, index){
			d3.ma.onResize(context._resize, context);
		});
	}
};

d3.ma.reloadResize = function(array)  {
	array = ( Object.prototype.toString.call(array) === '[object Array]' ) ? array : Array.prototype.slice.call(arguments);

	if( array.length ){
		var e = {
			width: d3.ma.windowSize().width,
			height: d3.ma.windowSize().height
		};
		d3.ma.each(array, function(context, index){
			context._resize.call(context || this);
			context._redraw(e);
		});
	}
};


// modified implementation from zepto.js library
// In general, you do not need to apply 2nd arg. by default, element is document
// selector could be any string, it is required. e.g:  id, class, tagName, any css selector
// return  an array representation of DOM objects.
d3.ma.$ = function(selector, element) {

	var found,
		element = element || document,
		slice = Array.prototype.slice,
		classSelectorRE = /^\.([\w-]+)$/,
		tagSelectorRE = /^[\w-]+$/,
		idSelectorRE = /^#([\w-]*)$/;

	function isDocument(obj)   {
		return obj != null && obj.nodeType == obj.DOCUMENT_NODE;
	}

	return (isDocument(element) && idSelectorRE.test(selector)) ?
		( (found = element.getElementById(RegExp.$1)) ? [found] : [] ) :
		(element.nodeType !== 1 && element.nodeType !== 9) ? [] :
		slice.call(
			classSelectorRE.test(selector) ? element.getElementsByClassName(RegExp.$1) :
			tagSelectorRE.test(selector) ? element.getElementsByTagName(selector) :
			element.querySelectorAll(selector)
		);
};

// variation of d3.ma.$(selector). return a single DOM object, the first index of the array
// Works best with id selection. selector could be any string, it is required. e.g:  id, class, tagName, any css selector
// Use case:  when dealing with d3.ma.tooltip(), 3rd arg would expect to have a DOM element e.g:  d3.ma.$$('#vis')
d3.ma.$$ = function(selector, element) {
	var ret = d3.ma.$(selector, element);
	return ret[0];
};


/*
	Works like a constructor, initialize the tooltip object. e.g var tooltip = d3.ma.tooltip()
	Argument:  context.  optional, by passing the current context of my function to detemine which DOM element should be append the tooltip HTML markup. In general, d3.ma.tooltip(this.base). Tooltip block should be the siblings of the svg element

	tooltip.show()  # show tooltip markup like switch the display property on.
		pos: Array, required. expect [x, y] to detemine tooltip position left, and top pixel value. The value should be set without tooltip obj to figure out where it should be positioned to.
		content: required. HTML markup contains optional javascript variable data. content to show
		parentContainer: optional. single DOM object, the element which need to contain the tooltip block. By default, it will add to the body element
		classes: optional, by default, tooltip has d3maTooltip class, add more classes if needed

		E.G  tooltip.show([e.pos[0], e.pos[1]], html, d3.ma.$$('#vis'))

	tooltip.close()   # suppress the current tooltip block. turn the visiblity of tooltip off. can have 'd3maTooltip-pending-removal' class to show something interesting before it is being removed.
 */

d3.ma.tooltip = function(context) {
	var tooltip = {},
		context = context || tooltip;

	tooltip.show = function(pos, content, parentContainer, classes){

		var tooltipContainer = document.createElement('div');

		tooltipContainer.className = 'd3maTooltip ' +  (classes ? classes : '');

		var body = parentContainer || document.getElementsByTagName('body')[0];

		if(tooltip !== context) {
			body = context[0][0].parentNode.parentElement;
		}

		tooltipContainer.innerHTML = content;
		tooltipContainer.style.left = 0;
		tooltipContainer.style.top = 0;
		tooltipContainer.style.opacity = 0;

		body.appendChild(tooltipContainer);

		// var height = parseInt(tooltipContainer.offsetHeight),
		// 	width = parseInt(tooltipContainer.offsetWidth),
		// 	windowWidth = d3.ma.windowSize().width,
		// 	windowHeight = d3.ma.windowSize().height,
		// 	scrollTop = window.scrollY,
		// 	scrollLeft = window.scrollX,

		var left = pos[0],
			top = pos[1];

		// windowHeight = window.innerWidth >= document.body.scrollWidth ? windowHeight : windowHeight - 16;
		// windowWidth = window.innerHeight >= document.body.scrollHeight ? windowWidth : windowWidth - 16;

		tooltipContainer.style.left = left+'px';
		tooltipContainer.style.top = top+'px';
		tooltipContainer.style.opacity = 1;
		tooltipContainer.style.position = 'absolute'; //fix scroll bar issue
		tooltipContainer.style.pointerEvents = 'none'; //fix scroll bar issue

		// d3.select('.d3maTooltip')
		// 	.transition()
		// 	.duration(200)
		// 	.style('opacity', 1);

		return tooltip;
	};

	tooltip.close = function(){
		var tooltips = document.getElementsByClassName('d3maTooltip');
		var purging = [];
		while(tooltips.length) {
			purging.push(tooltips[0]);
			tooltips[0].style.transitionDelay = '0 !important';
			tooltips[0].style.opacity = 0;
			tooltips[0].className = 'd3maTooltip-pending-removal';
		}

		setTimeout(function() {
			while (purging.length) {
				var removeMe = purging.pop();
				removeMe.parentNode.removeChild(removeMe);
			}
		}, 500);

		return tooltip;
	};


	//var dispatch = d3.dispatch('tooltipShow', 'tooltipHide')

	return tooltip;
};

// TODO: Implement zoom feature here
d3.ma.zoom = function() {
	var zoom = {};

	return zoom;
};
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
/*
	For reusable components. it could be mixed into any chart modules. quickly mask out a portion of the view.

	Generated Markup:
		<defs>
			<clipPath id='clip-342'>
				<rect width="0" height="0" x='0' y='0' />
			</clipPath>
		</defs>

	Usage:
		<g clip-path="url(#clip-342)">

	Initalization:
		var clip =  this.mixin("Clip",  this.base);
		clip.box(600, 500).xy(400, 50);

		var barsG = this.base.append("g").classed('bars', true).attr({
			'width': this.base.attr('width'),
			'height': this.base.attr('height'),
	            'clip-path': clip.url()
		});

	APIs:
		public attributes:   width, height, x, y, clipPath(current clipPath element), rect (current rect element), cid ( clipPath element id attribute)

		clippath.id()
		# setter/getter clipPath element id attribute

		clippath.url()
		# getter  quickly return 'url(clip-342)' type of vlaue to use in clip-path attribute ready format e.g  clippath.url()

		clippath.box()
		# setter/getter rect element width value and height value

		clippath.xy()
		# setter/getter rect element x and y coordinates attribute
 */

d3.chart('Clip', {
	initialize: function() {

		var defs = this.base.append('defs'),
			random = Math.floor(Math.random() * 1000);//Create semi-unique ID

		this.width = this.base.attr('width') || 0;
		this.height = this.base.attr('height') || 0;
		this.x = 0;
		this.y = 0;

		this.clipPath = defs.append('clipPath');
		this.rect = this.clipPath.append('rect');
		this.cid = 'clip-' + random;

		// clipPath need to have a custom id
		this.clipPath.attr('id', this.cid);
		this.rect.attr({
			'width': this.width,
			'height': this.height,
			'x': this.x,
			'y': this.y
		});
	},

	// Setter/Getter for the custom id string
	id: function(_id) {
		if (arguments.length === 0) { return this.cid; }
		this.cid = _id;
		this.clipPath.attr('id', _id);
		return this;
	},

	// This is a getter fn ONLY, quick retrieve the id
	// output it in the clip-path: 'url(#clip-342)' fashion
	// url(#clip-342) is the return value
	url: function() {
		return 'url(#'+this.id()+')';
	},

	_width: function(_width) {
		if (arguments.length === 0) { return this.width; }
		this.width = _width;
		this.rect.attr('width', _width);
		return this;
	},

	_height: function(_height) {
		if (arguments.length === 0) { return this.height; }
		this.height = _height;
		this.rect.attr('height', _height);
		return this;
	},

	// Recommanded to use box() to get/set the rect size,
	// rarely use _width() and _height() fn to set individual sizes
	box: function(_width, _height) {
		if (arguments.length === 0) {
			return {
				'width': this.width,
				'height': this.height
			}
		}
		this._width(_width);
		(arguments.length === 1) ?  this._height(_width) :  this._height(_height);
		return this;
	},

	xy: function(_x, _y) {
		if (arguments.length === 0) {
			return {
				x: this.x,
				y: this.y
			}
		}
		this.x = _x;
		this.y = (arguments.length === 1) ?  _x :  _y ;

		this.rect.attr({
			'x': this.x,
			'y': this.y
		});

		return this;
	}
});
/*
	Internal use only, never use it for displaying a chart.
	Scale.js is designed to be extended by other file like axis.js and other charts.

	Note:
		Anywhere elses in the app, should not defined any scale fn or init the scale fn, all others should be extended from this file to keep it dry

		options.info is an absolutely required parameter. If it is not present, it will throw an error. To set this option, follow this pattern. E.G.
			d3.chart("FinalChart", {
				initialize: function(containerInfo) {  <= defined containerInfo option obj here.
					var area = this.mixin("Area", this.base.append('g').classed('area', true), {
						info: containerInfo  <= defined containerInfo option obj in the instance level. Required
					});
				}
			});
			var canvas = container.canvas().chart("FinalChart", container.info() ); <= passing obj as 2nd arg when init the canvas

	Arguments:
		private atrribute:
			x & y:  scale representation for the x axis and y axis. take x or y as a key, value should be a string representation of scale value, default value is linear, everything will override the default

			Internally, it transformed from x & y to _x & _y as internal variables

			Note: x, y could only be set by the initialization fn, option objects.

		public attributes:
			width, height,  (# canvas width and height values.)
			info  (# graph info about the details of this graph, canvas related info, svg info)
			xScale, yScale (# scale fn on the x & y axis. it should always be used when dealing with xScale and yScale. cause it only init the scale on x and y once, it won't be changed. The behavoir could be overrided by each individual fn)

		Note: by default, you do not need to specified width, height value in the third args, it will use the info options for the value, if you want to override the default, you could definied the width and height to override the info value

		info arg is absolutely required the param. it is used to figure out the width and height stuffs.

	APIs:  ( defined in the constructor level )
		private api:
			_x, _y (# contain the string representation of scale value. used in base.js _updateScale() )
			_switchXScale(xScaleString, widthValue), _switchYScale(yScaleString, heightValue) (#update the range array when window resize or any time scale updates)
			_scale(scaleString)   (# simply just return a new instance of d3.scale # initialize the scale for this graph, always use it internally, do not override )

	Options
		x & y for scale on x axis and y axis, available scale attribute is
		linear, ordinal, log, pow, sqrt, identity, quantile, quantize, threshold

	Example:
		var container = d3.ma.container('#vis');
		container.resize().box(1400, 600);

		// Important, to pass the container.info() as a 2nd param
		var canvas = container.canvas().chart("FinalChart", container.info() ); // <= this is the ABSOLUTELY required setup
		canvas.draw(data);

		d3.chart("FinalChart", {
			//important, to pass the option of containerInfo as an obj options
			initialize: function(containerInfo) {  // <= this is the ABSOLUTELY required setup
				var axis =  this.mixin("MyAxis",  this.base.append("g").classed('axisgroup', true), {
					info: containerInfo,   // <= this is the ABSOLUTELY required setup
					x: 'ordinal',
					guide: true
				});
				var bars = this.mixin("MyBars", this.base.append('g').classed('bars', true), {
					info: containerInfo,  // <= this is the ABSOLUTELY required setup
					x: 'ordinal'
				});
			}
		});

 */
d3.chart('Scale', {

	initialize: function(options) {

		options = options || {};

		if(!options.info){
			throw new Error('Container Info {info: containerInfo} is absolultely required when an instance is created');
		}

		var x = options.x || 'linear';
		var y = options.y || 'linear';

		this._x = x;
		this._y = y;

		this.width = options.width || options.info.canvasW || this.base.attr('width') || 1;
		this.width = +this.width;
		this.height = options.height || options.info.canvasH || this.base.attr('height') || 1;
		this.height = +this.height;

		this.info = options.info;

		// init the scale
		this.xScale = this._scale(x);
		this.yScale = this._scale(y);

		this._switchXScale(x, this.width);
		this._switchYScale(y, this.height, false);

		if(options.y1) {
			var y1 = options.y1 || 'linear';
			this.y1Scale = this._scale(y1);
			// using the same _switchYScale fn, most likely using the same axis
			// if 3rd arg is true, it will switch from this.yScale to this.y1Scale
			this._switchYScale(y1, this.height, true);
		}
	},

	_switchXScale: function(x, _width) {
		switch(x) {
			case 'linear' :
				this.xScale.range([0, _width]);
			break;

			case 'ordinal' :
				this.xScale.rangeRoundBands([0, _width], 0.1);
			break;
		}
	},

	_switchYScale: function(y, _height, y1flag) {
		var yscale = (y1flag) ? this.y1Scale : this.yScale;
		switch(y) {
			case 'linear' :
				yscale.range([_height, 15]);
			break;

			case 'ordinal' :
				yscale.rangeRoundBands([_height, 15], 0.1);
			break;
		}
	},

	_scale: function(scale) {
		switch(scale) {
			case 'linear':
				return d3.scale.linear();
			break;

			case 'ordinal':
				return d3.scale.ordinal();
			break;

			case 'log':
				return d3.scale.log();
			break;

			case 'pow':
				return d3.scale.pow();
			break;

			case 'sqrt':
				return d3.scale.sqrt();
			break;

			case 'identity':
				return d3.scale.identity();
			break;

			case 'quantile':
				return d3.scale.quantile();
			break;

			case 'quantize':
				return d3.scale.quantize();
			break;

			case 'threshold':
				return d3.scale.threshold();
			break;

			case 'time':
				return d3.time.scale();
			break;

			default:
				return d3.scale.linear();
			break;
		}
	}
});
/*
	Base is extended from Scale, it is used for the basic/ folder section. All mixined or extended modules will have all its behavior. Where you define your absolutely needed methods for the APIs. Internal use only, never use it for displaying a chart.

	Initalization:
		initialize: function(containerInfo) {
			var chart =  this.mixin('Base',  axisG, {
				info: containerInfo,
				x: 'ordinal',
				y: 'log',
				width: this.base.attr('width'),  // optional
				height: this.base.attr('height')   // optional
			});
		}

		// Passing options object as a third argument. Options is required.

	Arguments:
		Attributes
			since it inherit from scale.js, it will have all its private & public attr. Read core/scale.js Arguments section for details


	APIs:  ( defined in the constructor level )
	# THOSE APIs EXIST IN ALL EXTENDED MODULES
		constructor.box(_width, _height)
			# setter/getter container width value and height values, when only one value, height is the same as width

		constructor.w(_width)
			# setter/getter container width value  // always recommend to use constructor.box() instead

		constructor.h(_height)
			# setter/getter container height value  // always recommend to use constructor.box() instead

	PRIVATE APIs:
		_bindMouseEnterOutEvents(chart, single)
			# when it is entering, binding datum with each element, single element will bind 'mouseenter' event with our custom 'd3maMouseenter', bind 'mouseout' with our custom event 'd3maMouseout'.
			For example, quick internal binding to reduce duplicated code in modules like circle.js, bars.js etc

		1. _resize()  # called from d3.ma.onResize() or d3.ma.resize()
		2. _onWindowResize(chart, single)  # called from each individual module. It has to defined in each module basis. Since it has to pass the chart, single info in this.layer lifeevent enter event. No way to know its context in base.js level.
		3. _redraw(e, chart, single)  # called from each individual module
		4. _unbind(e, chart, single) # called from each individual module
		5. _updateScale(_width, _height) # called from each individual module
		6. _update(_width, _height, chart, single)  # this methods should be handled by each module, normally defined for special cases

		Here is the logic on those private methods above.
		When each instance attach an function of resize(context, context ...), E.G. d3.ma.onResize(line._resize, line); `1. _resize()` is called automatically, it will figure it out current width and height, dispatch 'd3maOnWindowResize' or 'd3maOffWindowResize' accordingly, passing the correct data object to the handlers.

		Each module ( like line, bar, circle etc ) will handle it to trigger `2. _onWindowResize()` this._onWindowResize() like Line, Axis or chart._onWindowResize(chart, this) inside this.layer enter lifeevent. _onWindowResize defined the global handler on 'd3maOnWindowResize' or 'd3maOffWindowResize', passing three arguments (e, chart, single).
		e is the object received from 'd3maOnWindowResize' or 'd3maOffWindowResize'.
		chart refer to this context, used it to access xScale, yScale, width, height, etc. chart property.
		single refer to each individual group just appended by insert command.

		`3. _redraw(e, chart, single)` will be triggered on 'd3maOnWindowResize'. First, it will trigger `5. _updateScale(_width, _height)`, based on the current xScale string value, yScale string value, update the xScale, yScale range array. ( defined in scale.js ) and update the module box width and height attribute.  Second, it will dispatch another global d3.ma event. 'd3maSingleWindowResize', passing (chart, single) as its arguments.  Third, defined a recommended method called `6. update()`. E.G. this.update( _width, _height, chart, single ).  so any module could hook into this method and attach its own custom updates based on current context and its useful values like width, height, chart info and single info

		`4. _unbind(e, chart, single)` will be triggered on 'd3maOffWindowResize'. It will auto trigger `5. _updateScale(_width, _height)` and `6. update( _width, _height, chart, single )` for modifying the scale range and domain

		`5. update, a public function, it will be called when _redraw or _unbind are being called. You could update the domain, range or whatever in your module. It need to be handled in the module level`

		'd3maSingleWindowResize': `3. _redraw(e, chart, single)` dispatch an event of `d3maSingleWindowResize`, each instance of the module should handle it separately based on its settings. (like in index.html).
			E.G.
				circles.dispatch.on('d3maSingleWindowResize', function(chart, single){
					var chart = chart || this;
					single.attr({
						'cx': area.line.x(),
						'cy': area.line.y()
					});
				});

	Events:  ( defined in the instance level )
		# Used for constructor.dispatch.on trigger events  E.G: Custom d3maMouseenter and mouseout events
		# syntax: constructor.dispatch.on('d3maMouseenter', function(e){ });

		# Currently support:
			d3maMouseenter   # each individual element mouse enter event
			d3maMouseout	# each individual element mouse out event
			d3maSingleWindowResize   # each individual element window resize event, normally, update scale domain, individual attrs
			d3maOnWindowResize		# window resize event, elements need to update its scales, and other attrs
			d3maOffWindowResize		# window resize event, elements do not update its scale, attrs, reset to original
 */
d3.chart('Scale').extend('Base', {

	initialize: function(options) {

		options = options || {};

		this.box(this.width, this.height);

		this.dispatch = d3.dispatch('d3maMouseenter', 'd3maMouseout', 'd3maOnWindowResize', 'd3maOffWindowResize', 'd3maSingleWindowResize');
	},

	w: function(_width) {
		if (arguments.length === 0) {
			return this.width;
		}
		this.width = _width;
		this.base.attr('width', this.width);
		return this;
	},

	h: function(_height) {
		if (arguments.length === 0) {
			return this.height;
		}
		this.height = _height;
		this.base.attr('height', this.height);
		return this;
	},

	box: function(_width, _height) {
		if(!arguments.length) {
			return {
				'width': this.width,
				'height': this.height
			};
		}

		this.w(_width);
		this.h((_height) ? _height : _width);

		return this;
	},

	// chart  # refer to this context, used it to access xScale, yScale, width, height, etc. chart property
	// this    # refer to each individual group just appended by insert command
	// single[0][i]  # refer to the current hover DOM element
	_bindMouseEnterOutEvents: function(chart, single) {
		var chart = chart || this;

		single.on('mouseenter', function(d, i){
			d3.select(this).classed('hover', true);
			var obj = {};
			if(chart.onDataMouseenter) {
				obj = chart.onDataMouseenter(d, i, chart, single[0][i]);
			}
			chart.dispatch.d3maMouseenter(obj);
		});

		single.on('mouseout', function(d, i){
			d3.select(this).classed('hover', false);
			var obj = {};
			if(chart.onDataMouseout) {
				obj = chart.onDataMouseout(d, i, chart, single[0][i]);
			}
			chart.dispatch.d3maMouseout(obj);
		});
	},

	_resize: function() {
		// NOTE: this here is the context where you definied in the 2nd param when initialized
		// ex: d3.ma.onResize(line._resize, line);
		// in this case, the context here is  line

		var containerInfo = this.info,
			widthOffset = d3.ma.$$(containerInfo.parentNode).offsetLeft + containerInfo.marginLeft + containerInfo.marginRight,
			heightOffset = d3.ma.$$(containerInfo.parentNode).offsetTop + containerInfo.marginTop + containerInfo.marginBottom,
			windowWidth = d3.ma.windowSize().width - widthOffset,
			windowHeight = d3.ma.windowSize().height - heightOffset;

		// var containerInfo = this.info,
		// 	windowWidth = d3.ma.windowSize().width,
		// 	windowHeight = d3.ma.windowSize().height;

		if( windowWidth < containerInfo.containerW || windowHeight < containerInfo.containerH ) {
			var onObj = {
				width: ( windowWidth < containerInfo.containerW ) ? windowWidth : containerInfo.containerW,
				height: ( windowHeight < containerInfo.containerH ) ? windowHeight : containerInfo.containerH
			};
			this.dispatch.d3maOnWindowResize(onObj);
		} else {
			var offObj = {
				width: containerInfo.canvasW,
				height: containerInfo.canvasH
			};
			var origObj = {
				width: containerInfo.containerW,
				height: containerInfo.containerH
			};
			// dispatch the _redraw back to the original container box
			this.dispatch.d3maOnWindowResize(origObj);
			// unbind the window resize event
			this.dispatch.d3maOffWindowResize(offObj);
		}
	},

	// it is the handler for the internal _resize() which definied above this one
	_onWindowResize: function(chart, single){
		var self = this;

		this.dispatch.on('d3maOnWindowResize', function(e){
			self._redraw(e, chart, single);
		});

		this.dispatch.on('d3maOffWindowResize', function(e){
			self._unbind(e, chart, single);
		});
	},

	// this will trigger the _update internal fn
	// look at the line.js _update fn for details
	_redraw: function(e, chart, single) {
		var containerInfo = this.info,
			_width = e.width - containerInfo.marginLeft - containerInfo.marginRight,
			_height = e.height - containerInfo.marginTop - containerInfo.marginBottom;

		//handle this in base.js below this fn. dealing with Scale updates
		this._updateScale(_width, _height);

		//dealing with the single element, trigger 'd3maSingleWindowResize'
		//handle event in the each instance for details updates.
		//usage on rects, circles, like multiple repeated elements.
		this.dispatch.d3maSingleWindowResize(chart, single);

		// Except Axis, only pass in the chart without single, everything else should pass all 4 args
		// Currently, _update is only used in axis base, for constant API, update could be used inside custom constructors
		if (this._update) {
			this._update( _width, _height, chart, single );
		}
		// handle this in individual modules
		// Optional step, if defined in each module, could
		// setup the global default in this module, or setup global attrs
		// Axis is using this in the custom construtor.
		if (this.update) {
			this.update( _width, _height, chart, single );
		}
	},

	// this will trigger the _update internal fn
	// look at the line.js _update fn for details
	_unbind: function(e, chart, single) {
		// find out the current width & height of line g container. convert it to number
		var containerInfo = this.info,
			currentWidth = +(this.base.attr('width')),
			currentHeight = +(this.base.attr('height')),
			_canvasW = containerInfo.canvasW,
			_canvasH = containerInfo.canvasH;

		if( currentWidth !== _canvasW || currentHeight !== _canvasH)  {
			// same usage like _redraw fn for  _updateScale  &  _update
			this._updateScale(_canvasW, _canvasH);

			if (this.update)
				this.update(_canvasW, _canvasH, chart, single);
		}
	},

	// Update Scale, Box Size
	_updateScale: function(_width, _height) {
		// trigger the Scale in scale.js
		this._switchXScale(this._x, _width);
		this._switchYScale(this._y, _height);

		this.box(_width, _height);
	}

});
/*
	it will draw the x axis and y axis for the chart. optionally, it could draw the grid guides along the x and y axis.

	Initalization:
		initialize: function(containerInfo) {
			var axis =  this.mixin("Axis",  guideLineG, {
				info: containerInfo,
				x: 'ordinal',
				y: 'log',
				width: this.base.attr('width'),  // optional
				height: this.base.attr('height'),  // optional
				guide: true,
				ticksOnResize: true
			});
		}

		// Passing options object as a third argument. Options is required.

	Arguments:
		Attributes
			since it inherit from scale.js, it will have all its private & public attr. Read core/scale.js Arguments section for details

		public attributes:
			guide: Boolean. Optional,  default to false. Draw the grid guides along x, y axis when guide is true
			ticksOnResize: Boolean, Optional, default to false. Redraw the ticks when resize the window based on different ratio
			xAxis, yAxis   ( # could use to override its default value, like defined ticks(), orient(), etc. )
			xAxisG, yAxisG ( # could use to defined custom element attributes )

		Note:  currently, xGuide, yGuide is remaining as private object, if needed, it could expose out to the api

	APIs:
		onDataBind: function() { }
			# fn is actually handling the custom dataBind value to each individual group

		axis.xLabel(_label, leftRightPosition, upDownPosition)
			# _label:  Required, text will be shown in the label section
			# leftRightPosition: Optional, it will be positive number. move the text on the left and right position
			# upDownPosition: Optional, it will be positive number. move the text on the up and down position

			By default, the text will be translated to margin.left and margin.bottom
			Use  .x .label  selector to style the label

		axis.yLabel(_label, upDownPosition, leftRightPosition) {
			# _label:  Required, text will be shown in the label section
			# upDownPosition: Optional, it will be positive number. move the text on the up and down position
			# leftRightPosition: Optional, it will be positive number. move the text on the left and right position

			By default, the text will be translated to margin.left and margin.top, rotate -90 degrees
			Use  .y .label  selector to style the label


		When using the y1 flag, all the line, circle or whatever the instance should define the y1 since it is totally optional, ex: y1: 'linear'  this will actually pass to the axis element here to create y1 axis
*/
d3.chart('Base').extend("Axis", {

	initialize: function(options) {
		this.options = options = options || {};

		this.guide = options.guide || false;
		this.ticksOnResize = options.ticksOnResize || false;

		this.xAxis = d3.svg.axis().scale(this.xScale).orient('bottom');

		this.yAxis = d3.svg.axis().scale(this.yScale).orient('left');

		if(this.guide) {
			this.xAxis
				.tickPadding(5)
				.tickSize(-this.height, 0, 6); //axis.tickSize([major[‚Äã[, minor], end]])

			this.yAxis
				.tickPadding(5)
				.tickSize(-this.width, 0, 6);
		}

		this.xAxisG =  this.base.append('g');

		this.xAxisG.attr({
			'class': 'x axis'
			//'transform': 'translate(0,' + this.height + ')'
		});

		this.xPos();

		this.yAxisG = this.base.append('g');

		this.yAxisG.attr({
			'class': 'y axis'
		});

		this.yPos(null, false);

		if(options.y1) {

			this.y1Axis = d3.svg.axis()
					.scale(this.y1Scale)
					.orient('right')
					.tickPadding(5);

			this.y1AxisG =  this.base.append('g');

			this.y1AxisG.attr({
				'class': 'y1 axis'
			});

			this.yPos(this.width, true);
		}
	},

	transform: function(data) {
		//Acutally draw the xAxis, yAxis on the screen
		if(this.onDataBind) { this.onDataBind(data); }

		this.xAxisG
			.transition()
			.duration(400)
			.ease('cubic-out')
			.call( this.xAxis);

		this.yAxisG
			.transition()
			.duration(400)
			.ease('cubic-out')
			.call( this.yAxis);

		if(this.options.y1) {

			this.y1AxisG
				.transition()
				.duration(400)
				.ease('cubic-out')
				.call( this.y1Axis );
		}

		// this: it is the chart object itself, does not pass single by any chances
		this._onWindowResize(this);

		return data;
	},

	xPos: function(_value) {
		var _value = (_value) ? _value : this.height;

		this.xAxisG.attr({
			'transform': 'translate(0,' + _value + ')'
		});

		return this;
	},

	yPos: function(_value, y1flag) {
		var yaxisg= (y1flag) ? this.y1AxisG : this.yAxisG;

		// _value, by default, it won't translate at all, stay at 0, 0
		if(_value) {
			yaxisg.attr({
				'transform': 'translate(' + _value  + ' , 0)'
			});
		}
		return this;
	},

	// Update Scale, Box Size, and attr values
	_update: function( _width, _height, chart ) {
		this.xAxisG.attr({'transform': 'translate(0,' + _height + ')'});

		if(this.ticksOnResize) this._redrawTicksOnResize();

		if(this.guide) {
			this.xAxis
				.tickPadding(5)
				.tickSize(-this.height, 0, 6); //axis.tickSize([major[‚Äã[, minor], end]])

			this.yAxis
				.tickPadding(5)
				.tickSize(-this.width, 0, 6);
		}

		this.xAxisG
			.transition()
			.duration(400)
			.ease('cubic-out')
			.call( this.xAxis);

		this.yAxisG
			.transition()
			.duration(400)
			.ease('cubic-out')
			.call( this.yAxis);
	},

	_redrawTicksOnResize: function() {
		var xScaleRange = this.xScale.range(),
			yScaleRange = this.yScale.range();

		if( this._x !== 'ordinal' ) {
			this.xAxis.ticks(Math.abs(xScaleRange[1] - xScaleRange[0]) / 100);
		}
		if( this._y !== 'ordinal' ) {
			this.yAxis.ticks(Math.abs(yScaleRange[1] - yScaleRange[0]) / 100);
		}
	},

	xLabel: function(_label, leftRightPosition, upDownPosition) {
		var containerInfo = this.info,
			xValue = leftRightPosition + containerInfo.marginLeft,
			yValue = upDownPosition - containerInfo.marginBottom;

		this.xAxisG.append('text').classed('label', true).attr({
			'x': xValue || containerInfo.marginLeft - 15, // control left and right of the label
			'y': yValue || 0, // control up and down of the label
			'transform': 'translate(' + this.info.marginLeft+ ',' + this.info.marginBottom + ')'
		})
			.style('opacity', 1e-6)
			.text(_label)
				.transition()
				.duration(1000)
				.ease('cubic-out')
				.style('opacity', 1);

		return this;
	},

	// The way to position the axis is super tricky here
	// leftRightPosition: control the left and right position value, actually modify the y value
	// upDownPosition: control the top and down position value, actually modify the x value
	// with some logic when switch y and y1, we could pass all positive number and ignore the negative value
	// Ex:
	// y example:   chart.yLabel(moduleSelf.key1, 20, 130);
	// y1 example: chart.yLabel(moduleSelf.key2, 5, 155, true);
	// The 4th arg for taking care of the y1 as a flag
	yLabel: function(_label, leftRightPosition, upDownPosition, y1flag) {
		var containerInfo = this.info;
			// this is the old xValue and yValue automation. forget what I thought on this implementation
			// xValue = (-upDownPosition) + containerInfo.marginTop - 15,
			// yValue = Math.abs(leftRightPosition - containerInfo.marginLeft) - 5;

		var yaxisg= (y1flag) ? this.y1AxisG : this.yAxisG,
			upDownVal =  (y1flag) ? upDownPosition : -(upDownPosition),
			rotateVal = (y1flag) ? -270 : -90;

		yaxisg.append('text').classed('label', true).attr({
			'x':  upDownVal || -15, // control up and down of the label
			'y':  leftRightPosition || 15,  // control left and right of the label
			'transform':  'rotate(' + rotateVal + ') translate(' + (-this.info.marginTop)+ ',' + (-this.info.marginLeft) + ')'
			//'transform':  'rotate(' + rotateVal + ') translate(' + (-this.info.marginTop)+ ',' + (-this.info.marginLeft) + ')'
		})
			.style('opacity', 1e-6)
			.text(_label)
				.transition()
				.duration(800)
				.ease('cubic-out')
				.style('opacity', 1);

		return this;
	}
});
/*
	define an extended chart from the Base Chart  src/core/base.js
	It is used for displaying the bar chart

	Initalization:
		initialize: function(containerInfo) {
			var bars = this.mixin("MyBars", this.base.append('g').classed('bars', true), {
				info: containerInfo,
				x: 'ordinal',
				width: this.base.attr('width'),  // optional
				height: this.base.attr('height')  // optional
			});
		}

		// Passing options object as a third argument.

	Arguments:
		private atrribute:
			x & y:  scale representation for the x axis and y axis. take x or y as a key, value should be a string representation of scale value, default value is linear, everything will override the default

			Note: x, y could only be set by the initialization fn, option objects.

		public attributes:
			width, height,  (# container width and height values.)
			xScale, yScale (# scale fn on the x & y axis. )
			info  (# graph info about the details of this graph include width and height)

		Note: by default, you do not need to specified width, height value in the third args, it will use the info options for the value, if you want to override the default, you could definied the width and height to override the info value

	APIs:  ( defined in the constructor level )
		bars.box(_width, _height)
			# setter/getter container width value and height values

		bars.w(_width)
			# setter/getter container width value  // always recommend to use bars.box() instead

		bars.h(_height)
			# setter/getter container height value  // always recommend to use bars.box() instead

		onDataBind: function(chart) { }
			# arg, chart: represent this.chart() inside the this.layer() fn. context for this graph, the whole object
			# optional, but kind of like required, this is fn where you could use to override default methods using customized dataset to represent different visualization of the graphs. This is where you manipuated the custom data methods
			Note: this is normally where you define dynamic xScale, yScale
			E.G
				onDataBind: function(chart) {
					var chart = chart || this;
					// Setup xScale domain range
					chart.xScale.domain(d3.merge(data).map(function(d) { return d.label }));
					// Setup yScale domain range
					var maxY = Math.round( d3.max( data.map(function(val, ind){ return val.value;  }) ) );
					chart.yScale.domain([ 0, maxY ]);
				}

		onInsert: function(chart) { }
			# arg, chart: represent this.chart() inside the this.layer() fn. context for this graph, the whole object
			# arg,
			# optional, trigger inside this.layer() insert method, you could define some default attributes here for each element which is going to be entered in selection.enter()

		onEnter: function(chart, this) { }
			# arg, chart: represent this.chart() inside the this.layer() fn. context for this graph, the whole object
			# arg, this:  represent single bar element. context for each individual bar element
			# optional, but kind of like required, this is fn where you could use to override dynamic attributes
			E.G
				onEnter: function(chart, single) {
					var chart = chart || this,
						color = d3.scale.category10();

					single.attr({
						'x': function(d, i) { return chart.xScale(d.label); },
						'y': function(d) { return chart.yScale(d.value); },
						'width': function(d) { return chart.xScale.rangeBand() ; },
						'height': function(d) { return chart.height - chart.yScale(d.value); },
						'fill': function(d) { return color(d.value); }
					});
				},

		onDataMouseenter: function(d, i, chart) { }
			# arg, d: same like d3 option d
			# arg, i: same like d3 option i
			# arg, chart: represent this.chart() inside the this.layer() fn. context for this graph, the whole object

			Optional. If defined, it must have a return object. It used to pass the customized data to the d3maMouseenter event. So that it could build your customized HTML to the hover effect.

			By default, it would do two things. 1, it will add the 'hover' class to the element that you are hovering. 2, it will trigger internal d3maMouseenter event. Well, look at the Events section below, you need to defined the correspond handler to handle the (empty or full)data which passed in.

			E.G
				onDataMouseenter: function(d, i, chart) {
					var chart = chart || bars;
					var obj = {
						'value': d.value,
						'pointIndex': i,
						'd': d,
						'event': d3.event,
						'pos': [
							chart.xScale(d.label) + (chart.xScale.rangeBand() / 2),
							chart.yScale(d.value)
						]
					};
					return obj;
				}

		onDataMouseout: function(d, i, chart) { }
			Exact same above. Except, it is triggering the d3maMouseout event and its correspond handler. Normally, does not need to define this fn because you just need to close the tooltip.

	Events:  ( defined in the instance level )
		d3maMouseenter:
			# syntax: bars.dispatch.on('d3maMouseenter', function(e){ });
			# arg, e: it should be the return data obj which you defined in the constrcutor level fn, onDataMouseenter()
			E.G
				var tooltip = d3.ma.tooltip(this.base);
				bars.dispatch.on('d3maMouseenter', function(e){
					e.pos = [ e.pos[0] + 40, e.pos[1] + 30 ];
					var html = "<div class='tips'>" + e.d.label + "<br><strong>" + e.d.value + "</strong>" + "</div>"
					//tooltip.show([e.pos[0], e.pos[1]], html, d3.ma.$$('#vis'));
					tooltip.show([e.pos[0], e.pos[1]], html);
				});

		d3maMouseout
			# syntax: bars.dispatch.on('d3maMouseout', function(e){ });
			# arg, e: it should be the return data obj which you defined in the constrcutor level fn, onDataMouseout()
			E.G
				bars.dispatch.on('d3maMouseout', function(e){
					tooltip.close();
				});

	// // Update Scale, Box Size, and attr values
	// _update: function(_width, _height, chart, single) {
	// 	// When dealing with the single element, trigger 'd3maSingleWindowResize'
	// 	this.dispatch.d3maSingleWindowResize(chart, single);
	// }
 */
d3.chart('Base').extend('Bars', {

	initialize: function(options) {
		this.options = options = options || {};

		var self = this;

		this.layer('bars', this.base, {

			// select the elements we wish to bind to and bind the data to them.
			dataBind: function(data) {
				var chart = this.chart();
				if(chart.onDataBind) { chart.onDataBind(data, chart); }
				return this.selectAll('.group').data(data);
			},

			// insert actual bars, defined its own attrs
			insert: function() {
				var chart = this.chart();
				if(chart.onInsert) { chart.onInsert(chart); }
				return this.append('g').classed('group', true).append('rect');
			},

			// define lifecycle events
			events: {
				'enter': function() {
					var chart = this.chart();

					// onEnter fn will take two args
					// chart  # refer to this context, used it to access xScale, yScale, width, height, etc. chart property
					// this   # refer to each individual group just appended by insert command
					if(chart.onEnter) { chart.onEnter(chart, this); }

					chart._onWindowResize(chart, this);

					self._bindMouseEnterOutEvents(chart, this);

					// Used for animation the fill opacity property, work with enter:transition
					this.style('opacity', 1e-6);
				},

				'enter:transition': function() {
					var chart = this.chart();
					return this
							.duration(1000)
							.style('opacity', 0.8);
				},
				'exit:transition': function() {
					var chart = this.chart();
					return this
							.duration(400)
							.style('opacity', 1e-6)
							.remove();
				}
			}
		});
	}
});
/*
	by default, the line is expect the data like this structure { x: 0.3434, y: 0.3242}
	but if the object data is rather different like { z: 0.3434, y: 0.3242}

	By doing 		this.options = options = options || {}; # will enable the custom key/value pair in the constructor access


	var line = this.mixin("Line", this.base.append('g').classed('lines', true), {
		info: containerInfo
	});

	line.line.x(function(d){
		return line.xScale(d.z);
	});

	Use this.line # this will be replaced with its current context like line here.
	context.xScale will access the this.xScale here.

	class:  dot

	this.path leave in transform, so that it could be extended by Area chart
 */
d3.chart('Base').extend('Line', {

	initialize: function(options) {
		this.options = options = options || {};

		this.linePath = this.base.append('svg:path').classed('line', true);

		this.line = d3.svg.line();

		this.layer('line', this.linePath, {
			dataBind: function(data) {
				var chart = this.chart();

				// Setup the auto resize to handle the on resize event
				chart.dispatch.on('d3maSingleWindowResize', function(chart, single){
					single.attr({ 'd': chart.line });
				});

				chart.line
					.x(function(d) { return chart.xScale(d.x); })
					.y(function(d) { return chart.yScale(d.y);  });

				if(chart.onDataBind) { chart.onDataBind( data, chart, (options.data) ? options.data : undefined ); }

				// data[options.data]  will return a single array, data will bind path element to each array index,
				// by pushing options array into an anonymous array, ONLY one path element will be created
				//return this.selectAll('path').data( (options.data) ? [ data[options.data] ]: data );
				return this.data( [data] );
			},

			insert: function(){
				var chart = this.chart();
				if(chart.onInsert) { chart.onInsert(chart); }
				return chart.linePath;
			},

			events: {
				'enter': function() {
					var chart = this.chart();

					// chart  # refer to this context, used it to access xScale, yScale, width, height, etc. chart property
					// this   # refer to each individual group just appended by insert command
					if(chart.onEnter) { chart.onEnter(chart, this); }

					chart._onWindowResize(chart, this);
				},

				'enter:transition': function() {
					var chart = this.chart();
					this
						.duration(700)
						.ease('cubic-out')
						.attr({ 'd': chart.line })
				}
			}
		});
	}

	// 	if(this.onDataBind) { this.onDataBind(); }

	// 	this.linePath.datum(data).attr('d', this.line);

	// 	// Define this fn where the data is manipulated
	// 	// after all the data var has the correct value, then call it on Window resize
	// 	// Normally, after calling this fn, need to define the _update to handle the Scale change, box size changes, attr updates
	// 	this._onWindowResize();

	// 	return data;
	// }

	// Update Scale, Box Size, and attr values
	// _update: function(_width, _height) {
});
/*
	Doc is coming soon
	area chart is almost identical to the line chart, only different is area instead line
 */
d3.chart('Base').extend('Area', {

	initialize: function(options) {
		this.options = options = options || {};

		this.areaPath = this.base.append('svg:path').classed('area', true);

		this.area = d3.svg.area();

		this.layer('area', this.areaPath, {
			dataBind: function(data) {
				var chart = this.chart();

				// Setup the auto resize to handle the on resize event
				chart.dispatch.on('d3maSingleWindowResize', function(chart, single){
					single.attr({ 'd': chart.area });
				});

				chart.area
					.x(function(d) { return chart.xScale(d.x); })
					.y1(function(d) { return chart.yScale(d.y);  })
					.y0( chart.height );

				if(chart.onDataBind) { chart.onDataBind(data, chart, (options.data) ? options.data : undefined ); }

				// data[options.data]  will return a single array, data will bind path element to each array index,
				// by pushing options array into an anonymous array, ONLY one path element will be created
				//return this.selectAll('path').data( (options.data) ? [ data[options.data] ]: data );
				return this.data( [data] );
			},

			insert: function(){
				var chart = this.chart();
				if(chart.onInsert) { chart.onInsert(chart); }
				return chart.areaPath;
			},

			events: {
				'enter': function() {
					var chart = this.chart();

					// chart  # refer to this context, used it to access xScale, yScale, width, height, etc. chart property
					// this   # refer to each individual group just appended by insert command
					if(chart.onEnter) { chart.onEnter(chart, this); }

					chart._onWindowResize(chart, this);
				},

				'enter:transition': function() {
					var chart = this.chart();
					this
						.duration(700)
						.ease('cubic-out')
						.attr({ 'd': chart.area });
				}
			}
		});
	}
});
/*

 */
d3.chart('Base').extend('Circle', {

	initialize: function(options) {
		this.options = options = options || {};

		var self = this,
			showOnHover = options.showOnHover || false;

		this.layer('circle', this.base, {
			// select the elements we wish to bind to and bind the data to them.
			dataBind: function(data) {
				var chart = this.chart();

				if(chart.onDataBind) { chart.onDataBind(data, chart); }

				return this.classed('dotHover', (showOnHover) ? true : false).selectAll('circle').data(data);
			},

			// insert actual bars, defined its own attrs
			insert: function() {
				var chart = this.chart();
				if(chart.onInsert) { chart.onInsert(chart); }
				return this.append('circle');
			},

			// define lifecycle events
			events: {
				'enter': function() {
					var chart = this.chart();

					// onEnter fn will take two args
					// chart  # refer to this context, used it to access xScale, yScale, width, height, etc. chart property
					// this   # refer to each individual group just appended by insert command
					if(chart.onEnter) { chart.onEnter(chart, this); }

					chart._onWindowResize(chart, this);

					self._bindMouseEnterOutEvents(chart, this);
				}
			}
		});
	}
});
})();
