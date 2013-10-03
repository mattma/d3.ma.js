TODO:
1. refactor container with handle multiple data
2. legend

1.  common folder

It could be used in all cases, or all general use cases including setup base container with margin values

# core.js   # simply setup the d3.ma namespace and current version

# utils.js   # Utilities toolbelt. this library is growing pretty quickly. Currently includes,

	* d3.ma.windowSize()    # get the current window width and height value
	* d3.ma.each(obj, iterator, context)   # Work the same way how underscore.js signiture each method
	* d3.ma.onResize(function)   # easy way to bind multiple fns to window.onresize
	* d3.ma.resize(array)   # Convinient method to call onResize() bind to the right context
	* d3.ma.$(selector)        # kind of like jquery selector, optimized for id, class, tagname. Always return an Array of dom objects
	* d3.ma.$$(selector)      # Always return the first index of the array. Work best with id selection, only return 1 dom objects
	* d3.ma.tooltip(context)  # works like a constructor to init the tooltip obj, then have methods available like show(), close()
	* d3.ma.zoom   #TODO

# container.js
	select the container object by defining a css selector. then append the svg element to this container. by tweaking its own attributes, it will also append the g.canvas element inside the svg element to be the canvas of the chart. It will auto setup the margin top, left map to transform value of the canvas.

2. core folder

Every modules here are kind of private. It is not designed for direct chart display. It is served as an internal usage. It could be mixin and extend by other modules inside the d3.ma libraries. Remember, No direct usage, ONLY for common behaviors, common events, common methods setup, would be mixin and extend by basic modules or complex modoles.

3. components folder

it could be used inside chart minin or extend methods. It could be reused in many different situation. Plugin play components in different places of the app.

# axis.js

it will draw the x axis and y axis for the chart. optionally, it could draw the grid guides along the x and y axis.

TODO: label, legend

# clippath.js

reusable componment. it could be mixed into any chart modules. quickly mask out a portion of the view. by its own API, it could could quick get/set its width, height, x, y values. and retrieve its random url attribute for working with clip-path property.


4. basic folder

It contains all the basic chart modules which could be mixin and extend. For example, bar chart, circle chart, line chart, area chart etc.

# bars.js

It is used for displaying the bar chart. It extended from scale.js and base.js
