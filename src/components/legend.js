/*
	options.align  decide the legend text should be aligned or not
 */

d3.chart('Legend', {
	initialize: function(options) {

		options = options || {};
		var info = options.info;

		var color = d3.ma.Color();

		this.dispatch = d3.dispatch('d3maLegendMouseenter', 'd3maLegendMouseout', 'd3maLegendClick');

		this.layer('legend', this.base, {
			// select the elements we wish to bind to and bind the data to them.
			dataBind: function(data) {
				var chart = this.chart();

				if(chart.onDataBind) { chart.onDataBind(chart); }

				return this.selectAll('.legend').data(data);
			},

			// insert actual bars, defined its own attrs
			insert: function() {
				var chart = this.chart();
				if(chart.onInsert) { chart.onInsert(chart); }
				return this.append('g').classed('legend', true);
			},

			// define lifecycle events
			events: {
				'enter': function() {
					var chart = this.chart();

					this
						.on('mouseenter', function(d, i){
							chart.dispatch.d3maLegendMouseenter(d, i, chart, this);
						})
						.on('mouseout', function(d, i){
							chart.dispatch.d3maLegendMouseout(d, i, chart, this);
						})
						.on('click', function(d, i){
							chart.dispatch.d3maLegendClick(d, i, chart, this);
						});

					this.classed('disabled', function(d) { return d.disabled });
					// .attr({
					// 	'transform': function(d, i) {
					// 		return  'translate( 20, ' + (i * 20 + 10) + ' )'
					// 	}
					// });

					this.append('circle').attr({
						'stroke-width': 2,
						'r': 5,
						'fill': function(d, i) { return d.color || color(d, i) },
						'stroke': function(d, i) { return d.color || color(d, i) }
					});

					this.append('text').attr({
						'text-anchor': 'start',
						'dy': '.32em',
						'dx': 12
					}).text(function(d,i){ return d.key });


					var align = true;

					if (align) {

						var eachLegendWidthArray = [];

						this.each(function(d,i) {
							var legendText = d3.select(this).select('text'),
								svgComputedTextLength = legendText.node().getComputedTextLength()
																	|| d3.ma.calcTextWidth(legendText);

							// 28 is ~ the width of the circle plus some padding
							eachLegendWidthArray.push(svgComputedTextLength + 28);
						});

						var legendPerRow = 0,
							legendWidth = 0,
							columnWidths = [];

						while ( legendWidth < info.canvasW && legendPerRow < eachLegendWidthArray.length) {
							columnWidths[legendPerRow] = eachLegendWidthArray[legendPerRow];
							legendWidth += eachLegendWidthArray[legendPerRow++];
						}

						while ( legendWidth > info.canvasW && legendPerRow > 1 ) {
							columnWidths = [];
							legendPerRow--;

							for (k = 0; k < eachLegendWidthArray.length; k++) {
								if (eachLegendWidthArray[k] > (columnWidths[k % legendPerRow] || 0) )
									columnWidths[k % legendPerRow] = eachLegendWidthArray[k];
							}

							legendWidth = columnWidths.reduce(function(prev, cur, index, array) {
								return prev + cur;
							});
						}

						//console.log(columnWidths, legendWidth, legendPerRow);

						var xPositions = [];

						for (var i = 0, curX = 0; i < legendPerRow; i++) {
							xPositions[i] = curX;
							curX += columnWidths[i];
						}

						this
							.attr('transform', function(d, i) {
								return 'translate(' + xPositions[i % legendPerRow] + ',' + (5 + Math.floor(i / legendPerRow) * 20) + ')';
							});

						//position legend as far right as possible within the total width
						chart.base.attr('transform', 'translate(' + (info.containerW - info.marginRight - legendWidth) + ',' + info.marginTop + ')');
					}


					// onEnter fn will take two args
					// chart  # refer to this context, used it to access xScale, yScale, width, height, etc. chart property
					// this   # refer to each individual group just appended by insert command
					if(chart.onEnter) { chart.onEnter(chart, this); }
				},

				'exit': function() {
					this.remove();
				}
			}
		});
	}
});
