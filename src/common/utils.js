/*
	Pull Straight out of nvd3 library
 */
d3.ma.windowSize = function() {
	// Sane defaults
	var size = {width: 640, height: 480};

	// Earlier IE uses Doc.body
	if (document.body && document.body.offsetWidth) {
		size.width = document.body.offsetWidth;
		size.height = document.body.offsetHeight;
	}

	// IE can use depending on mode it is in
	if (document.compatMode=='CSS1Compat' &&
		document.documentElement &&
		document.documentElement.offsetWidth ) {
		size.width = document.documentElement.offsetWidth;
		size.height = document.documentElement.offsetHeight;
	}

	// Most recent browsers use
	if (window.innerWidth && window.innerHeight) {
		size.width = window.innerWidth;
		size.height = window.innerHeight;
	}
	return (size);
};


// Easy way to bind multiple functions to window.onresize
// TODO: give a way to remove a function after its bound, other than removing all of them
d3.ma.onResize = function(fun){
	var oldresize = window.onresize;

	window.onresize = function(e) {
		if (typeof oldresize === 'function') oldresize(e);
		fun(e);
	}
};

/*
http://www.w3.org/TR/SVGTiny12/coords.html#ViewBoxAttribute

 viewBox = "min-x min-y width height" | "none"

 separated by white space and/or a comma, which specify a rectangle in viewport space which must be mapped to the bounds of the viewport established by the given element, taking into account the 'preserveAspectRatio' attribute. If specified, an additional transformation is applied to all descendants of the given element to achieve the specified effect.

 preserveAspectRatio =  ["defer"] <align> [<meet>]

 typically when using the 'viewBox' attribute, it is desirable that the graphics stretch to fit non-uniformly to take up the entire viewport. In other cases, it is desirable that uniform scaling be used for the purposes of preserving the aspect ratio of the graphics.
 */
