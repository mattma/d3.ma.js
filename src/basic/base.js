/*
	Base is extended from Scale
	it will auto gain the four variables: this.xScale, this.yScale, this.width, this.height

	That means, when create an instance of base, or other basic charts or complext charts.

	It all have options object need to be defined in the initialization phrase.

	e.g.  var chart =  this.mixin('Base',  axisG, {
			x: 'ordinal',
			y: 'log',
			width: this.base.attr('width'),
			height: this.base.attr('height')
		});

	By default, API provides three methods:

	this.box() to set/get the container width value and height value
	this.w()  to set/get the container width value
	this.h()  to set/get the container height value
 */
d3.chart('Scale').extend('Base', {

	initialize: function(options) {

		options = options || {};

		this.box(this.width, this.height);

		this.dispatch = d3.dispatch('d3maMouseover', 'd3maMouseout');

		// create a layer of circles that will go into
		// a new group element on the base of the chart
		// this.layer('base', this.base, {

		// 	// select the elements we wish to bind to and
		// 	// bind the data to them.
		// 	dataBind: function(data) {
		// 		var chart = this.chart();
		// 		if(chart.onData) { chart.onData(); }
		// 		return this.selectAll("g").data(data);
		// 	},

		// 	// insert actual bars
		// 	insert: function() {
		// 		var chart = this.chart();
		// 		if(chart.onInsert) { chart.onInsert(); }
		// 		return this.append('g');
		// 	},

		// 	// define lifecycle events
		// 	events: {
		// 		'enter': function() {
		// 			var chart = this.chart();

		// 			if(chart.onEnter) { chart.onEnter(); }

		// 			this.on('mouseover', function(d, i){
		// 				d3.select(this).classed('hover', true);
		// 				var obj = {
		// 					'value': d.value,
		// 					'pointIndex': i,
		// 					'd': d,
		// 					'event': d3.event,
		// 					'pos': [
		// 						chart.xScale(d.label) + (chart.xScale.rangeBand() / 2),
		// 						chart.yScale(d.value)
		// 					]
		// 				};

		// 				chart.dispatch.d3maMouseover(obj);
		// 			});

		// 			this.on('mouseout', function(d, i){
		// 				d3.select(this).classed('hover', false);
		// 				var obj = {
		// 					'value': d.value,
		// 					'pointIndex': i,
		// 					'd': d,
		// 					'event': d3.event,
		// 					'pos': [
		// 						chart.xScale(d.label) + chart.xScale.rangeBand() / 2,
		// 						chart.yScale(d.value)
		// 					]
		// 				};

		// 				chart.dispatch.d3maMouseout(obj);
		// 			});
		// 		},

		// 		'enter:transition': function() {
		// 			var chart = this.chart();
		// 			return this
		// 				.duration(1000)
		// 				.attr({
		// 					'fill-opacity': 0.8
		// 				})
		// 		}
		// 	}
		// });
	},

	w: function(_width) {
		if (arguments.length === 0) {
			return this.width;
		}
		this.width = _width;
		this.base.attr('width', this.width);
		return this;
	},

	h: function(_height) {
		if (arguments.length === 0) {
			return this.height;
		}
		this.height = _height;
		this.base.attr('height', this.height);
		return this;
	},

	box: function(_width, _height) {
		if(!arguments.length) {
			return {
				'width': this.width,
				'height': this.height
			};
		}

		this.w(_width);
		this.h((_height) ? _height : _width);

		return this;
	}
});
