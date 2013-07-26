/*
	by default, the line is expect the data like this structure { x: 0.3434, y: 0.3242}
	but if the object data is rather different like { z: 0.3434, y: 0.3242}


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
		options = options || {};

		this.line = d3.svg.line();

		this.layer('line', this.base, {
			dataBind: function(data) {
				var chart = this.chart();

				chart.line
					.x(function(d) { return chart.xScale(d.x); })
					.y(function(d) { return chart.yScale(d.y);  });

				if(chart.onDataBind) { chart.onDataBind(chart); }

				// data[options.data]  will return a single array, data will bind path element to each array index,
				// by pushing options array into an anonymous array, ONLY one path element will be created
				return this.selectAll('path').data( (options.data) ? [ data[options.data] ]: data );
			},

			insert: function(){
				var chart = this.chart();
				if(chart.onInsert) { chart.onInsert(chart); }
				return this.append('path').classed('line', true);
			},

			events: {
				'enter': function() {
					var chart = this.chart();

					// chart  # refer to this context, used it to access xScale, yScale, width, height, etc. chart property
					// this   # refer to each individual group just appended by insert command
					if(chart.onEnter) { chart.onEnter(chart, this); }

					chart._onWindowResize(chart, this);

					this.attr('d', chart.line);
				}
			}
		});
	}

	// transform: function(data) {

	// 	this.linePath = this.base.append('path').attr({
	// 		'class': 'line',
	// 	});

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

	// 	this.linePath.attr({
	// 		'd': this.line
	// 	});
	// }
});
