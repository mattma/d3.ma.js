/*
	Base is extended from Scale, it is used for the basic/ folder section. All mixined or extended modules will have all its behavior. Where you define your absolutely needed methods for the APIs. Internal use only, never use it for displaying a chart.

	Initalization:
		initialize: function(containerInfo) {
			var chart =  this.mixin('Base',  axisG, {
				info: containerInfo,
				x: 'ordinal',
				y: 'log',
				width: this.base.attr('width'),  // optional
				height: this.base.attr('height')   // optional
			});
		}

		// Passing options object as a third argument. Options is required.

	Arguments:
		Attributes
			since it inherit from scale.js, it will have all its private & public attr. Read core/scale.js Arguments section for details


	APIs:  ( defined in the constructor level )
	# THOSE APIs EXIST IN ALL EXTENDED MODULES
		constructor.box(_width, _height)
			# setter/getter container width value and height values, when only one value, height is the same as width

		constructor.w(_width)
			# setter/getter container width value  // always recommend to use constructor.box() instead

		constructor.h(_height)
			# setter/getter container height value  // always recommend to use constructor.box() instead

	PRIVATE APIs:
		_bindMouseEnterOutEvents(chart, single)
			# when it is entering, binding datum with each element, single element will bind 'mouseenter' event with our custom 'd3maMouseenter', bind 'mouseout' with our custom event 'd3maMouseout'.
			For example, quick internal binding to reduce duplicated code in modules like circle.js, bars.js etc

		1. _resize()  # called from d3.ma.onResize() or d3.ma.resize()
		2. _onWindowResize(chart, single)  # called from each individual module. It has to defined in each module basis. Since it has to pass the chart, single info in this.layer lifeevent enter event. No way to know its context in base.js level.
		3. _redraw(e, chart, single)  # called from each individual module
		4. _unbind(e, chart, single) # called from each individual module
		5. _updateScale(_width, _height) # called from each individual module
		6. _update(_width, _height, chart, single)  # this methods should be handled by each module, normally defined for special cases

		Here is the logic on those private methods above.
		When each instance attach an function of resize(context, context ...), E.G. d3.ma.onResize(line._resize, line); `1. _resize()` is called automatically, it will figure it out current width and height, dispatch 'd3maOnWindowResize' or 'd3maOffWindowResize' accordingly, passing the correct data object to the handlers.

		Each module ( like line, bar, circle etc ) will handle it to trigger `2. _onWindowResize()` this._onWindowResize() like Line, Axis or chart._onWindowResize(chart, this) inside this.layer enter lifeevent. _onWindowResize defined the global handler on 'd3maOnWindowResize' or 'd3maOffWindowResize', passing three arguments (e, chart, single).
		e is the object received from 'd3maOnWindowResize' or 'd3maOffWindowResize'.
		chart refer to this context, used it to access xScale, yScale, width, height, etc. chart property.
		single refer to each individual group just appended by insert command.

		`3. _redraw(e, chart, single)` will be triggered on 'd3maOnWindowResize'. First, it will trigger `5. _updateScale(_width, _height)`, based on the current xScale string value, yScale string value, update the xScale, yScale range array. ( defined in scale.js ) and update the module box width and height attribute.  Second, it will dispatch another global d3.ma event. 'd3maSingleWindowResize', passing (chart, single) as its arguments.  Third, defined a recommended method called `6. update()`. E.G. this.update( _width, _height, chart, single ).  so any module could hook into this method and attach its own custom updates based on current context and its useful values like width, height, chart info and single info

		`4. _unbind(e, chart, single)` will be triggered on 'd3maOffWindowResize'. It will auto trigger `5. _updateScale(_width, _height)` and `6. update( _width, _height, chart, single )` for modifying the scale range and domain

		`5. update, a public function, it will be called when _redraw or _unbind are being called. You could update the domain, range or whatever in your module. It need to be handled in the module level`

		'd3maSingleWindowResize': `3. _redraw(e, chart, single)` dispatch an event of `d3maSingleWindowResize`, each instance of the module should handle it separately based on its settings. (like in index.html).
			E.G.
				circles.dispatch.on('d3maSingleWindowResize', function(chart, single){
					var chart = chart || this;
					single.attr({
						'cx': area.line.x(),
						'cy': area.line.y()
					});
				});

	Events:  ( defined in the instance level )
		# Used for constructor.dispatch.on trigger events  E.G: Custom d3maMouseenter and mouseout events
		# syntax: constructor.dispatch.on('d3maMouseenter', function(e){ });

		# Currently support:
			d3maMouseenter   # each individual element mouse enter event
			d3maMouseout	# each individual element mouse out event
			d3maSingleWindowResize   # each individual element window resize event, normally, update scale domain, individual attrs
			d3maOnWindowResize		# window resize event, elements need to update its scales, and other attrs
			d3maOffWindowResize		# window resize event, elements do not update its scale, attrs, reset to original
 */
