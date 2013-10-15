/*
	Doc is coming soon
	area chart is almost identical to the line chart, only different is area instead line
 */
d3.chart('Base').extend('Area', {

	initialize: function(options) {
		this.options = options = options || {};

		this.layer('area', this.base, {
			dataBind: function(data) {
				var chart = this.chart();

				chart.area = d3.svg.area();

				// Setup the auto resize to handle the on resize event
				chart.dispatch.on('d3maSingleWindowResize', function(chart, single){
					single.attr({ 'd': chart.area });
				});

				chart.area
					.x(function(d) { return chart.xScale(d.x); })
					.y1(function(d) { return chart.yScale(d.y);  })
					.y0(chart.yScale(0));

				if(chart.onDataBind) { chart.onDataBind(data, chart, (options.data) ? options.data : undefined ); }

				// data[options.data]  will return a single array, data will bind path element to each array index,
				// by pushing options array into an anonymous array, ONLY one path element will be created
				//return this.selectAll('path').data( (options.data) ? [ data[options.data] ]: data );
				return this.selectAll('path').data( [data] );
			},

			insert: function(){
				var chart = this.chart();
				if(chart.onInsert) { chart.onInsert(chart); }
				return this.append('path').classed('area', true);
			},

			events: {
				'enter': function() {
					var chart = this.chart();

					// chart  # refer to this context, used it to access xScale, yScale, width, height, etc. chart property
					// this   # refer to each individual group just appended by insert command
					if(chart.onEnter) { chart.onEnter(chart, this); }

					chart._onWindowResize(chart, this);

					this
						.attr({ 'd': chart.area })
						.style('opacity', 1e-6);
				},

				'enter:transition': function() {
					var chart = this.chart();
					return this
							.duration(1000)
							.style('opacity', 1);
				}
			}
		});
	}
});
