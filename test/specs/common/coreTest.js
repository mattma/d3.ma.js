define([
	'chai', 'd3', 'd3chart'
], function(Chai, d3, d3chart) {

	var expect = Chai.expect,
		should = Chai.should();

	describe('d3 library', function() {
		it('should be loaded from browser', function(done) {
			var d3version = window.d3.version;

			console.log('d3 current version: ', d3version);

			d3version.should.not.to.be.null;
			done();
		});
	});
});
