define([
	'chai', 'd3', 'd3chart', 'd3ma'
], function(Chai, d3, d3chart, d3ma) {

	var expect = Chai.expect,
		should = Chai.should(),
		container;

	describe('d3.ma container', function() {
		beforeEach(function(done){
			var div = document.createElement('div');
			var vis = document.body.appendChild(div);
			vis.id='vis';
			container = d3.ma.container('#vis').margin({top: 80, left: 80}).box(1400, 600);
			done();
		});

		it('should have a div#vis dom element', function(done) {
			var vis = document.getElementById('vis');
			vis.should.not.be.null;
			done();
		});
	});
});
