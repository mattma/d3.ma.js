/*

 */
d3.chart('Base').extend('Circle', {

	initialize: function(options) {
		this.options = options = options || {};

		var self = this,
			showOnHover = options.showOnHover || false;

		this.layer('circle', this.base, {
			// select the elements we wish to bind to and bind the data to them.
			dataBind: function(data) {
				var chart = this.chart();

				if(chart.onDataBind) { chart.onDataBind(data, chart); }

				return this.classed('dotHover', (showOnHover) ? true : false).selectAll('circle').data(data);
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

					chart._onWindowResize(chart, this);

					self._bindMouseEnterOutEvents(chart, this);
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
});
