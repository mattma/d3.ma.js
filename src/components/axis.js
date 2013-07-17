/*
	it will draw the x axis and y axis for the chart. optionally, it could draw the grid guides along the x and y axis.

	Initalization:
		var axis =  this.mixin("Axis",  guideLineG, {
			x: 'ordinal',
			y: 'log',
			width: this.base.attr('width'),
			height: this.base.attr('height'),
			guide: true
		});

		// Passing options object as a third argument. Options is required.

	Arguments:
		private atrribute:
			x & y:  scale representation for the x axis and y axis. take x or y as a key, value should be a string representation of scale value, default value is linear, everything will override the default

			Note: x, y could only be set by the initialization fn, option objects.

		public attributes:
			width, height,  ( # axis container width and height values. from scale.js )
			xScale, yScale (# scale fn on the x & y axis. from scale.js)
			guide: Boolean. Optional,  default to false. Draw the grid guides along x, y axis when guide is true
			xAxis, yAxis   ( # could use to override its default value, like defined ticks(), orient(), etc. )
			xAxisG, yAxisG ( # could use to defined custom element attributes )

		Note:  currently, xGuide, yGuide is remaining as private object, if needed, it could expose out to the api

	APIs:
		onDataBind: function() { }
		# fn is actually handling the custom dataBind value to each individual group
*/
d3.chart('Scale').extend("Axis", {

	initialize: function(options) {
		options = options || {};

		console.log('options: ', options);

		this.guide = options.guide || false;

		this.xAxis = d3.svg.axis().scale(this.xScale).orient('bottom');

		this.yAxis = d3.svg.axis().scale(this.yScale).orient('left');

		this.xAxisG =  this.base.append('g').attr({
			'class': 'x axis',
			'transform': 'translate(0,' + this.height + ')'
		});

		this.yAxisG = this.base.append('g').attr({
			'class': 'y axis'
		});
	},

	transform: function(data) {
		//Acutally draw the xAxis, yAxis on the screen
		if(this.onDataBind) { this.onDataBind(); }

		this.xAxisG.call( this.xAxis);
		this.yAxisG.call( this.yAxis);

		if(this.guide) { this._drawGuides(); }

		return data;
	},

	// _drawGuides() is internal fn, will draw the guide lines on the
	// x and y axis. it will be determined by the intialization options
	// operator { guide: true }
	_drawGuides: function() {

		var 	guides = this.base.append('g')
						.attr('class', 'guides'),

			xGuide = d3.select('.guides').append('g')
						.attr('class', 'x guide')
						.attr('transform', 'translate(0,' + this.height + ')'),

			yGuide = d3.select('.guides').append('g')
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

	xLabel: function(_label) {
		this.xAxisG.append('text').classed('label', true).attr({
			// 'x':
			// 'y':
		}).text(_label);

		return this;
	},

	yLabel: function(_label) {
		this.yAxisG.append('text').classed('label', true).attr({
			// 'x':
			// 'y':
		}).text(_label);

		return this;
	}
});


// var rotateYLabel = true;
// var axisLabel = g.selectAll('text').data([axisLabelText || null]);

// axisLabel.exit().remove();

// axisLabel.enter().append('text');

// axisLabel.attr({
// 	'text-anchor': 'middle',
// 	'transform': 'rotate(-90)',
// 	'x': (-scale.range()[0] / 2),
// 	'y': (-Math.max(margin.left,width) + 12)
// });

// axisLabel.text(function(d) { return d });

//<text class="nv-axislabel" text-anchor="middle" transform="rotate(-90)" y="-63" x="-276">Voltage (v) ma</text>
