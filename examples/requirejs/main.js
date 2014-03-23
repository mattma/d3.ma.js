// Filename: main.js

// Require.js allows us to configure shortcut alias
// There usage will become more apparent further along in the tutorial.
require.config({
	paths: {
		'd3': '../../libs/d3.v3',
		'd3ma': '../../build/d3.ma',
	},

	shim: {
		d3ma: {
			deps : ['d3']
		}
	}
});

require([
	// Load our app module and pass it to our definition function
	'd3', 'd3ma'
], function(d3, d3ma){
	console.log('d3.version: ', d3.version);
	console.log('d3ma.version: ', d3ma.version);
	console.log('d3.chart: ', typeof d3.chart);
	var data = [
		{
			"label" : "A" ,
			"value" : 29.765957771107
		} ,
		{
			"label" : "B" ,
			"value" : 0
		} ,
		{
			"label" : "C" ,
			"value" : 32.807804682612
		} ,
		{
			"label" : "D" ,
			"value" : 196.45946739256
		} ,
		{
			"label" : "E" ,
			"value" : 0.19434030906893
		} ,
		{
			"label" : "F" ,
			"value" : 98.079782601442
		} ,
		{
			"label" : "G" ,
			"value" : 13.925743130903
		} ,
		{
			"label" : "H" ,
			"value" : 5.1387322875705
		},
		{
			"label" : "I" ,
			"value" : 19.138723423
		}
	];
	var data1 = [
		{
			"label" : "A" ,
			"value" : 19
		} ,
		{
			"label" : "B" ,
			"value" : 54
		} ,
		{
			"label" : "C" ,
			"value" : 134
		} ,
		{
			"label" : "D" ,
			"value" : 86
		} ,
		{
			"label" : "E" ,
			"value" : 3
		} ,
		{
			"label" : "F" ,
			"value" : 23
		} ,
		{
			"label" : "G" ,
			"value" : 84
		} ,
		{
			"label" : "H" ,
			"value" : 45
		},
		{
			"label" : "I" ,
			"value" : 96
		}
	];

	function domain(data, context) {
		var xRange = [];
		d3.map(data).forEach(function(index, d) { xRange.push( d.label )  });

		// Setup xScale domain range
		context.xScale.domain(xRange);
		// Setup yScale domain range
		var maxY = Math.round( d3.max( data.map(function(val, ind){ return val.value;  }) ) );
		context.yScale.domain([ 0, maxY ]);
	}

	d3.chart('Axis').extend('MyAxis', {
		onDataBind: function(data, chart){
			var chart = chart || this;
			domain(data, chart);
			chart.yAxis.tickFormat(d3.format(',.1f'));
		}
	});

	d3.chart('Bars').extend('MyBars', {
		onDataBind: function(data, chart) {
			var chart = chart || this;
			domain(data, chart);
		},

		onEnterTransition: function(chart, single) {
			var chart = chart || this,
				color = d3.scale.category10();

			single
				.duration(700)
				.ease('cubic-out')
				.attr({
					'x': function(d, i) { return chart.xScale(d.label); },
					'y': function(d) { return chart.yScale(d.value); },
					'width': function(d) { return chart.xScale.rangeBand() ; },
					'height': function(d) { return chart.height - chart.yScale(d.value); },
					'fill': function(d) { return color(d.value); }
				});
		},

		onDataMouseenter: function(d, i, chart) {
			var chart = chart || this;
			var obj = {
				'value': d.value,
				'pointIndex': i,
				'd': d,
				'event': d3.event,
				'pos': [
					chart.xScale(d.label) + (chart.xScale.rangeBand() / 2),
					chart.yScale(d.value)
				]
			};
			return obj;
		}
	});

	d3.chart("FinalChart", {
		initialize: function(containerInfo) {
			// Used for the clipPath object
			// var clip =  this.mixin("Clip",  this.base);
			// clip.box(300, 600).xy(0, 50);

			var axis =  this.mixin("MyAxis",  this.base.append("g").classed('axisgroup', true), {
				info: containerInfo,
				x: 'ordinal',
				guide: true,
				ticksOnResize: true
			});

			axis
				.xLabel('X Labels', 0, 20 )
				.yLabel('Y Labels', 15, 15);

			// console.log('this: ', this);

			var bars = this.mixin("MyBars", this.base.append('g').classed('bars', true), {
				info: containerInfo,
				x: 'ordinal'
			});


			bars.dispatch.on('d3maSingleWindowResize', function(chart, single){
				var chart = chart || this;

				single.attr({
					'x': function(d, i) { return chart.xScale(d.label); },
					'y': function(d) { return chart.yScale(d.value); },
					'width': function(d) { return chart.xScale.rangeBand() ; },
					'height': function(d) { return chart.height - chart.yScale(d.value); }
				});
			});

			// Handle resize in utils.js
			// convininent methods to recall onResize()
			d3.ma.resize(axis, bars);

			// Tooltip section
			var tooltip = d3.ma.tooltip(this.base);
			bars.dispatch.on('d3maMouseenter', function(e){
				e.pos = [ e.pos[0] + 40, e.pos[1] + 30 ];
				var html = "<div class='tips'>" + e.d.label + "<br><strong>" + e.d.value + "</strong>" + "</div>"
				//tooltip.show([e.pos[0], e.pos[1]], html, d3.ma.$$('#vis'));
				tooltip.show([e.pos[0], e.pos[1]], html);
			});

			bars.dispatch.on('d3maMouseout', function(e){
				tooltip.close();
			});
		}

	});

	var container = d3.ma.container('#vis').margin({left: 50});

	container.box(1400, 600);  //.resize()

	var canvas = container.canvas().chart("FinalChart", container.info() );

	//render it with some data
	canvas.draw(data);

	// exit code need to be there, when data changes, it will auto update the chart
	// d3.select('#vis').on('click', function() {
	// 	data.pop();
	// 	canvas.draw( data );
	// })

	d3.selectAll("button").on("click", function() {
		canvas.draw(data1);
	});
});
