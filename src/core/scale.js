/*
	Scale.js is designed to be extended by other file like axis.js and other charts
	Whenever this file will be included in the other files,
	it will auto gain the access or variables like

	this.width  #container width attr value
	this.height #container height attr value
	this.xScale  # scale fn on the x axis
	this.yScale  # scale fn on the y axis

	Anywhere else in the app, should not defined any scale fn or init the scale fn,
	all others should be extended from this file to keep it dry
 */
d3.chart('Scale', {

	initialize: function(options) {

		options = options || {};

		var x = options.x || 'linear';
		var y = options.y || 'linear';

		this.width = options.width || this.base.attr('width') || 1;
		this.height = options.height || this.base.attr('height') || 1;

		// init the scale
		this.xScale = this._scale(x);
		this.yScale = this._scale(y);

		switch(x) {
			case 'linear' :
				this.xScale.range([0, this.width]);
			break;

			case 'ordinal' :
				this.xScale.rangeRoundBands([0, this.width], 0.1);
			break;
		}

		switch(y) {
			case 'linear' :
				this.yScale.range([this.height, 0]);
			break;

			case 'ordinal' :
				this.yScale.rangeRoundBands([this.height, 0], 0.1);
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

			default:
				return d3.scale.linear();
			break;
		}
	}
});
