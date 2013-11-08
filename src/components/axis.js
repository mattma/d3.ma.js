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


		When using the y1 flag, all the line, circle or whatever the instance should define the y1 since it is totally optional, ex: y1: 'linear'  this will actually pass to the axis element here to create y1 axis
*/
d3.chart('Base').extend("Axis", {

	initialize: function(options) {
		this.options = options = options || {};

		this.guide = options.guide || false;
		this.ticksOnResize = options.ticksOnResize || false;

		this.xAxis = d3.svg.axis().scale(this.xScale).orient('bottom');

		this.yAxis = d3.svg.axis().scale(this.yScale).orient('left');

		if(this.guide) {
			this.xAxis
				.tickPadding(5)
				.tickSize(-this.height, 0, 6); //axis.tickSize([major[‚Äã[, minor], end]])

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

		this.yPos(null, false);

		if(options.y1) {

			this.y1Axis = d3.svg.axis()
					.scale(this.y1Scale)
					.orient('right')
					.tickPadding(5);

			this.y1AxisG =  this.base.append('g');

			this.y1AxisG.attr({
				'class': 'y1 axis'
			});

			this.yPos(this.width, true);
		}
	},

	transform: function(data) {
		//Acutally draw the xAxis, yAxis on the screen
		if(this.onDataBind) { this.onDataBind(data); }

		this.xAxisG
			.transition()
			.duration(400)
			.ease('cubic-out')
			.call( this.xAxis);

		this.yAxisG
			.transition()
			.duration(400)
			.ease('cubic-out')
			.call( this.yAxis);

		if(this.options.y1) {
			var _w = +(this.base.attr('width'));
			this.yPos( _w, true);

			this.y1AxisG
				.transition()
				.duration(400)
				.ease('cubic-out')
				.call( this.y1Axis );
		}

		// this: it is the chart object itself, does not pass single by any chances
		this._onWindowResize(this);

		return data;
	},

	xPos: function(_value) {
		var _value = (_value) ? _value : this.height;

		this.xAxisG.attr({
			'transform': 'translate(0,' + _value + ')'
		});

		return this;
	},

	yPos: function(_value, y1flag) {
		// _value, by default, it won't translate at all, stay at 0, 0
		if(_value) {
			var yaxisg= (y1flag) ? this.y1AxisG : this.yAxisG;
			yaxisg.attr({
				'transform': 'translate(' + _value  + ' , 0)'
			});
		}
		return this;
	},

	// Update Scale, Box Size, and attr values
	_update: function( _width, _height, chart ) {
		if(this.update) {
			this.update( _width, _height, chart );
		}

		this.xAxisG.attr({'transform': 'translate(0,' + _height + ')'});

		if(this.ticksOnResize) this._redrawTicksOnResize();

		if(this.guide) {
			this.xAxis
				.tickPadding(5)
				.tickSize(-this.height, 0, 6); //axis.tickSize([major[‚Äã[, minor], end]])

			this.yAxis
				.tickPadding(5)
				.tickSize(-this.width, 0, 6);
		}

		this.xAxisG
			.transition()
			.duration(400)
			.ease('cubic-out')
			.call( this.xAxis);

		this.yAxisG
			.transition()
			.duration(400)
			.ease('cubic-out')
			.call( this.yAxis);

		if(this.options.y1) {
			// When dealing with y1 axis resize, the axis is following the max x tick
			// Solution here is: calculate this.xScale() on the max x value. then use that value to be the translate value. Ex:
 			// here is using update, if using _update will override the existing one, regular update() is consistant API like circles, lines, etc.
 			//
			// update: function( _width, _height, chart, single ) {
			// 		var parseDate = d3.time.format('%Y%m%d').parse,
			// 		maxDate = d3.max(moduleSelf.dataset, function(d, i){ return parseDate(d['date']) }),
			// 		mxXTick = chart.xScale(maxDate);
			// 		this.y1AxisG.attr('transform', 'translate(' + mxXTick  + ' , 0)');
			// 	}

			this.y1AxisG
				.transition()
				.duration(400)
				.ease('cubic-out')
				.call( this.y1Axis.orient('right') );
		}
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
		})
			.style('opacity', 1e-6)
			.text(_label)
				.transition()
				.duration(1000)
				.ease('cubic-out')
				.style('opacity', 1);

		return this;
	},

	// The way to position the axis is super tricky here
	// leftRightPosition: control the left and right position value, actually modify the y value
	// upDownPosition: control the top and down position value, actually modify the x value
	// with some logic when switch y and y1, we could pass all positive number and ignore the negative value
	// Ex:
	// y example:   chart.yLabel(moduleSelf.key1, 20, 130);
	// y1 example: chart.yLabel(moduleSelf.key2, 5, 155, true);
	// The 4th arg for taking care of the y1 as a flag
	yLabel: function(_label, leftRightPosition, upDownPosition, y1flag) {
		var containerInfo = this.info;
			// this is the old xValue and yValue automation. forget what I thought on this implementation
			// xValue = (-upDownPosition) + containerInfo.marginTop - 15,
			// yValue = Math.abs(leftRightPosition - containerInfo.marginLeft) - 5;

		var yaxisg= (y1flag) ? this.y1AxisG : this.yAxisG,
			upDownVal =  (y1flag) ? upDownPosition : -(upDownPosition),
			rotateVal = (y1flag) ? -270 : -90;

		yaxisg.append('text').classed('label', true).attr({
			'x':  upDownVal || -15, // control up and down of the label
			'y':  leftRightPosition || 15,  // control left and right of the label
			'transform':  'rotate(' + rotateVal + ') translate(' + (-this.info.marginTop)+ ',' + (-this.info.marginLeft) + ')'
			//'transform':  'rotate(' + rotateVal + ') translate(' + (-this.info.marginTop)+ ',' + (-this.info.marginLeft) + ')'
		})
			.style('opacity', 1e-6)
			.text(_label)
				.transition()
				.duration(800)
				.ease('cubic-out')
				.style('opacity', 1);

		return this;
	}
});
