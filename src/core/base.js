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
			# setter/getter container width value and height values

		constructor.w(_width)
			# setter/getter container width value  // always recommend to use constructor.box() instead

		constructor.h(_height)
			# setter/getter container height value  // always recommend to use constructor.box() instead

	PRIVATE APIs:
		_bindMouseEnterOutEvents(chart, single)
			# when it is entering, binding datum with each element, single element will bind 'mouseenter' event with our custom 'd3maMouseenter', bind 'mouseout' with our custom event 'd3maMouseout'.
			For example, quick internal binding to reduce duplicated code in modules like circle.js, bars.js etc

	Events:  ( defined in the instance level )
		# Used for constructor.dispatch.on trigger events  E.G: Custom d3maMouseenter and mouseout events
		# syntax: constructor.dispatch.on('d3maMouseenter', function(e){ });

		# Currently support:
			d3maMouseenter
			d3maMouseout
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
	_bindMouseEnterOutEvents: function(chart, single) {
		var chart = chart || this;

		single.on('mouseenter', function(d, i){
			d3.select(this).classed('hover', true);
			var obj = {};
			if(chart.onDataMouseenter) {
				obj = chart.onDataMouseenter(d, i, chart);
			}
			chart.dispatch.d3maMouseenter(obj);
		});

		single.on('mouseout', function(d, i){
			d3.select(this).classed('hover', false);
			var obj = {};
			if(chart.onDataMouseout) {
				obj = chart.onDataMouseout(d, i, chart);
			}
			chart.dispatch.d3maMouseout(obj);
		});
	},

	_resize: function() {
		// NOTE: this here is the context where you definied in the 2nd param when initialized
		// ex: d3.ma.onResize(line._resize, line);
		// in this case, the context here is  line

		var windowWidth = d3.ma.windowSize().width,
			windowHeight = d3.ma.windowSize().height,
			containerInfo = this.info;

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

		// handle this in individual modules
		// Optional step, if defined in each module, could
		// setup the global default in this module, or setup global attrs
		if (this._update)
			this._update( _width, _height, chart, single );
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

			if (this._update)
				this._update(_canvasW, _canvasH, chart, single);
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
