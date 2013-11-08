/*
	Doc is coming soon
	area chart is almost identical to the line chart, only different is area instead line
 */
d3.chart('Base').extend('Area', {

	initialize: function(options) {
		this.options = options = options || {};

		this.areaPath = this.base.append('svg:path').classed('area', true);

		this.area = d3.svg.area();

		this.layer('area', this.areaPath, {
			dataBind: function(data) {
				var chart = this.chart();

				// Setup the auto resize to handle the on resize event
				chart.dispatch.on('d3maSingleWindowResize', function(chart, single){
					single.attr({ 'd': chart.area });
				});

				chart.area
					.x(function(d) { return chart.xScale(d.x); })
					.y1(function(d) { return chart.yScale(d.y);  })
					.y0( chart.height );

				if(chart.onDataBind) { chart.onDataBind(data, chart); }

				// data[options.data]  will return a single array, data will bind path element to each array index,
				// by pushing options array into an anonymous array, ONLY one path element will be created
				//return this.selectAll('path').data( (options.data) ? [ data[options.data] ]: data );
				return this.data( [data] );
			},

			insert: function(){
				var chart = this.chart();
				if(chart.onInsert) { chart.onInsert(chart); }
				return chart.areaPath;
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
						.attr({ 'd': chart.area });
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
	},

	_update: function( _width, _height, chart, single ) {
		if(this.update) {
			this.update( _width, _height, chart, single );
		}
		this.areaPath.attr({ 'd': chart.area });
	}
});
