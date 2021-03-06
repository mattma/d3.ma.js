define([
  'chai', 'd3',  'd3ma', 'sinon-chai', 'sinon'
], function(Chai, d3,  d3ma, sinonChai, sinon) {

  // Read sinon-chai doc here
  // http://chaijs.com/plugins/sinon-chai
  //
  var expect = Chai.expect,
    should = Chai.should(),
    bars;

  Chai.use(sinonChai);

  describe('d3.ma base - core/base.js', function() {
    beforeEach(function(done){
      div = document.createElement('div');
      var vis = document.body.appendChild(div);
      vis.id='vis';

      var visContainer = d3ma.container('#vis').box(1400, 600);

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

    it('should have public w, h, box function', function(done){
      //var barKeys = d3.keys(bars);
      bars.w.should.be.an('function');
      bars.h.should.be.an('function');
      bars.box.should.be.an('function');
      done();
    });

    it('should have a w() as a getter/setter', function(done){
      // test getter
      bars.w().should.be.equal( bars.info.canvasW );
      // width property is inherited from scale.js
      bars.width.should.be.equal( bars.info.canvasW );
      // test setter
      bars.w(1000);
      bars.w().should.not.be.equal( bars.info.canvasW );
      bars.w().should.be.equal( 1000 );
      bars.width.should.be.equal( 1000 );
      done();
    });

    it('should have a h() as a getter/setter', function(done){
      // test getter
      bars.h().should.be.equal( bars.info.canvasH );
      // height property is inherited from scale.js
      bars.height.should.be.equal( bars.info.canvasH );
      // test setter
      bars.h(1000);
      bars.h().should.not.be.equal( bars.info.canvasH );
      bars.h().should.be.equal( 1000 );
      bars.height.should.be.equal( 1000 );
      done();
    });

    it('should have a box() as a getter/setter', function(done){
      // test getter
      bars.box().should.be.an('object');
      var obj = {
        width: bars.info.canvasW,
        height: bars.info.canvasH
      };
      bars.box().should.be.eql( obj );
      bars.width.should.be.equal( bars.info.canvasW );
      bars.height.should.be.equal( bars.info.canvasH );

      // test setter with one argument
      bars.box(1000);
      var obj1= {
        width: 1000,
        height: 1000
      };
      bars.box().should.be.eql( obj1 );
      bars.width.should.be.equal( 1000 );
      bars.height.should.be.equal( 1000 );

      // test setter with two argument
      bars.box(1000, 1100);
      var obj2= {
        width: 1000,
        height: 1100
      };
      bars.box().should.be.eql( obj2 );
      bars.width.should.be.equal( 1000 );
      bars.height.should.be.equal( 1100 );

      done();
    });

    it('should have those private functions', function(done){
      // _bindMouseEnterOutEvents
      // _resize
      // _onWindowResize
      // _redraw
      // _unbind
      // _updateScale
      // _update
      bars._bindMouseEnterOutEvents.should.be.an('function');
      bars._resize.should.be.an('function');
      bars._onWindowResize.should.be.an('function');
      bars._redraw.should.be.an('function');
      bars._unbind.should.be.an('function');
      bars._updateScale.should.be.an('function');

      done();
    });

    it('should have those custom events to be dispatched by modules', function(done){
      var customEvents = d3.keys( bars.dispatch );
      customEvents.should.have.length(6);

      customEvents.should.have.been.include('on');
      customEvents.should.have.been.include('d3maMouseenter');
      customEvents.should.have.been.include('d3maMouseout');
      customEvents.should.have.been.include('d3maOnWindowResize');
      customEvents.should.have.been.include('d3maOffWindowResize');
      customEvents.should.have.been.include('d3maSingleWindowResize');
      done();
    });

    // @todo, need to rewrite this test since we change the API, 11/12/13
    // Step 1 _resize() to be triggered by onResize() or custom resize()
    // it('should have a private fn _resize which will be triggered by onResize', function(done){
    //  var spy = sinon.spy( d3ma, 'onResize');
    //  var barsSpy = sinon.spy( bars, '_resize');

    //  d3ma.resize(bars);
    //  spy.should.have.been.calledOnce;

    //  // Only happens when onResize event triggered
    //  window.onresize();
    //  barsSpy.should.have.been.calledOnce;
    //  barsSpy.should.have.been.calledOn( bars );

    //  done();
    // });

    // Step 2 _onWindowResize be triggered by _resize, handled conditionally, need to register this fn
    it('should have a private event d3maOnWindowResize and its handler _redraw', function(done){
      var spy = sinon.spy( bars, '_redraw' );

      // @todo it need to register _onWindowResize event in every single module, to pass the context, and single instance through the function. It may have a better way to handle this.
      bars._onWindowResize(bars, null);
      var obj = { a: 1, b: 2, c: 3};
      bars.dispatch.d3maOnWindowResize(obj);

      spy.should.have.been.calledOnce;

      done();
    });

    // Step 2 _onWindowResize be triggered by _resize, handled conditionally, need to register this fn
    it('should have a private event d3maOffWindowResize and its handler _redraw', function(done){
      var spy = sinon.spy( bars, '_unbind' );

      // @todo it need to register _onWindowResize event in every single module, to pass the context, and single instance through the function. It may have a better way to handle this.
      bars._onWindowResize(bars, null);
      var obj = { a: 1, b: 2, c: 3};
      bars.dispatch.d3maOffWindowResize(obj);

      spy.should.have.been.calledOnce;

      done();
    });
  });
});
