define([
	'chai', 'd3', 'd3chart', 'd3ma'
], function(Chai, d3, d3chart, d3ma) {

	// Test 1, check d3 library is loaded
	// Test 2, check d3.chart library is loaded
	// Test 3, check d3.ma library is loaded

	var expect = Chai.expect,
		should = Chai.should();

	describe('d3 library', function() {
		it('should be loaded from browser', function(done) {
			var d3version = d3.version;

			console.log('d3 version: ', d3version);

			d3version.should.not.to.be.null;
			done();
		});
	});

	describe('d3.chart library', function() {
		it('should be loaded from browser', function(done) {
			var d3chartObject = typeof d3chart;

			d3chartObject.should.not.to.be.undefined;
			done();
		});
	});

	describe('d3.ma library', function() {
		it('should be loaded from browser', function(done) {
			var d3maVersion = d3ma.version;

			console.log('d3.ma version: ', d3maVersion);

			d3maVersion.should.not.to.be.null;
			done();
		});
	});
});
