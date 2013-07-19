/*
	by default, the line is expect the data like this structure { x: 0.3434, y: 0.3242}
	but if the object data is rather different like { z: 0.3434, y: 0.3242}


	var line = this.mixin("Line", this.base.append('g').classed('lines', true), {
		info: containerInfo
	});

	line.line.x(function(d){
		return line.xScale(d.z);
	});

	Use this.line # this will be replaced with its current context like line here.
	context.xScale will access the this.xScale here.

	class:  dot

	this.path leave in transform, so that it could be extended by Area chart
 */
d3.chart('Base').extend('Line', {

	initialize: function(options) {
		options = options || {};

		var self = this;

		this.line = d3.svg.line();

		this.line
			.x(function(d) { return self.xScale(d.x); })
			.y(function(d) { return self.yScale(d.y);  });

		return this;
	},

	transform: function(data) {

		var self = this;

		this.linePath = this.base.append('path').attr({
			'class': 'line',
		});

		if(this.onDataBind) { this.onDataBind(); }

		this.linePath.datum(data).attr('d', this.line);

		this.dispatch.on('d3maOnWindowResize', function(e){
			self._redraw(e);
		});

		this.dispatch.on('d3maOffWindowResize', function(e){
			self._unbind(e);
		});

		return data;
	},

	_update: function(_width, _height) {
		this.xScale.range([0, _width]);
		this.yScale.range([_height, 0]);
		this.box(_width, _height);

		this.linePath.attr({
			'd': this.line
		});
	},

	_redraw: function(e) {
		var _width = e.width - this.info.marginLeft - this.info.marginRight;
		this._update(_width, e.height);
	},

	_unbind: function(e) {
		// find out the current width of line g container. convert it to number
		var currentWidth = +(this.base.attr('width'));
		if( currentWidth !== this.info.canvasW)  {
			console.log('fire once');
			this._update(this.info.canvasW, this.info.canvasH);
		}
	}
});
