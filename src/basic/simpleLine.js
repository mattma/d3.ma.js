/*
 */
d3.chart('Base').extend('SimpleLine', {

	initialize: function(options) {
		this.options = options = options || {};

		this.layer('simpleLine', this.base, {
			dataBind: function(data) {
				var chart = this.chart();

				if(chart.onDataBind) { chart.onDataBind( data, chart ); }

				// data[options.data]  will return a single array, data will bind path element to each array index,
				// by pushing options array into an anonymous array, ONLY one path element will be created
				//return this.selectAll('path').data( (options.data) ? [ data[options.data] ]: data );
				//return this.data( data );
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
