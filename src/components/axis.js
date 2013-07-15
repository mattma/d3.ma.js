/*
	E.G.
		var axis =  this.mixin("Axis",  guideLineG, {
			x: 'ordinal',
			y: 'log',
			width: this.base.attr('width'),
			height: this.base.attr('height'),
			guide: true
		});

		Passing options object as a third argument. take x or y as a key, value should be
		a string representation of scale value, default value is linear, everything will override the default

		guide key, is a boolean value, default to false. If you want to draw the guides, just need to setup
		guide key to true.

		onDataBind fn is actually handling the custom dataBind value to each individual group
 */
d3.chart('Scale').extend("Axis", {

	initialize: function(options) {
		options = options || {};

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
	}
});
