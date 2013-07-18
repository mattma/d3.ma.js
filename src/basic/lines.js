d3.chart('Base').extend('Lines', {

	initialize: function(options) {
		options = options || {};

		this.layer('lines', this.base, {

			// select the elements we wish to bind to and bind the data to them.
			dataBind: function(data) {
				var chart = this.chart();
				if(chart.onDataBind) { chart.onDataBind(chart); }
				return this.selectAll('.lines').data(data);
			},

			// insert actual bars, defined its own attrs
			insert: function() {
				var chart = this.chart();
				if(chart.onInsert) { chart.onInsert(chart); }
				return this.append('g').classed('lines', true).append('path');
			},

			// define lifecycle events
			events: {
				'enter': function() {
					var chart = this.chart();

					// onEnter fn will take two args
					// chart  # refer to this context, used it to access xScale, yScale, width, height, etc. chart property
					// this   # refer to each individual group just appended by insert command
					if(chart.onEnter) { chart.onEnter(chart, this); }

					// Used for animation the fill opacity property, work with enter:transition
					// this.attr({
					// 	'fill-opacity': 0
					// });

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
				}

				// 'enter:transition': function() {
				// 	var chart = this.chart();
				// 	return this
				// 			.duration(1000)
				// 			.attr({
				// 				'fill-opacity': 0.8
				// 			});
				// }
			}
		});
	}
});
