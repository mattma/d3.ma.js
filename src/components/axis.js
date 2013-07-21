/*
	it will draw the x axis and y axis for the chart. optionally, it could draw the grid guides along the x and y axis.

	Initalization:
		initialize: function(containerInfo) {
			var axis =  this.mixin("Axis",  guideLineG, {
				info: containerInfo,
				x: 'ordinal',
				y: 'log',
				width: this.base.attr('width'),  // optional
				height: this.base.attr('height'),  // optional
				guide: true
			});
		}

		// Passing options object as a third argument. Options is required.

	Arguments:
		private atrribute:
			x & y:  scale representation for the x axis and y axis. take x or y as a key, value should be a string representation of scale value, default value is linear, everything will override the default

			Note: x, y could only be set by the initialization fn, option objects.

		public attributes:
			width, height,  (# container width and height values.)
			xScale, yScale (# scale fn on the x & y axis. )
			info  (# graph info about the details of this graph include width and height)

			guide: Boolean. Optional,  default to false. Draw the grid guides along x, y axis when guide is true
			ticksOnResize: Boolean, Optional, default to false. Redraw the ticks when resize the window
			xAxis, yAxis   ( # could use to override its default value, like defined ticks(), orient(), etc. )
			xAxisG, yAxisG ( # could use to defined custom element attributes )

		Note:  currently, xGuide, yGuide is remaining as private object, if needed, it could expose out to the api

		Note: by default, you do not need to specified width, height value in the third args, it will use the info options for the value, if you want to override the default, you could definied the width and height to override the info value
	APIs:
		onDataBind: function() { }
			# fn is actually handling the custom dataBind value to each individual group

		axis.xLabel(_label, leftRightPosition, upDownPosition)
			# _label:  Required, text will be shown in the label section
			# leftRightPosition: Optional, it will be positive number. move the text on the left and right position
			# upDownPosition: Optional, it will be positive number. move the text on the up and down position

			By default, the text will be translated to margin.left and margin.bottom
			Use  .x .label  selector to style the label

		axis.yLabel(_label, upDownPosition, leftRightPosition) {
			# _label:  Required, text will be shown in the label section
			# upDownPosition: Optional, it will be positive number. move the text on the up and down position
			# leftRightPosition: Optional, it will be positive number. move the text on the left and right position

			By default, the text will be translated to margin.left and margin.top, rotate -90 degrees
			Use  .y .label  selector to style the label
*/
d3.chart('Base').extend("Axis", {

	initialize: function(options) {
		options = options || {};

		this.guide = options.guide || false;
		this.ticksOnResize = options.ticksOnResize || false;

		this.xAxis = d3.svg.axis().scale(this.xScale).orient('bottom');

		this.yAxis = d3.svg.axis().scale(this.yScale).orient('left').ticks(10);

		if(this.guide) {
			this.xAxis
				.tickPadding(5)
				.tickSize(-this.height, 0, 6); //axis.tickSize([major[​[, minor], end]])

			this.yAxis
				.tickPadding(5)
				.tickSize(-this.width, 0, 6);
		}

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

		this._onWindowResize();

		return data;
	},

	// Update Scale, Box Size, and attr values
	_update: function(_width, _height) {
		this._updateScale(_width, _height);

		this.xAxisG.attr({'transform': 'translate(0,' + _height + ')'});

		if(this.ticksOnResize) this._redrawTicksOnResize();

		this.xAxisG.call( this.xAxis);
		this.yAxisG.call( this.yAxis);
	},

	_redrawTicksOnResize: function() {
		this.xAxis.ticks(Math.abs(this.xScale.range()[1] - this.xScale.range()[0]) / 100);
		this.yAxis.ticks(Math.abs(this.yScale.range()[1] - this.yScale.range()[0]) / 100);
	},

	xLabel: function(_label, leftRightPosition, upDownPosition) {
		this.xAxisG.append('text').classed('label', true).attr({
			'x': leftRightPosition || 0, // control left and right of the label
			'y': (-upDownPosition) || 0, // control up and down of the label
			'transform': 'translate(' + this.info.marginLeft+ ',' + this.info.marginBottom + ')'
		}).text(_label);

		return this;
	},

	yLabel: function(_label, upDownPosition, leftRightPosition) {
		this.yAxisG.append('text').classed('label', true).attr({
			'x':  (-upDownPosition) || 0, // control up and down of the label
			'y': leftRightPosition || 10,  // control left and right of the label
			'transform':  'rotate(-90) translate(' + (-this.info.marginTop)+ ',' + (-this.info.marginLeft) + ')'
		}).text(_label);

		return this;
	}
});
