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
				if(chart.onDataBind) { chart.onDataBind(); }
				return this.selectAll('.group').data(data);
			},

			// insert actual bars
			insert: function() {
				var chart = this.chart();
				if(chart.onInsert) { chart.onInsert(chart); }
				return this.append('g').classed('group', true).append('rect');
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
					this.attr({
						'fill-opacity': 0
					});

					// Both onMouseover() and onMouseout() fn are optional
					// they are used for passing the customized data to the
					// d3maMouseover and d3maMouseout events

					// E.G
						// bars.onMouseover = function(d, i, chart) {
						// 	var chart = chart || bars;
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
						// 	return obj;
						// };

						// Tooltip section
						// bars.dispatch.on('d3maMouseover', function(e){
						// 	e.pos = [ e.pos[0] + 40, e.pos[1] + 30 ];
						// 	var html = "<div class='tips'>" + e.d.label + "<br><strong>" + e.d.value + "</strong>" + "</div>"
						// 	//tooltip.show([e.pos[0], e.pos[1]], html, d3.ma.$$('#vis'));
						// 	tooltip.show([e.pos[0], e.pos[1]], html);
						// });

					this.on('mouseover', function(d, i){
						d3.select(this).classed('hover', true);
						var obj = {};
						if(chart.onDataMouseover) {
							obj = chart.onDataMouseover(d, i, chart);
						}
						chart.dispatch.d3maMouseover(obj);
					});

					// Remove the hover event on mouseout, onMouseout() is optional here
					// it will always trigger d3maMouseout event no matter what.
					// optional pass the obj arg, by default, it is an empty object
					this.on('mouseout', function(d, i){
						d3.select(this).classed('hover', false);
						var obj = {};
						if(chart.onDataMouseout) {
							obj = chart.onDataMouseout(d, i, chart);
						}
						chart.dispatch.d3maMouseout(obj);
					});
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
