/*
	define an extended chart from the Base Chart  src/basic/base.js
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
		options = options || {};

		var self = this;

		this.layer('bars', this.base, {

			// select the elements we wish to bind to and bind the data to them.
			dataBind: function(data) {
				var chart = this.chart();
				if(chart.onDataBind) { chart.onDataBind(chart); }
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
					this.attr({
						'fill-opacity': 0
					});
				},

				'enter:transition': function() {
					var chart = this.chart();
					return this
							.duration(1000)
							.attr({
								'fill-opacity': 0.8
							});
				}
			}
		});
	}
});
