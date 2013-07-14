d3.chart('Scale', {

	initialize: function(options) {

		options = options || {};

		var x = options.x || 'linear';
		var y = options.y || 'linear';

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
