/*
	E.G:
		var axis =  this.mixin("GuideLine",  guideLineG);

		// .x(), .y() could be chained, here is just for a demo,
		// you have to call ordinal or any other (current only support linear and ordinal) to override the default scale
		// otherwise, it would assume to be 'linear'
		// dev have to always manually call render() fn to draw the axis after you set up the good defaults

		axis.x('ordinal').render();

		//Draw Guides here
		axis.layer("guidline").on("enter", function(t) {
			axis.drawGuides();
		});
 */
d3.chart("Axis", {
	initialize: function() {
				this.width = this.base.attr('width');
		this.height = this.base.attr('height');

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
				// After this.xScale is being called, it will auto set the this._xScale variable
				// console.log(this._xScale);
				this.xScale.rangeRoundBands([0, this.width], 0.1);

				this.yScale.range([this.height, 0]);

		this.xAxis = d3.svg.axis().scale(this.xScale).orient("bottom");

		this.yAxis = d3.svg.axis().scale(this.yScale)
						.orient("left")
						.tickFormat(d3.format(',.1f'));

							this.xAxisG =  this.base.append('g').attr({
							'class': 'x axis',
							'transform': 'translate(0,' + this.height + ')'
				});

				this.yAxisG = this.base.append('g').attr({
							'class': 'y axis'
				});

		this.xGuide = this.base.append("g")
			.attr("class", "guides")
			.attr("transform", "translate(0," + this.height + ")");

		//The last thing that is included in the code to draw the grid lines is the instruction to suppress printing any label for the ticks;
		this.yGuide = this.base.append("g")
			.attr("class", "guides");

		// create a labels layer
		this.layer("guidline", this.base, {
			dataBind: function(data) {
				var chart = this.chart();

				chart.xScale.domain(d3.merge(data).map(function(d) { return d.label }));

						var maxY = Math.round( d3.max( data.map(function(val, ind){ return val.value;  }) ) );
						chart.yScale.domain([ 0, maxY ]);

				return this.selectAll('g').data(data);
			},

			insert: function(){
				return this.append('g');
			},

			events: {
				"enter": function() {
					var chart = this.chart();
					chart.xAxisG.call( chart.xAxis);
					chart.yAxisG.call( chart.yAxis);
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

		this.xGuide.call(
			this.xAxis
				.tickSize(-this.height, 0, 0)
				.tickFormat('')
		);
		//axis.tickSize([major[​[, minor], end]])

		this.yGuide.call(
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
});