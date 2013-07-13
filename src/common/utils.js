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


// by default, element is going to  document
// selector could be any string
// modified implementation from zepto.js library
d3.ma.$ = function(selector, element) {

	var found,
		element = element || document,
		slice = Array.prototype.slice,
		classSelectorRE = /^\.([\w-]+)$/,
		tagSelectorRE = /^[\w-]+$/,
		idSelectorRE = /^#([\w-]*)$/;

	function isDocument(obj)   {
		return obj != null && obj.nodeType == obj.DOCUMENT_NODE;
	}

	return (isDocument(element) && idSelectorRE.test(selector)) ?
		( (found = element.getElementById(RegExp.$1)) ? [found] : [] ) :
		(element.nodeType !== 1 && element.nodeType !== 9) ? [] :
		slice.call(
			classSelectorRE.test(selector) ? element.getElementsByClassName(RegExp.$1) :
			tagSelectorRE.test(selector) ? element.getElementsByTagName(selector) :
			element.querySelectorAll(selector)
		);
};

// Always return the first index of the array
// for example, if using id selection, the element would be returned.
// so it is usefully when dealing with d3.ma.tooltip(), 3rd arg would expect to have a DOM element
d3.ma.$$ = function(selector, element) {
	var ret = d3.ma.$(selector, element);
	return ret[0];
};


/*
	if init the tooltip, pass the this.base context,
	when call show(), do not need to pass parentContainer, cause it will set itself
	E.G  var tooltip = d3.ma.tooltip(this.base);

	otherwise, when call show(), it will need to pass at least 3 args to set up the tooltips
	E.G  tooltip.show([e.pos[0], e.pos[1]], html, d3.ma.$$('#vis'));
 */

d3.ma.tooltip = function(context) {
	var tooltip = {},
		context = context || tooltip;

	tooltip.show = function(pos, content, parentContainer, classes){

		var tooltipContainer = document.createElement('div');

		tooltipContainer.className = 'd3maTooltip ' +  (classes ? classes : '');

		var body = parentContainer || document.getElementsByTagName('body')[0];

		if(tooltip !== context) {
			body = context[0][0].parentNode.parentElement;
		}

		tooltipContainer.innerHTML = content;
		tooltipContainer.style.left = 0;
		tooltipContainer.style.top = 0;
		tooltipContainer.style.opacity = 0;

		body.appendChild(tooltipContainer);

		// var height = parseInt(tooltipContainer.offsetHeight),
		// 	width = parseInt(tooltipContainer.offsetWidth),
		// 	windowWidth = d3.ma.windowSize().width,
		// 	windowHeight = d3.ma.windowSize().height,
		// 	scrollTop = window.scrollY,
		// 	scrollLeft = window.scrollX,

		var left = pos[0],
			top = pos[1];

		// windowHeight = window.innerWidth >= document.body.scrollWidth ? windowHeight : windowHeight - 16;
		// windowWidth = window.innerHeight >= document.body.scrollHeight ? windowWidth : windowWidth - 16;

		tooltipContainer.style.left = left+'px';
		tooltipContainer.style.top = top+'px';
		tooltipContainer.style.opacity = 1;
		tooltipContainer.style.position = 'absolute'; //fix scroll bar issue
		tooltipContainer.style.pointerEvents = 'none'; //fix scroll bar issue

		// d3.select('.d3maTooltip')
		// 	.transition()
		// 	.duration(200)
		// 	.style('opacity', 1);

		return tooltip;
	};

	tooltip.close = function(){
		var tooltips = document.getElementsByClassName('d3maTooltip');
		var purging = [];
		while(tooltips.length) {
			purging.push(tooltips[0]);
			tooltips[0].style.transitionDelay = '0 !important';
			tooltips[0].style.opacity = 0;
			tooltips[0].className = 'd3maTooltip-pending-removal';
		}

		setTimeout(function() {
			while (purging.length) {
				var removeMe = purging.pop();
				removeMe.parentNode.removeChild(removeMe);
			}
		}, 500);

		return tooltip;
	};


	//var dispatch = d3.dispatch('tooltipShow', 'tooltipHide')

	return tooltip;
};

// TODO: Implement zoom feature here
d3.ma.zoom = function() {
	var zoom = {};

	return zoom;
};