d3.chart('Scale').extend('Base', {

	initialize: function(options) {

		options = options || {};

		this.box(this.width, this.height);

		this.dispatch = d3.dispatch('d3maMouseenter', 'd3maMouseout', 'd3maOnWindowResize', 'd3maOffWindowResize', 'd3maSingleWindowResize');
	},

	w: function(_width) {
		if (arguments.length === 0) {
			return this.width;
		}
		this.width = _width;
		this.base.attr('width', this.width);
		return this;
	},

	h: function(_height) {
		if (arguments.length === 0) {
			return this.height;
		}
		this.height = _height;
		this.base.attr('height', this.height);
		return this;
	},

	box: function(_width, _height) {
		if(!arguments.length) {
			return {
				'width': this.width,
				'height': this.height
			};
		}

		this.w(_width);
		this.h((_height) ? _height : _width);

		return this;
	},

	// chart  # refer to this context, used it to access xScale, yScale, width, height, etc. chart property
	// this    # refer to each individual group just appended by insert command
	// single[0][i]  # refer to the current hover DOM element
	_bindMouseEnterOutEvents: function(chart, single) {
		var chart = chart || this;

		single.on('mouseenter', function(d, i){
			d3.select(this).classed('hover', true);
			var obj = {};
			if(chart.onDataMouseenter) {
				obj = chart.onDataMouseenter(d, i, chart, single[0][i]);
			}
			chart.dispatch.d3maMouseenter(obj);
		});

		single.on('mouseout', function(d, i){
			d3.select(this).classed('hover', false);
			var obj = {};
			if(chart.onDataMouseout) {
				obj = chart.onDataMouseout(d, i, chart, single[0][i]);
			}
			chart.dispatch.d3maMouseout(obj);
		});
	},

	_resize: function() {
		// NOTE: this here is the context where you definied in the 2nd param when initialized
		// ex: d3.ma.onResize(line._resize, line);
		// in this case, the context here is  line
		//
		// fluid attribute is being checked, on parentNode element data-fluid attr, it could be set by container.fluid()

		var containerInfo = this.info,
			parentNodeEl = d3.ma.$$(containerInfo.parentNode),
			currentWindowSize = d3.ma.windowSize(),
			fluid = parentNodeEl.getAttribute('data-fluid'),

			widthOffset = ( d3.ma.responsive ) ? parentNodeEl.offsetLeft : d3.ma.$$(containerInfo.parentNode).offsetLeft + containerInfo.marginLeft + containerInfo.marginRight,

			heightOffset =  ( d3.ma.responsive ) ? parentNodeEl.offsetTop : parentNodeEl.offsetTop + containerInfo.marginTop + containerInfo.marginBottom,

			windowWidth = currentWindowSize.width - widthOffset,
			windowHeight = currentWindowSize.height - heightOffset;

		if ( fluid === 'responsive' ) {
			var oldClientW = containerInfo.containerW,
				newClientW = parentNodeEl.clientWidth,
				oldClientH = containerInfo.containerH,
				newClientH = parentNodeEl.clientHeight;

			// canvasEl & clippathEl,
			// When chart updated, containerOption Id value is not being updated,
			// for the current bug fixes, it just goes down the dom tree to find the element by structure
			if ( oldClientW < newClientW || oldClientH < newClientH ) {
				var viewBoxValue = '0 0 ' + newClientW + ' ' + newClientH,
					svgEl = parentNodeEl.children[0],
					canvasEl = d3.ma.$$(containerInfo.id) || d3.ma.$$('#summaryChart').children[0].children[1],
					clippathEl = d3.ma.$$(containerInfo.cid + ' rect') || d3.ma.$$('#summaryChart').children[0].children[0].children[0].children[0];

				// update svg element width & height property
				svgEl.setAttribute('width', newClientW);
				svgEl.setAttribute('height', newClientH);
				svgEl.setAttribute('viewBox', viewBoxValue);
				// canvas element update width & height property
				canvasEl.setAttribute('width', newClientW);
				canvasEl.setAttribute('height', newClientH);
				// clippath element update width & height property
				clippathEl.setAttribute('width', newClientW);
				clippathEl.setAttribute('height', newClientH);
			}

			var onObj = {
				width: newClientW,
				height: ( windowHeight < containerInfo.containerH ) ? windowHeight : containerInfo.containerH
			};

			this.dispatch.d3maOnWindowResize(onObj);
		} else {
			if( windowWidth < containerInfo.containerW || windowHeight < containerInfo.containerH ) {
				var onObj = {
					width: ( windowWidth < containerInfo.containerW ) ? windowWidth : containerInfo.containerW,
					height: ( windowHeight < containerInfo.containerH ) ? windowHeight : containerInfo.containerH
				};
				this.dispatch.d3maOnWindowResize(onObj);
			} else {
				var offObj = {
					width: containerInfo.canvasW,
					height: containerInfo.canvasH
				};
				var origObj = {
					width: containerInfo.containerW,
					height: containerInfo.containerH
				};
				// dispatch the _redraw back to the original container box
				this.dispatch.d3maOnWindowResize(origObj);
				// unbind the window resize event
				this.dispatch.d3maOffWindowResize(offObj);
			}
		}
	},

	// it is the handler for the internal _resize() which definied above this one
	_onWindowResize: function(chart, single){
		var self = this;

		this.dispatch.on('d3maOnWindowResize', function(e){
			self._redraw(e, chart, single);
		});

		this.dispatch.on('d3maOffWindowResize', function(e){
			self._unbind(e, chart, single);
		});
	},

	// this will trigger the _update internal fn
	// look at the line.js _update fn for details
	_redraw: function(e, chart, single) {
		var containerInfo = this.info,
			_width = e.width - containerInfo.marginLeft - containerInfo.marginRight,
			_height = e.height - containerInfo.marginTop - containerInfo.marginBottom;

		//handle this in base.js below this fn. dealing with Scale updates
		this._updateScale(_width, _height);

		//dealing with the single element, trigger 'd3maSingleWindowResize'
		//handle event in the each instance for details updates.
		//usage on rects, circles, like multiple repeated elements.
		this.dispatch.d3maSingleWindowResize(chart, single);

		// Except Axis, only pass in the chart without single, everything else should pass all 4 args
		// Currently, _update is only used in axis base, for constant API, update could be used inside custom constructors
		if (this._update) {
			this._update( _width, _height, chart, single );
		}
		// handle this in individual modules
		// Optional step, if defined in each module, could
		// setup the global default in this module, or setup global attrs
		// Axis is using this in the custom construtor.
		if (this.update) {
			this.update( _width, _height, chart, single );
		}
	},

	// this will trigger the _update internal fn
	// look at the line.js _update fn for details
	_unbind: function(e, chart, single) {
		// find out the current width & height of line g container. convert it to number
		var containerInfo = this.info,
			currentWidth = +(this.base.attr('width')),
			currentHeight = +(this.base.attr('height')),
			_canvasW = containerInfo.canvasW,
			_canvasH = containerInfo.canvasH;

		if( currentWidth !== _canvasW || currentHeight !== _canvasH)  {
			// same usage like _redraw fn for  _updateScale  &  _update
			this._updateScale(_canvasW, _canvasH);

			if (this.update)
				this.update(_canvasW, _canvasH, chart, single);
		}
	},

	// Update Scale, Box Size
	_updateScale: function(_width, _height) {
		// trigger the Scale in scale.js
		this._switchXScale(this._x, _width);
		this._switchYScale(this._y, _height);

		this.box(_width, _height);
	}

});
