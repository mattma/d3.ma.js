define([
	'chai', 'd3', 'd3chart'
], function(Chai, d3, d3chart) {

	var expect = Chai.expect,
		should = Chai.should(),
		d3 = window.d3;

	describe('d3 library', function() {
		it('should be loaded from browser', function(done) {
			var d3version = d3.version;

			console.log('d3 current version: ', d3version);

			d3version.should.not.to.be.null;
			done();
		});
	});
});
