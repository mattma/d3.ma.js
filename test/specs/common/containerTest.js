define([
	'chai', 'd3',  'd3ma'
], function(Chai, d3,  d3ma) {

	var expect = Chai.expect,
		should = Chai.should(),
		box,
		info,
		div,
		defaultContainer,
		container;

	describe('d3.ma container - common/container.js', function() {
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

		describe('custom container - common/container.js', function(){
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
				id.should.contain('d3ma-');
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
			it('should have a setter/getter fn called container.canvasW', function(done){
				container.canvasW.should.be.a('function');
				container.canvasW().should.be.equal( info.canvasW );

				container.canvasW(3000);
				container.canvasW().should.be.equal( 3000 );
				container.canvasW().should.be.equal( container.info().canvasW );

				done();
			});

			it('should have a setter/getter fn called container.canvasH', function(done){
				container.canvasH.should.be.a('function');
				container.canvasH().should.be.equal( info.canvasH );

				container.canvasH(3000);
				container.canvasH().should.be.equal( 3000 );
				container.canvasH().should.be.equal( container.info().canvasH );

				done();
			});

			it('should have a setter/getter fn called container.margin', function(done){
				// test getter, getter has been tested above
				var margin = container.margin();
				margin.should.be.an('object');
				margin.should.have.keys(['top', 'right', 'bottom', 'left']);

				// test setter
				container.margin({ top: 100, right: 110, bottom: 120, left: 130 });
				var newMargin = container.margin();
				newMargin.top.should.be.equal(100);
				newMargin.right.should.be.equal(110);
				newMargin.bottom.should.be.equal(120);
				newMargin.left.should.be.equal(130);
				done();
			});

			it('should have a setter/getter fn called container.box', function(done){
				// test getter
				var box = container.box();
				box.should.be.an('object');
				box.should.have.keys(['containerWidth', 'containerHeight']);
				box.containerWidth.should.be.equal( info.containerW );
				box.containerHeight.should.be.equal( info.containerH );

				// test setter
				//
				// case 1, only one param is provided
				container.box(100);
				var newBox1 = container.box();
				newBox1.containerWidth.should.be.equal( 100 );
				newBox1.containerHeight.should.be.equal( 100 );

				// case 2, both values have been provided
				container.box(110,120);
				var newBox2 = container.box();
				newBox2.containerWidth.should.be.equal( 110 );
				newBox2.containerHeight.should.be.equal( 120 );
				done();
			});

			it('should have a getter fn called container.info', function(done){
				var info = container.info();
				info.should.be.an('object');
				info.should.have.keys(['marginTop', 'marginRight', 'marginBottom', 'marginLeft', 'containerW', 'containerH', 'canvasW', 'canvasH', 'id', 'cid', 'parentNode']);
				info.marginTop.should.be.a('number');
				info.marginRight.should.be.a('number');
				info.marginBottom.should.be.a('number');
				info.marginLeft.should.be.a('number');
				info.containerW.should.be.a('number');
				info.containerH.should.be.a('number');
				info.canvasW.should.be.a('number');
				info.canvasH.should.be.a('number');
				info.id.should.be.a('string');
				info.cid.should.be.a('string');
				info.parentNode.should.be.a('string');
				info.parentNode.should.be.equal('#vis');
				done();
			});
		});
	});
});
