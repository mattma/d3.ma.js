d3.chart('Base', {

	initialize: function(options) {

		options = options || {};

		this._width = options.width || this.base.attr('width'),
		this._height = options.height || this.base.attr('height');

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

	width: function(newWidth) {
		if (arguments.length === 0) {
			return this._width;
		}
		this._width = newWidth;
		this.base.attr('width', this._width);
		return this;
	},

	height: function(newHeight) {
		if (arguments.length === 0) {
			return this._height;
		}
		this._height = newHeight;
		this.base.attr('height', this._height);
		return this;
	},

	box: function(_width, _height) {
		if(!arguments.length) {
			return {
				'width': this._width,
				'height': this._height
			};
		}

		// When arguments are more than one, set svg and container width & height
		var h = (_height) ? _height : _width;

		this.width(_width);
		this.height(h);

		return this;
	}
});
