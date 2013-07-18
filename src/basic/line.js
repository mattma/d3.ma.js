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
 */
d3.chart('Base').extend('Line', {

	initialize: function(options) {
		options = options || {};

		var self = this;

		this.line = d3.svg.line();

		this.path = this.base.append('path').attr({
			'class': 'line',
		});

		this.line
			.x(function(d) { return self.xScale(d.x); })
			.y(function(d) { return self.yScale(d.y);  });

		return this;
	},

	transform: function(data) {

		if(this.onDataBind) { this.onDataBind(); }

		this.path.datum(data).attr('d', this.line);

		return data;
	},
});
