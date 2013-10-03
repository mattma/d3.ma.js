define([
	'chai', 'd3', 'd3chart', 'd3ma'
], function(Chai, d3, d3chart, d3ma) {

	var expect = Chai.expect,
		should = Chai.should(),
		box,
		defaultContainer,
		container;

	describe('d3.ma container', function() {
		describe('default container', function(){
			beforeEach(function(done){
				var div = document.createElement('div');
				var defaultDiv = document.body.appendChild(div);
				defaultDiv.id='default';

				defaultContainer = d3.ma.container('#default');
				box = defaultContainer.box();

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
				var div = document.createElement('div');
				var vis = document.body.appendChild(div);
				vis.id='vis';

				container = d3.ma.container('#vis').margin({top: 80, left: 80}).box(1400, 600);
				box = container.box();
				done();
			});

			it('should have a div#vis dom element', function(done) {
				var vis = document.getElementById('vis');
				vis.should.not.be.null;
				done();
			});

			it('should have a custom container box with exacthg width and height', function(done){
				// acutally width of the vis element
				//var containerBoxWidth = document.getElementById('vis').offsetWidth;

				var d3maBoxW = box.containerWidth;
				var d3maBoxH = box.containerHeight;

				d3maBoxW.should.equal(1400);
				d3maBoxH.should.equal(600);

				done();
			});
		});
	});
});
