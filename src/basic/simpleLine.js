/*
 */
d3.chart('Base').extend('SimpleLine', {

	initialize: function(options) {
		this.options = options = options || {};
		var self = this;

		this.layer('simpleLine', this.base, {
			dataBind: function(data) {
				var chart = this.chart();

				if(chart.onDataBind) { chart.onDataBind( data, chart ); }

				return this.classed('simple-lines', true).selectAll('line').data(data);
			},

			insert: function(){
				var chart = this.chart();
				if(chart.onInsert) { chart.onInsert(chart); }
				return this.append('line');
			},

			events: {
				'enter': function() {
					var chart = this.chart();

					// chart  # refer to this context, used it to access xScale, yScale, width, height, etc. chart property
					// this   # refer to each individual group just appended by insert command
					if(chart.onEnter) { chart.onEnter(chart, this); }
				},

				'merge': function() {
					var chart = this.chart();

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
	},

	_update: function( _width, _height, chart, single ) {
		if(this.update) {
			this.update( _width, _height, chart, single );
		}
	}
});
