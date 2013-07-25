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

		var self = this;

		this.line = d3.svg.line();

		if(this.onBuildLine) {
			this.onBuildLine(this);
		} else {
			this.line
				.x(function(d) { return self.xScale(d.x); })
				.y(function(d) { return self.yScale(d.y);  });
		}

		return this;
	},

	transform: function(data) {

		this.linePath = this.base.append('path').attr({
			'class': 'line',
		});

		if(this.onDataBind) { this.onDataBind(); }

		this.linePath.datum(data).attr('d', this.line);

		// Define this fn where the data is manipulated
		// after all the data var has the correct value, then call it on Window resize
		// Normally, after calling this fn, need to define the _update to handle the Scale change, box size changes, attr updates
		this._onWindowResize();

		return data;
	},

	// Update Scale, Box Size, and attr values
	_update: function(_width, _height) {

		this.linePath.attr({
			'd': this.line
		});
	}
});
