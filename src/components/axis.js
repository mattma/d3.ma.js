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
				guide: true,
				ticksOnResize: true
			});
		}

		// Passing options object as a third argument. Options is required.

	Arguments:
		Attributes
			since it inherit from scale.js, it will have all its private & public attr. Read core/scale.js Arguments section for details

		public attributes:
			guide: Boolean. Optional,  default to false. Draw the grid guides along x, y axis when guide is true
			ticksOnResize: Boolean, Optional, default to false. Redraw the ticks when resize the window based on different ratio
			xAxis, yAxis   ( # could use to override its default value, like defined ticks(), orient(), etc. )
			xAxisG, yAxisG ( # could use to defined custom element attributes )

		Note:  currently, xGuide, yGuide is remaining as private object, if needed, it could expose out to the api

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

		this.yAxis = d3.svg.axis().scale(this.yScale).orient('left');

		if(this.guide) {
			this.xAxis
				.tickPadding(5)
				.tickSize(-this.height, 0, 6); //axis.tickSize([major[​[, minor], end]])

			this.yAxis
				.tickPadding(5)
				.tickSize(-this.width, 0, 6);
		}

		this.xAxisG =  this.base.append('g');

		this.xAxisG.attr({
			'class': 'x axis'
			//'transform': 'translate(0,' + this.height + ')'
		});

		this.xPos();

		this.yAxisG = this.base.append('g');

		this.yAxisG.attr({
			'class': 'y axis'
		});

		this.yPos();
	},

	transform: function(data) {
		//Acutally draw the xAxis, yAxis on the screen
		if(this.onDataBind) { this.onDataBind(data); }

		this.xAxisG.call( this.xAxis);
		this.yAxisG.call( this.yAxis);

		this._onWindowResize(data);

		return data;
	},

	xPos: function(_value) {
		var _value = (_value) ? _value : this.height;

		this.xAxisG.attr({
			'transform': 'translate(0,' + _value + ')'
		});

		return this;
	},

	yPos: function(_value) {
		if(_value) {
			this.yAxisG.attr({
				'transform': 'translate(' + _value  + ' , 0)'
			});
		}
		return this;
	},

	// Update Scale, Box Size, and attr values
	_update: function(_width, _height) {
		this.xAxisG.attr({'transform': 'translate(0,' + _height + ')'});

		if(this.ticksOnResize) this._redrawTicksOnResize();

		this.xAxisG.call( this.xAxis);
		this.yAxisG.call( this.yAxis);
	},

	_redrawTicksOnResize: function() {
		var xScaleRange = this.xScale.range(),
			yScaleRange = this.yScale.range();

		if( this._x !== 'ordinal' ) {
			this.xAxis.ticks(Math.abs(xScaleRange[1] - xScaleRange[0]) / 100);
		}
		if( this._y !== 'ordinal' ) {
			this.yAxis.ticks(Math.abs(yScaleRange[1] - yScaleRange[0]) / 100);
		}
	},

	xLabel: function(_label, leftRightPosition, upDownPosition) {
		var containerInfo = this.info,
			xValue = leftRightPosition + containerInfo.marginLeft,
			yValue = upDownPosition - containerInfo.marginBottom;

		this.xAxisG.append('text').classed('label', true).attr({
			'x': xValue || containerInfo.marginLeft - 15, // control left and right of the label
			'y': yValue || 0, // control up and down of the label
			'transform': 'translate(' + this.info.marginLeft+ ',' + this.info.marginBottom + ')'
		}).text(_label);

		return this;
	},

	yLabel: function(_label, upDownPosition, leftRightPosition) {
		var containerInfo = this.info,
			xValue = (-upDownPosition) + containerInfo.marginTop - 15,
			yValue = Math.abs(leftRightPosition - containerInfo.marginLeft) - 5;

		this.yAxisG.append('text').classed('label', true).attr({
			'x':  xValue || -15, // control up and down of the label
			'y':  yValue || 15,  // control left and right of the label
			'transform':  'rotate(-90) translate(' + (-this.info.marginTop)+ ',' + (-this.info.marginLeft) + ')'
		}).text(_label);

		return this;
	}
});
