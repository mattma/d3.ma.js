/*
	Base is extended from Scale, it is used for the basic/ section. All mixin or extended modules will have all its behavior. Where you define your absolutely needed methods for the APIs. Internal use only, never use it for displaying a chart.

	Initalization:
		var chart =  this.mixin('Base',  axisG, {
			x: 'ordinal',
			y: 'log',
			width: this.base.attr('width'),
			height: this.base.attr('height')
		});

		// Passing options object as a third argument. Options is required.

	Arguments:
		private atrribute:
			x & y:  scale representation for the x axis and y axis. take x or y as a key, value should be a string representation of scale value, default value is linear, everything will override the default

			Note: x, y could only be set by the initialization fn, option objects.

		public attributes:
			width, height,  (# container width and height values.)
			xScale, yScale (# scale fn on the x & y axis. )

	APIs:  ( defined in the constructor level )
	# THOSE APIs EXIST IN ALL EXTENDED MODULES
		constructor.box(_width, _height)
			# setter/getter container width value and height values

		constructor.w(_width)
			# setter/getter container width value  // always recommend to use constructor.box() instead

		constructor.h(_height)
			# setter/getter container height value  // always recommend to use constructor.box() instead

	Events:  ( defined in the instance level )
		# Used for constructor.dispatch.on trigger events  E.G: Custom mouseover and mouseout events
		# syntax: constructor.dispatch.on('d3maMouseover', function(e){ });

		# Currently support:
			d3maMouseover
			d3maMouseout
 */
d3.chart('Scale').extend('Base', {

	initialize: function(options) {

		options = options || {};

		this.box(this.width, this.height);

		this.dispatch = d3.dispatch('d3maMouseover', 'd3maMouseout');
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
	}
});
