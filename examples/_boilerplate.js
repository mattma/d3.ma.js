d3.chart('FinalChart', {
	initialize: function(containerInfo) {

		var axis =  this.mixin('Axis',  guideLineG, {
			info: containerInfo, // required
			x: 'ordinal',
			y: 'log',
			width: this.base.attr('width'),  // optional
			height: this.base.attr('height'),  // optional
			guide: true,
			ticksOnResize: true
		});

	}
});

//Snippet to rebuild the data
cleanupData: function(data) {
	return data.map(function(d) {
		return {
			x: d.x,
			y: d.y
		};
	});
}
