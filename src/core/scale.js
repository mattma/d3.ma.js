/*
	Internal use only, never use it for displaying a chart.
	Scale.js is designed to be extended by other file like axis.js and other charts.

	Note: Anywhere elses in the app, should not defined any scale fn or init the scale fn, all others should be extended from this file to keep it dry

	Arguments:
		private atrribute:
			x & y:  scale representation for the x axis and y axis. take x or y as a key, value should be a string representation of scale value, default value is linear, everything will override the default

			Note: x, y could only be set by the initialization fn, option objects.

		public attributes:
			width, height,  (# container width and height values.)
			xScale, yScale (# scale fn on the x & y axis. )
			info  (# graph info about the details of this graph include width and height)

		Note: by default, you do not need to specified width, height value in the third args, it will use the info options for the value, if you want to override the default, you could definied the width and height to override the info value

		info arg is absolutely required the param. it is used to figure out the width and height stuffs.

	Example:
		var container = d3.ma.container('#vis');
		container.resize().box(1400, 600);

		// Important, to pass the container.info() as a 2nd param
		var canvas = container.canvas().chart("FinalChart", container.info() ); // <= this is the ABSOLUTELY required setup
		canvas.draw(data);

		d3.chart("FinalChart", {

			//important, to pass the option of containerInfo as an obj options
			initialize: function(containerInfo) {  // <= this is the ABSOLUTELY required setup
				var axis =  this.mixin("MyAxis",  this.base.append("g").classed('axisgroup', true), {
					info: containerInfo,   // <= this is the ABSOLUTELY required setup
					x: 'ordinal',
					guide: true
				});

				var bars = this.mixin("MyBars", this.base.append('g').classed('bars', true), {
					info: containerInfo,  // <= this is the ABSOLUTELY required setup
					x: 'ordinal'
				});
			}
		});

	APIs:  ( defined in the constructor level )
		private api:
			_scale(scale)   # simply just return a new instance of d3.scale

	Options
		x & y for scale on x axis and y axis, available scale attribute is
		linear, ordinal, log, pow, sqrt, identity, quantile, quantize, threshold
 */
d3.chart('Scale', {

	initialize: function(options) {

		options = options || {};

		var x = options.x || 'linear';
		var y = options.y || 'linear';

		this.width = options.width || options.info.canvasW || this.base.attr('width') || 1;
		this.height = options.height || options.info.canvasH || this.base.attr('height') || 1;
		this.info = options.info;

		// init the scale
		this.xScale = this._scale(x);
		this.yScale = this._scale(y);

		// switch(x) {
		// 	case 'linear' :
		// 		this.xScale.range([0, this.width]);
		// 	break;

		// 	case 'ordinal' :
		// 		this.xScale.rangeRoundBands([0, this.width], 0.1);
		// 	break;
		// }
		this._switchXScale(x, this.width);
		this._switchYScale(y, this.height);
	},

	_switchXScale: function(x, _width) {
		switch(x) {
			case 'linear' :
				this.xScale.range([0, _width]);
			break;

			case 'ordinal' :
				this.xScale.rangeRoundBands([0, _width], 0.1);
			break;
		}
	},

	_switchYScale: function(y, _height) {
		switch(y) {
			case 'linear' :
				this.yScale.range([_height, 0]);
			break;

			case 'ordinal' :
				this.yScale.rangeRoundBands([_height, 0], 0.1);
			break;
		}
	},

	_scale: function(scale) {
		switch(scale) {
			case 'linear':
				return d3.scale.linear();
			break;

			case 'ordinal':
				return d3.scale.ordinal();
			break;

			case 'log':
				return d3.scale.log();
			break;

			case 'pow':
				return d3.scale.pow();
			break;

			case 'sqrt':
				return d3.scale.sqrt();
			break;

			case 'identity':
				return d3.scale.identity();
			break;

			case 'quantile':
				return d3.scale.quantile();
			break;

			case 'quantize':
				return d3.scale.quantize();
			break;

			case 'threshold':
				return d3.scale.threshold();
			break;

			default:
				return d3.scale.linear();
			break;
		}
	}
});
