/*
	For reusable components. it could be mixed into any chart modules. quickly mask out a portion of the view.

	Generated Markup:
		<defs>
			<clipPath id='clip-342'>
				<rect width="0" height="0" x='0' y='0' />
			</clipPath>
		</defs>

	Usage:
		<g clip-path="url(#clip-342)">

	Initalization:
		var clip =  this.mixin("Clip",  this.base);
		clip.box(600, 500).xy(400, 50);

		var barsG = this.base.append("g").classed('bars', true).attr({
			'width': this.base.attr('width'),
			'height': this.base.attr('height'),
	            'clip-path': clip.url()
		});

	APIs:
		public attributes:   width, height, x, y, clipPath(current clipPath element), rect (current rect element), cid ( clipPath element id attribute)

		clippath.id()
		# setter/getter clipPath element id attribute

		clippath.url()
		# getter  quickly return 'url(clip-342)' type of vlaue to use in clip-path attribute ready format e.g  clippath.url()

		clippath.box()
		# setter/getter rect element width value and height value

		clippath.xy()
		# setter/getter rect element x and y coordinates attribute
 */

d3.chart('Clip', {
	initialize: function() {

		var defs = this.base.append('defs'),
			random = Math.floor(Math.random() * 1000);//Create semi-unique ID

		this.width = this.base.attr('width') || 0;
		this.height = this.base.attr('height') || 0;
		this.x = 0;
		this.y = 0;

		this.clipPath = defs.append('clipPath');
		this.rect = this.clipPath.append('rect');
		this.cid = 'clip-' + random;

		// clipPath need to have a custom id
		this.clipPath.attr('id', this.cid);
		this.rect.attr({
			'width': this.width,
			'height': this.height,
			'x': this.x,
			'y': this.y
		});
	},

	// Setter/Getter for the custom id string
	id: function(_id) {
		if (arguments.length === 0) { return this.cid; }
		this.cid = _id;
		this.clipPath.attr('id', _id);
		return this;
	},

	// This is a getter fn ONLY, quick retrieve the id
	// output it in the clip-path: 'url(#clip-342)' fashion
	// url(#clip-342) is the return value
	url: function() {
		return 'url(#'+this.id()+')';
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
