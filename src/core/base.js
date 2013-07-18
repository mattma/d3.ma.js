/*
	Base is extended from Scale, it is used for the basic/ section. All mixin or extended modules will have all its behavior. Where you define your absolutely needed methods for the APIs. Internal use only, never use it for displaying a chart.

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
		private atrribute:
			x & y:  scale representation for the x axis and y axis. take x or y as a key, value should be a string representation of scale value, default value is linear, everything will override the default

			Note: x, y could only be set by the initialization fn, option objects.

		public attributes:
			width, height,  (# container width and height values.)
			xScale, yScale (# scale fn on the x & y axis. )
			info  (# graph info about the details of this graph include width and height)

		Note: by default, you do not need to specified width, height value in the third args, it will use the info options for the value, if you want to override the default, you could definied the width and height to override the info value

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

		this.dispatch = d3.dispatch('d3maMouseenter', 'd3maMouseout');
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
	}

});
