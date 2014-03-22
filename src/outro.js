	if (typeof define === "function" && define.amd) {
		define(d3ma);
	} else if (typeof module === "object" && module.exports) {
		module.exports = d3ma;
	} else {
		this.d3ma = d3ma;
	}
}();
