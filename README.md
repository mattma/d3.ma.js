

1.  common folder

It could be used in all cases, or all general use cases including clipPath or setup base container with margin values

core.js   # simply setup the d3.ma namespace

utils.js   # Utilities toolbelt. this library is growing pretty quickly. Currently includes,

	* d3.ma.windowSize()    # get the current window width and height value
	* d3.ma.onResize(function)   # easy way to bind multiple fns to window.onresize
	* d3.ma.$(selector)        # kind of like jquery selector, optimized for id, class, tagname. Always return an Array of dom objects
	* d3.ma.$$(selector)      # Always return the first index of the array. Work best with id selection, only return 1 dom objects
	* d3.ma.tooltip
