define([
	'chai', 'd3', 'd3chart', 'd3ma'
], function(Chai, d3, d3chart, d3ma) {

	var expect = Chai.expect,
		should = Chai.should(),
		box,
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

				container = d3.ma.container('#vis').margin({top: 80, left: 80}).box(1400, 600);
				box = container.box();
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

			it('should have a defs and a clippath elements inside svg element', function(done){
				vis.getElementsByTagName('defs').should.not.to.be.empty;
				vis.getElementsByTagName('clipPath').should.not.to.be.empty;
				done();
			});

			it('should have a g element with class canvas, as a child of the svg element', function(done){
				vis.getElementsByClassName('canvas').should.not.to.be.empty;
				done();
			});
		});
	});
});
