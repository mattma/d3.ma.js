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
	},

	transform: function(data) {

		if(this.onDataBind) { this.onDataBind(); }

		this.path.datum(data).attr('d', this.line);

		return data;
	},
});
