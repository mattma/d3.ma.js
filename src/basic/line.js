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
				},

				'enter:transition': function() {
					var chart = this.chart();
					this
						.duration(700)
						.ease('cubic-out')
						.attr({ 'd': chart.line })
				},

				'merge': function() {
					var chart = this.chart();

					chart._onWindowResize(chart, this);
				},

				'exit:transition': function() {
					var chart = this.chart();
					this
						.duration(400)
						.ease('cubic-in')
						.style( 'opacity', 1e-6)
						.remove();
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
