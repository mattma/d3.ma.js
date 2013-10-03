define([
	'chai', 'd3', 'd3chart', 'd3ma'
], function(Chai, d3, d3chart, d3ma) {

	var expect = Chai.expect,
		should = Chai.should(),
		box,
		info,
		div,
		defaultContainer,
		container;

	describe('d3.ma container', function() {
		describe('default container', function(){
			beforeEach(function(done){
				div = document.createElement('div');
				var defaultDiv = document.body.appendChild(div);
				defaultDiv.id='default';

				defaultContainer = d3.ma.container('#default').box(960, 540);
				box = defaultContainer.box();

				done();
			});

			afterEach(function(done){
				document.body.removeChild(div);
				done();
			});

			it('should have a div#default dom element', function(done) {
				var defaultDiv = document.getElementById('default');
				defaultDiv.should.not.be.null;
				done();
			});

			it('should have a default container box with width and height', function(done){
				//var defaultBoxWidth = document.getElementById('default').clientWidth;
				var d3maBoxW = box.containerWidth;
				var d3maBoxH = box.containerHeight;

				d3maBoxW.should.equal(960);
				d3maBoxH.should.equal(540);

				done();
			});
		});

		describe('custom container', function(){
			beforeEach(function(done){
				div = document.createElement('div');
				var vis = document.body.appendChild(div);
				vis.id='vis';

				container = d3.ma.container('#vis').margin({top: 80, left: 60}).box(1400, 600);
				box = container.box();
				info = container.info();
				done();
			});

			// it need to remove the div on each task, otherwise, it will increase the div size
			afterEach(function(done){
				document.body.removeChild(div);
				done();
			});

			it('should have a div#vis dom element', function(done) {
				var vis = document.getElementById('vis');
				vis.should.not.be.null;
				done();
			});

			it('should have a custom container box with exact width and height', function(done){
				// acutally width of the vis element
				//var containerBoxWidth = document.getElementById('vis').offsetWidth;

				var d3maBoxW = box.containerWidth;
				var d3maBoxH = box.containerHeight;

				d3maBoxW.should.equal(1400);
				d3maBoxH.should.equal(600);

				done();
			});

			it('should have a single svg child element', function(done){
				// check the svg element is there
				vis.getElementsByTagName('svg').should.not.to.be.empty;
				vis.children.length.should.equal(1);
				done();
			});

			it('should have a svg element with the same width and height of its container', function(done){
				var svgWidth = document.querySelector('svg').getAttribute('width');
				var svgHeight = document.querySelector('svg').getAttribute('height');

				parseInt(svgWidth).should.be.equal(box.containerWidth);
				parseInt(svgWidth).should.be.equal(1400);
				parseInt(svgHeight).should.be.equal(box.containerHeight);
				parseInt(svgHeight).should.be.equal(600);
				done();
			});

			it('should have a margin top, bottom, left, right value', function(done){
				info.marginTop.should.equal(80);
				info.marginRight.should.equal(10);
				info.marginBottom.should.equal(20);
				info.marginLeft.should.equal(60);
				done();
			});

			// defs element and clipPath element start from here
			it('should have a defs and a clippath elements inside svg element', function(done){
				vis.getElementsByTagName('defs').should.not.to.be.empty;
				vis.getElementsByTagName('clipPath').should.not.to.be.empty;
				done();
			});

			it('should have a clippath element include rect element with right size', function(done){
				vis.getElementsByTagName('rect').should.not.to.be.empty;
				var rectW = vis.querySelector('rect').getAttribute('width');
				var rectH = vis.querySelector('rect').getAttribute('height');
				parseInt(rectW).should.be.equal(box.containerWidth);
				parseInt(rectW).should.be.equal(1400);
				parseInt(rectH).should.be.equal(box.containerHeight);
				parseInt(rectH).should.be.equal(600);
				done();
			});

			// g.canvas relate tests start from here
			it('should have a g element with class canvas, as a child of the svg element', function(done){
				vis.getElementsByClassName('canvas').should.not.to.be.empty;
				done();
			});

			it('should have a canvas g with generated id attribute', function(done){
				var id = document.querySelector('.canvas').getAttribute('id');
				id.should.not.to.be.null;
				id.indexOf('d3ma-').should.have.above(-1);
				('#'+id).should.have.equal(info.id);
				done();
			});

			it('should have a canvas g with width/height which is the value of container box minus the margins', function(done){
				var w = info.containerW - info.marginLeft - info.marginRight;
				var h = info.containerH - info.marginTop - info.marginBottom;

				var canvasW = document.querySelector('.canvas').getAttribute('width');
				var canvasH = document.querySelector('.canvas').getAttribute('height');

				parseInt(canvasW).should.be.equal(w);
				parseInt(canvasH).should.be.equal(h);
				done();
			});

			it('should have a canvas g with the right transform value', function(done){
				var canvasTrans = document.querySelector('.canvas').getAttribute('transform');
				var transformVal = 'translate(' + info.marginLeft + ',' + info.marginTop + ')';
				canvasTrans.should.have.equal(transformVal);
				done();
			});

			it('should have a canvas g with clip-path attribute', function(done){
				var canvasClip = document.querySelector('.canvas').getAttribute('clip-path');
				var clipVal = 'url(#' + info.cid + ')';
				canvasClip.should.have.equal(canvasClip);
				done();
			});

			// API testing
			// @todo after set the canvasW, need a way to update the info object
			it('should have a setter/getter fn called container.canvasW', function(done){
				container.canvasW.should.be.a('function');
				container.canvasW().should.be.equal( info.canvasW );

				container.canvasW(3000);
				container.canvasW().should.be.equal( 3000 );
				//container.canvasW().should.be.equal( info.canvasW );

				done();
			});

			// @todo after set the canvasH, need a way to update the info object
			it('should have a setter/getter fn called container.canvasH', function(done){
				container.canvasH.should.be.a('function');
				container.canvasH().should.be.equal( info.canvasH );

				container.canvasH(3000);
				container.canvasH().should.be.equal( 3000 );
				//container.canvasH().should.be.equal( info.canvasH );

				done();
			});
		});
	});
});
