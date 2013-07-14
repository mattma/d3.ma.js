// define an extended chart from the Base Chart  src/basic/base.js
d3.chart('Base').extend('Bars', {

	initialize: function(options) {
		options = options || {};

		var color = d3.scale.category10();

		//this.dispatch = d3.dispatch('d3maMouseover', 'd3maMouseout');
		//
		this.layer('bars', this.base, {

			dataBind: function(data) {
				var chart = this.chart();
				if(chart.onData) { chart.onData(); }
				return this.selectAll('.group').data(data);
			},

			// insert actual bars
			insert: function() {
				var chart = this.chart();
				if(chart.onInsert) { chart.onInsert(); }
				return this.append('g').classed('group', true).append('rect');
			},

			// define lifecycle events
			events: {
				'enter': function() {
					var chart = this.chart();
					if(chart.onEnter) { chart.onEnter(); }

					this.attr({
						'x': function(d, i) { return chart.xScale(d.label); },
						'y': function(d) { return chart.yScale(d.value); },
						'width': function(d) { return chart.xScale.rangeBand() ; },
						'height': function(d) { return chart.height - chart.yScale(d.value); },
						'fill': function(d) { return color(d.value); },
						'fill-opacity': 0
					});

					// this.on('mouseover', function(d, i){
					// 	d3.select(this).classed('hover', true);
					// 	var obj = {
					// 		'value': d.value,
					// 		'pointIndex': i,
					// 		'd': d,
					// 		'event': d3.event,
					// 		'pos': [
					// 			chart.xScale(d.label) + (chart.xScale.rangeBand() / 2),
					// 			chart.yScale(d.value)
					// 		]
					// 	};

					// 	chart.dispatch.d3maMouseover(obj);
					// });

					// this.on('mouseout', function(d, i){
					// 	d3.select(this).classed('hover', false);
					// 	var obj = {
					// 		'value': d.value,
					// 		'pointIndex': i,
					// 		'd': d,
					// 		'event': d3.event,
					// 		'pos': [
					// 			chart.xScale(d.label) + chart.xScale.rangeBand() / 2,
					// 			chart.yScale(d.value)
					// 		]
					// 	};

					// 	chart.dispatch.d3maMouseout(obj);
					// });
				},

				'enter:transition': function() {
					var chart = this.chart();
					return this
						.duration(1000)
						.attr({
							'fill-opacity': 0.8
						});
				}
			}
		});
	}
});
