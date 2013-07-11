d3.chart('Clip', {
	initialize: function() {
		console.log(this);

		var defs = this.base.append('defs'),
			width = this.base.attr('width'),
			height = this.base.attr('height'),
			random = Math.floor(Math.random() * 1000);//Create semi-unique ID

		this.clipPath = defs.append('clippath');
		this.rect = this.clipPath.append('rect');
		this.cid = 'clippath-' + random;

		// clipPath need to have a custom id
		this.clipPath.attr('id', this.cid);

		// define rect width, height, x, y
	},

	// Setter/Getter for the custom id string
	id: function(_id) {
		if (arguments.length === 0) { return this.cid; }
		this.cid = _id;
		this.clipPath.attr('id', _id);
		return this;
	}
});
