define([
	'chai', 'd3', 'd3chart', 'd3ma'
], function(Chai, d3, d3chart, d3ma) {

	var expect = Chai.expect,
		should = Chai.should(),
		div,
		info,
		bars,
		testDefault;

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
						y: 'log',
						width: this.base.attr('width'),  // optional
						height: this.base.attr('height')  // optional
					});

					testDefault =  this.mixin('Bars', d3.select('.canvas').append('g'), {
						info: containerInfo
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

		it('should have scale public width property with string value', function(done){
			testDefault.width.should.be.a('number');
			bars.width.should.be.a('number');

			var width = bars.info.containerW - bars.info.marginLeft - bars.info.marginRight;
			bars.width.should.be.equal(width);

			done();
		});

		it('should have scale public height property with string value', function(done){
			testDefault.height.should.be.a('number');
			bars.height.should.be.a('number');

			var height = bars.info.containerH - bars.info.marginTop - bars.info.marginBottom;
			bars.height.should.be.equal(height);

			done();
		});

		it('should have scale x property in options, match private _x property with string value', function(done){
			testDefault._x.should.be.a('string');
			bars._x.should.be.a('string');

			// default x value should be 'linear'
			testDefault._x.should.be.equal('linear');
			// can be overrided by passing x value from option
			bars._x.should.be.equal('ordinal');

			done();
		});

		it('should have scale y property in options, match private _y property with string value', function(done){
			testDefault._y.should.be.a('string');
			bars._y.should.be.a('string');

			// default x value should be 'linear'
			testDefault._y.should.be.equal('linear');
			// can be overrided by passing x value from option
			bars._y.should.be.equal('log');

			done();
		});
	});
});
