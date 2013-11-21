/*
	Internal use only, never use it for displaying a chart.
	Scale.js is designed to be extended by other file like axis.js and other charts.

	Note:
		Anywhere elses in the app, should not defined any scale fn or init the scale fn, all others should be extended from this file to keep it dry

		options.info is an absolutely required parameter. If it is not present, it will throw an error. To set this option, follow this pattern. E.G.
			d3.chart("FinalChart", {
				initialize: function(containerInfo) {  <= defined containerInfo option obj here.
					var area = this.mixin("Area", this.base.append('g').classed('area', true), {
						info: containerInfo  <= defined containerInfo option obj in the instance level. Required
					});
				}
			});
			var canvas = container.canvas().chart("FinalChart", container.info() ); <= passing obj as 2nd arg when init the canvas

	Arguments:
		private atrribute:
			x & y:  scale representation for the x axis and y axis. take x or y as a key, value should be a string representation of scale value, default value is linear, everything will override the default

			Internally, it transformed from x & y to _x & _y as internal variables

			Note: x, y could only be set by the initialization fn, option objects.

		public attributes:
			width, height,  (# canvas width and height values.)
			info  (# graph info about the details of this graph, canvas related info, svg info)
			xScale, yScale (# scale fn on the x & y axis. it should always be used when dealing with xScale and yScale. cause it only init the scale on x and y once, it won't be changed. The behavoir could be overrided by each individual fn)

		Note: by default, you do not need to specified width, height value in the third args, it will use the info options for the value, if you want to override the default, you could definied the width and height to override the info value

		info arg is absolutely required the param. it is used to figure out the width and height stuffs.

	APIs:  ( defined in the constructor level )
		private api:
			_x, _y (# contain the string representation of scale value. used in base.js _updateScale() )
			_switchXScale(xScaleString, widthValue), _switchYScale(yScaleString, heightValue) (#update the range array when window resize or any time scale updates)
			_scale(scaleString)   (# simply just return a new instance of d3.scale # initialize the scale for this graph, always use it internally, do not override )

	Options
		x & y for scale on x axis and y axis, available scale attribute is
		linear, ordinal, log, pow, sqrt, identity, quantile, quantize, threshold

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

 */
d3.chart('Scale', {

	initialize: function(options) {

		options = options || {};

		if(!options.info){
			throw new Error('Container Info {info: containerInfo} is absolultely required when an instance is created');
		}

		var x = options.x || 'linear';
		var y = options.y || 'linear';

		this._x = x;
		this._y = y;

		this.width = options.width || options.info.canvasW || this.base.attr('width') || 1;
		this.width = +this.width;
		this.height = options.height || options.info.canvasH || this.base.attr('height') || 1;
		this.height = +this.height;

		this.info = options.info;

		// init the scale
		this.xScale = this._scale(x);
		this.yScale = this._scale(y);

		this._switchXScale(x, this.width);
		this._switchYScale(y, this.height, false);

		if(options.y1) {
			var y1 = options.y1 || 'linear';
			this.y1Scale = this._scale(y1);
			// using the same _switchYScale fn, most likely using the same axis
			// if 3rd arg is true, it will switch from this.yScale to this.y1Scale
			this._switchYScale(y1, this.height, true);
		}
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

	_switchYScale: function(y, _height, y1flag) {
		var yscale = (y1flag) ? this.y1Scale : this.yScale;
		switch(y) {
			case 'linear' :
				yscale.range([_height, 15]);
			break;

			case 'ordinal' :
				yscale.rangeRoundBands([_height, 15], 0.1);
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

			case 'time':
				return d3.time.scale();
			break;

			default:
				return d3.scale.linear();
			break;
		}
	}
});
