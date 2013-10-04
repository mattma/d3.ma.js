define([
	'chai', 'd3', 'd3chart', 'd3ma'
], function(Chai, d3, d3chart, d3ma) {

	var expect = Chai.expect,
		should = Chai.should(),
		div,
		info,
		bars;

	describe('d3.ma scale - core/scale.js', function() {
		beforeEach(function(done){
			div = document.createElement('div');
			var vis = document.body.appendChild(div);
			vis.id='vis';

			var visContainer = d3.ma.container('#vis').box(1400, 600);
			info = visContainer.info();

			var scaleChart = d3.chart('TestScale', {
				initialize: function(containerInfo) {
					bars = this.mixin('Bars', d3.select('.canvas').append('g'), {
						info: containerInfo,
						x: 'ordinal',
						width: this.base.attr('width'),  // optional
						height: this.base.attr('height')  // optional
					});
				}
			});

			visContainer.canvas().chart('TestScale', info );

			done();
		});

		afterEach(function(done){
			document.body.removeChild(div);
			done();
		});

		it('should have public keys property', function(done){
			//var barKeys = d3.keys(bars);
			bars.should.contain.keys(['width', 'height', 'info', 'xScale', 'yScale'  ]);
			done();
		});

		it('should have private keys property', function(done){
			bars.should.contain.keys(['_x', '_y']);
			done();
		});

		it('should have private functions', function(done){
			// 3 Private Fn: _scale, _switchXScale,  _switchYScale
			bars._scale.should.be.an('function');
			bars._switchXScale.should.be.an('function');
			bars._switchYScale.should.be.an('function');
			done();
		});
	});
});
