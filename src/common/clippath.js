d3.chart('Clip', {
	initialize: function() {

		var defs = this.base.append('defs'),
			random = Math.floor(Math.random() * 1000);//Create semi-unique ID

		this.width = this.base.attr('width') || 0;
		this.height = this.base.attr('height') || 0;
		this.x = 0;
		this.y = 0;
		this.clipPath = defs.append('clippath');
		this.rect = this.clipPath.append('rect');
		this.cid = 'clippath-' + random;

		// clipPath need to have a custom id
		this.clipPath.attr('id', this.cid);
		this.rect.attr({
			'width': this.width,
			'height': this.height
		});

		// define rect width, height, x, y
	},

	// Setter/Getter for the custom id string
	id: function(_id) {
		if (arguments.length === 0) { return this.cid; }
		this.cid = _id;
		this.clipPath.attr('id', _id);
		return this;
	},

	_width: function(_width) {
		if (arguments.length === 0) { return this.width; }
		this.width = _width;
		this.rect.attr('width', _width);
		return this;
	},

	_height: function(_height) {
		if (arguments.length === 0) { return this.height; }
		this.height = _height;
		this.rect.attr('height', _height);
		return this;
	},

	// Recommanded to use box() to get/set the rect size,
	// rarely use _width() and _height() fn to set individual sizes
	box: function(_width, _height) {
		if (arguments.length === 0) {
			return {
				'width': this.width,
				'height': this.height
			}
		}
		this._width(_width);
		(arguments.length === 1) ?  this._height(_width) :  this._height(_height);
		return this;
	},

	xy: function(_x, _y) {
		if (arguments.length === 0) {
			return {
				x: this.x,
				y: this.y
			}
		}
		this.x = _x;
		this.y = (arguments.length === 1) ?  _x :  _y ;

		this.rect.attr({
			'x': this.x,
			'y': this.y
		});

		return this;
	}
});
