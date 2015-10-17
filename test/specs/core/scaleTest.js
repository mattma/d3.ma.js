define([
  'chai', 'd3', 'd3ma'
], function(Chai, d3,  d3ma) {

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

      var visContainer = d3ma.container('#vis').box(1400, 600);
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

    it('should have a private fn called _scale and return a function', function(done){
      // _scale itself is a function,
      // when calling it, also return another d3.scale function
      bars._scale('linear').should.be.a('function');
      done();
    });

    it('should have a private fn called _switchXScale and return a range', function(done){
      // _switchXScale called at intialization. Need to check the default range value
      //
      // testDefault has x-scale: 'linear', can be tested with range()
      testDefault.xScale.range().should.be.an('array');
      testDefault.xScale.range().should.be.eql([0, testDefault.info.canvasW]);
      // override the xScale with custom width, handle internally, should not call directly
      testDefault._switchXScale('linear', 1000);
      testDefault.xScale.range().should.be.eql([0, 1000]);

      // bars has x-scale: 'ordinal', can be tested with rangeRounds()
      bars.xScale.rangeExtent().should.be.an('array');
      bars.xScale.rangeExtent().should.be.eql([0, testDefault.info.canvasW]);
      done();
    });

    it('should have a private fn called _switchYScale and return a range', function(done){
      // _switchXScale called at intialization. Need to check the default range value
      //
      // testDefault has y-scale: 'linear', can be tested with range()
      testDefault.yScale.range().should.be.an('array');
      testDefault.yScale.range().should.be.eql([testDefault.info.canvasH, 15]);
      // override the yScale with custom width, handle internally, should not call directly
      testDefault._switchYScale('linear', 1000);
      testDefault.yScale.range().should.be.eql([1000, 15]);

      // bars has y-scale: 'log', can be tested with rangeRounds()
      bars.yScale.range().should.be.an('array');
      //bars.yScale.range().should.be.eql([testDefault.info.canvasH, 0]);
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

    it('should have scale public info property with string value', function(done){
      bars.info.should.be.exist;
      bars.info.should.be.an('object');
      bars.info.should.have.keys(['marginTop', 'marginRight', 'marginBottom', 'marginLeft', 'containerW', 'containerH', 'canvasW', 'canvasH', 'id', 'cid', 'parentNode']);
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
