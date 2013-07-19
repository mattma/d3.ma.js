
d3.chart('Line').extend('Area', {

	initialize: function(options) {
		options = options || {};

		var self = this;

		this.area = d3.svg.area();

		this.areaPath = this.base.append('path').attr({
			'class': 'area',
		});

		this.line
			.x(this.line.x())
			.y1(this.line.y())
			.y0(y(0));

		return this;
	},

	transform: function(data) {

		if(this.onDataBind) { this.onDataBind(); }

		this.areaPath.datum(data).attr('d', this.area);

		return data;
	}
});
