define([
	'chai', 'd3', 'd3chart', 'd3ma'
], function(Chai, d3, d3chart, d3ma) {

	var expect = Chai.expect,
		should = Chai.should();

	describe('d3.ma base - core/base.js', function() {
		beforeEach(function(done){
			div = document.createElement('div');
			var vis = document.body.appendChild(div);
			vis.id='vis';

			var visContainer = d3.ma.container('#vis').box(1400, 600);

			var scaleChart = d3.chart('TestBase', {
				initialize: function(containerInfo) {
					bars = this.mixin('Bars', d3.select('.canvas').append('g'), {
						info: containerInfo,
						x: 'ordinal',
						y: 'log',
						width: this.base.attr('width'),  // optional
						height: this.base.attr('height')  // optional
					});

					testDefault =  this.mixin('Bars', d3.select('.canvas').append('g'), {
						info: containerInfo
					});
				}
			});

			visContainer.canvas().chart('TestBase', visContainer.info() );

			done();
		});

		afterEach(function(done){
			document.body.removeChild(div);
			done();
		});

		it('should have public keys property', function(done){
			//var barKeys = d3.keys(bars);
			bars.should.contain.keys(['w', 'h', 'box' ]);
			done();
		});
	});
});
