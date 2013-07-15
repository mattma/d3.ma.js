// Pull Straight out of nvd3 library
// get the current windowSize() out of the DOM
// return and object has width value and height value
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

// Pull Straight out of nvd3 library
// Easy way to bind multiple functions to window.onresize
// TODO: give a way to remove a function after its bound, other than removing all of them
d3.ma.onResize = function(fun){
	var oldresize = window.onresize;

	window.onresize = function(e) {
		if (typeof oldresize === 'function') oldresize(e);
		fun(e);
	}
};


// modified implementation from zepto.js library
// In general, you do not need to apply 2nd arg. by default, element is document
// selector could be any string, it is required. e.g:  id, class, tagName, any css selector
// return  an array representation of DOM objects.
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

// variation of d3.ma.$(selector). return a single DOM object, the first index of the array
// Works best with id selection. selector could be any string, it is required. e.g:  id, class, tagName, any css selector
// Use case:  when dealing with d3.ma.tooltip(), 3rd arg would expect to have a DOM element e.g:  d3.ma.$$('#vis')
d3.ma.$$ = function(selector, element) {
	var ret = d3.ma.$(selector, element);
	return ret[0];
};


/*
	Works like a constructor, initialize the tooltip object. e.g var tooltip = d3.ma.tooltip()
	Argument:  context.  optional, by passing the current context of my function to detemine which DOM element should be append the tooltip HTML markup. In general, d3.ma.tooltip(this.base). Tooltip block should be the siblings of the svg element

	tooltip.show()  # show tooltip markup like switch the display property on.
		pos: Array, required. expect [x, y] to detemine tooltip position left, and top pixel value. The value should be set without tooltip obj to figure out where it should be positioned to.
		content: required. HTML markup contains optional javascript variable data. content to show
		parentContainer: optional. single DOM object, the element which need to contain the tooltip block. By default, it will add to the body element
		classes: optional, by default, tooltip has d3maTooltip class, add more classes if needed

		E.G  tooltip.show([e.pos[0], e.pos[1]], html, d3.ma.$$('#vis'))

	tooltip.close()   # suppress the current tooltip block. turn the visiblity of tooltip off. can have 'd3maTooltip-pending-removal' class to show something interesting before it is being removed.
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
