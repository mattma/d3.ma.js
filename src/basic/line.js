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

	options.dot  true will show the dot or not
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

		if ( options.dot ) {
			this.layer('circle', this.base, {
				// select the elements we wish to bind to and bind the data to them.
				dataBind: function(data) {
					var chart = this.chart();
					if(chart.onDataBind) { chart.onDataBind(chart); }
					return this.selectAll('circle').data(data);
				},

				// insert actual bars, defined its own attrs
				insert: function() {
					var chart = this.chart();
					if(chart.onInsert) { chart.onInsert(chart); }
					return this.append('circle');
				},

				// define lifecycle events
				events: {
					'enter': function() {
						var chart = this.chart();

						// onEnter fn will take two args
						// chart  # refer to this context, used it to access xScale, yScale, width, height, etc. chart property
						// this   # refer to each individual group just appended by insert command
						if(chart.onEnter) { chart.onEnter(chart, this); }

						this.on('mouseover', function(d, i){
							d3.select(this).classed('hover', true);
							var obj = {};
							if(chart.onDataMouseover) {
								obj = chart.onDataMouseover(d, i, chart);
							}
							chart.dispatch.d3maMouseover(obj);
						});

						this.on('mouseout', function(d, i){
							d3.select(this).classed('hover', false);
							var obj = {};
							if(chart.onDataMouseout) {
								obj = chart.onDataMouseout(d, i, chart);
							}
							chart.dispatch.d3maMouseout(obj);
						});
					},
				}
			});
		}

		return this;
	},

	transform: function(data) {

		if(this.onDataBind) { this.onDataBind(); }

		this.path.datum(data).attr('d', this.line);

		return data;
	}
});
