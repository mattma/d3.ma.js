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


d3.ma.tooltip = function() {
	var tooltip = {};


	tooltip.show = function(pos, content, parentContainer, classes){

		var tooltipContainer = document.createElement('div');
			tooltipContainer.className = 'd3maTooltip';

		//console.log('parentContainer: ', parentContainer);

		var body = parentContainer;
		if ( !parentContainer || parentContainer.tagName.match(/g|svg/i)) {
			//If the parent element is an SVG element, place tooltip in the <body> element.
			body = document.getElementsByTagName('body')[0];
		}

		tooltipContainer.innerHTML = content;
		tooltipContainer.style.left = 0;
		tooltipContainer.style.top = 0;
		tooltipContainer.style.opacity = 0;

		body.appendChild(tooltipContainer);

		var height = parseInt(tooltipContainer.offsetHeight),
			width = parseInt(tooltipContainer.offsetWidth),
			windowWidth = d3.ma.windowSize().width,
			windowHeight = d3.ma.windowSize().height,
			scrollTop = window.scrollY,
			scrollLeft = window.scrollX,
			left, top;


		var dist = 20;

		windowHeight = window.innerWidth >= document.body.scrollWidth ? windowHeight : windowHeight - 16;
		windowWidth = window.innerHeight >= document.body.scrollHeight ? windowWidth : windowWidth - 16;

		var tooltipTop = function ( Elem ) {
			var offsetTop = top;
			console.log('offsetTop: ', offsetTop);
			// do {
			// 	if( !isNaN( Elem.offsetTop ) ) {
			// 		offsetTop += (Elem.offsetTop);
			// 	}
			// }
			// while(
			// 	Elem = Elem.offsetParent;
			// );
			return offsetTop;
		};

		var tooltipLeft = function ( Elem ) {
			var offsetLeft = left;
			console.log('Elem: ', Elem);
			console.log('Elem.offsetLeft: ', Elem.offsetLeft);
			console.log('Elem.offsetParent: ', Elem.offsetParent);
			// do {
			// 	if( !isNaN( Elem.offsetLeft ) ) {
			// 		offsetLeft += (Elem.offsetLeft);
			// 	}
			// } while(
			// 	Elem = Elem.offsetParent;
			// );
			return offsetLeft;
		};

		console.log('pos: ', pos);
		left = pos[0]; //- ( width / 2);
		top = pos[1]; //- height - dist;

		// var m = d3.mouse(tooltipContainer);

		// 	console.log('m: ', m);

		// var tLeft = tooltipLeft(tooltipContainer);

		// console.log('left: ', left);
		// console.log('tLeft: ', tLeft);
		// var tTop = tooltipTop(tooltipContainer);
		// if (scrollTop > tTop) top = scrollTop;

		// if (tLeft < scrollLeft) left = scrollLeft + 5;
		// if (tLeft + width > windowWidth) left = left - width/2 + 5;

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
