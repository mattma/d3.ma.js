/*
	E.G:
		var axis =  this.mixin("GuideLine",  guideLineG);

		// As long as you define, onData, onInsert, onEnter, it would be called in the
		// appropriate section, and auto render the fn for you. You just need to define the fn
		// Need to include the custom behavior to those fn block
		axis.onData = function() { }
		axis.onInsert = function() { }
		axis.onEnter = function() { }

		//Draw Guides here, perfer the first method
		axis.onEnter = function(){
			axis.drawGuides();
		};
		or use :
		axis.layer("guidline").on("enter", function(t) {
			axis.drawGuides();
		});

		// .x(), .y() could be chained, here is just for a demo,
		// you have to call ordinal or any other (current only support linear and ordinal) to override the default scale
		// otherwise, it would assume to be 'linear'
		// dev have to always manually call render() fn to draw the axis after you set up the good defaults

		axis.x('ordinal').render();

		Note: render() is always the last fn to call. Always the last one.
			The goal here, is to define all the chart specified behavior, Once you
			have all the logic in place, call render and simply draw the chart
 */
d3.chart('Axis', {
	initialize: function() {

		this.width = this.base.attr('width') || 1;
		this.height = this.base.attr('height') || 1;

		var self = this;

		// this._x, this._y is the internal state to maintain the current scale in String format
		// by default, it is using linear
		this._x = (this._x) ? this._x : 'linear';
		this._y = (this._y) ? this._y : 'linear';

		// trigger to retrieve the current xScale and yScale
		this.xScale = this.x(this._x, true)._xScale;
		this.yScale = this.y(this._y, true)._yScale;

		// called from this.x() and this.y()
		// when an instance called x() and y(), it will rebuild the context of scale
		// and return the new xScale and yScale
		this.on('xscale', function(scale){
			self.xScale = self._scale(scale);
		});

		this.on('yscale', function(scale){
			self.yScale = self._scale(scale);
		});
	},

	// render() won't call by default, developer has to call it manually in each instance.
	// The reason for that, it will avoid multiple rendering when switch the scale context
	render: function() {

		switch(this._x) {
			case 'linear' :
				this.xScale.range([0, this.width]);
			break;

			case 'ordinal' :
				this.xScale.rangeRoundBands([0, this.width], 0.1);
			break;
		}

		switch(this._y) {
			case 'linear' :
				this.yScale.range([this.height, 0]);
			break;

			case 'ordinal' :
				this.yScale.rangeRoundBands([this.height, 0], 0.1);
			break;
		}

		this.xAxis = d3.svg.axis().scale(this.xScale).orient('bottom');

		this.yAxis = d3.svg.axis().scale(this.yScale).orient("left")

		this.xAxisG =  this.base.append('g').attr({
			'class': 'x axis',
			'transform': 'translate(0,' + this.height + ')'
		});

		this.yAxisG = this.base.append('g').attr({
			'class': 'y axis'
		});

		this.guides = this.base.append('g')
			.attr('class', 'guides');

		// create a labels layer
		this.layer('guidline', this.base, {
			dataBind: function(data) {
				var chart = this.chart();

				// Used onData to override any default behavior for
				// xScale, yScale, xAxis, yAxis etc.
				if(chart.onData) { chart.onData(); }

				return this.select('.guides').selectAll('g').data(data);
			},

			insert: function(){
				var chart = this.chart();
				if(chart.onInsert) { chart.onInsert(); }

				return this.append('g').style('display', 'none');
			},

			events: {
				'enter': function() {
					var chart = this.chart();

					//Acutally draw the xAxis, yAxis on the screen
					chart.xAxisG.call( chart.xAxis);
					chart.yAxisG.call( chart.yAxis);

					// Any additional onEnter behavior
					// would add here,
					// E.G, draw guides fn could be called here
					if(chart.onEnter) { chart.onEnter(); }
				}
			}
		});
	},

	x: function(scale, internal) {
		if (arguments.length === 0) { return this._xScale; }
		this._x = scale;

		// Concept of 2nd arg, internal.
		// default: false;  when an instance called x() and y(), basically outside of the constructor
		// module, it will auto call trigger scale for you. But when use in the internal module, it won't call any
		// trigger scale function since it will set it by default for you. Here is linear scale
		(internal) ? this._xScale = this._scale(scale) : this.trigger('xscale', scale);
		return this;
	},

	y: function(scale, internal) {
		if (arguments.length === 0) { return this._yScale; }
		this._y = scale;
		(internal) ? this._yScale = this._scale(scale) : this.trigger('yscale', scale);
		return this;
	},

	drawGuides: function() {

		var xGuide = d3.select('.guides').append('g')
			.attr('class', 'x guide')
			.attr('transform', 'translate(0,' + this.height + ')');

		//The last thing that is included in the code to draw the grid lines is the instruction to suppress printing any label for the ticks;
		var yGuide = d3.select('.guides').append('g')
			.attr('class', 'y guide');

		xGuide.call(
			this.xAxis
				.tickSize(-this.height, 0, 0)
				.tickFormat('')
		);
		//axis.tickSize([major[​[, minor], end]])

		yGuide.call(
			this.yAxis
				.tickSize(-this.width, 0, 0)
				.tickFormat('')
		);

		return this;
	},

	_scale: function(scale) {
		switch(scale) {
			case 'linear':
				return d3.scale.linear();
			break;

			case 'ordinal':
				return d3.scale.ordinal();
			break;

			default:
				return d3.scale.linear();
			break;
		}
	}

	// _width: function(_width) {
	// 	if (arguments.length === 0) { return this.width; }
	// 	this.width = _width;
	// 	this.attr('width', _width);
	// 	return this;
	// },

	// _height: function(_height) {
	// 	if (arguments.length === 0) { return this.height; }
	// 	this.height = _height;
	// 	this.attr('height', _height);
	// 	return this;
	// },

	// // Recommanded to use box() to get/set the rect size,
	// // rarely use _width() and _height() fn to set individual sizes
	// box: function(_width, _height) {
	// 	if (arguments.length === 0) {
	// 		return {
	// 			'width': this.width,
	// 			'height': this.height
	// 		}
	// 	}
	// 	this._width(_width);
	// 	(arguments.length === 1) ?  this._height(_width) :  this._height(_height);
	// 	return this;
	// }
});
