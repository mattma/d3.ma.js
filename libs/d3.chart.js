/*! d3.chart - v0.2.0
 *  Modified based on v0.2.0 - Home Baked
 *  Date: 2014-02-21
 */
(function(window, undefined) {
	/*jshint unused: false */
	'use strict';

	var d3Chart = window.d3Chart = {};
	var d3 = window.d3;
	var hasOwnProp = Object.hasOwnProperty;

	var d3cAssert = function(test, message) {
		if (test) {
			return;
		}
		throw new Error("[d3.chart] " + message);
	};

	d3cAssert(d3, "d3.js is required");
	d3cAssert(typeof d3.version === "string" && d3.version.match(/^3/),
		"d3.js version 3 is required");

	// @todo file break line

	var lifecycleRe = /^(enter|update|merge|exit)(:transition)?$/;

	/**
	 * Create a layer using the provided `base`. The layer instance is *not*
	 * exposed to d3.chart users. Instead, its instance methods are mixed in to the
	 * `base` selection it describes; users interact with the instance via these
	 * bound methods.
	 *
	 * @private
	 * @constructor
	 *
	 * @param {d3.selection} base The containing DOM node for the layer.
	 */
	var Layer = function(base) {
		d3cAssert(base, "Layers must be initialized with a base.");
		this._base = base;
		this._handlers = {};
	};

	/**
	 * Invoked by {@link Layer#draw} to join data with this layer's DOM nodes. This
	 * implementation is "virtual"--it *must* be overridden by Layer instances.
	 *
	 * @param {Array} data Value passed to {@link Layer#draw}
	 */
	Layer.prototype.dataBind = function() {
		d3cAssert(false, "Layers must specify a `dataBind` method.");
	};

	/**
	 * Invoked by {@link Layer#draw} in order to insert new DOM nodes into this
	 * layer's `base`. This implementation is "virtual"--it *must* be overridden by
	 * Layer instances.
	 */
	Layer.prototype.insert = function() {
		d3cAssert(false, "Layers must specify an `insert` method.");
	};

	/**
	 * Subscribe a handler to a "lifecycle event". These events (and only these
	 * events) are triggered when {@link Layer#draw} is invoked--see that method
	 * for more details on lifecycle events.
	 *
	 * @param {String} eventName Identifier for the lifecycle event for which to
	 *        subscribe.
	 * @param {Function} handler Callback function
	 *
	 * @returns {d3.selection} Reference to the layer's base.
	 */
	Layer.prototype.on = function(eventName, handler, options) {
		options = options || {};
		d3cAssert(
			lifecycleRe.test(eventName),
			"Unrecognized lifecycle event name specified to `Layer#on`: '" +
			eventName + "'."
		);
		if (!(eventName in this._handlers)) {
			this._handlers[eventName] = [];
		}
		this._handlers[eventName].push({
			callback: handler,
			chart: options.chart || null
		});
		return this._base;
	};

	/**
	 * Unsubscribe the specified handler from the specified event. If no handler is
	 * supplied, remove *all* handlers from the event.
	 *
	 * @param {String} eventName Identifier for event from which to remove
	 *        unsubscribe
	 * @param {Function} handler Callback to remove from the specified event
	 *
	 * @returns {d3.selection} Reference to the layer's base.
	 */
	Layer.prototype.off = function(eventName, handler) {

		var handlers = this._handlers[eventName];
		var idx;

		d3cAssert(
			lifecycleRe.test(eventName),
			"Unrecognized lifecycle event name specified to `Layer#off`: '" +
			eventName + "'."
		);

		if (!handlers) {
			return this._base;
		}

		if (arguments.length === 1) {
			handlers.length = 0;
			return this._base;
		}

		for (idx = handlers.length - 1; idx > -1; --idx) {
			if (handlers[idx].callback === handler) {
				handlers.splice(idx, 1);
			}
		}
		return this._base;
	};

	/**
	 * Render the layer according to the input data: Bind the data to the layer
	 * (according to {@link Layer#dataBind}, insert new elements (according to
	 * {@link Layer#insert}, make lifecycle selections, and invoke all relevant
	 * handlers (as attached via {@link Layer#on}) with the lifecycle selections.
	 *
	 * - update
	 * - update:transition
	 * - enter
	 * - enter:transition
	 * - exit
	 * - exit:transition
	 *
	 * @param {Array} data Data to drive the rendering.
	 */
	Layer.prototype.draw = function(data) {
		var bound, entering, events, selection, handlers, eventName, idx, len;

		bound = this.dataBind.call(this._base, data);

		// Although `bound instanceof d3.selection` is more explicit, it fails
		// in IE8, so we use duck typing to maintain compatability.
		d3cAssert(bound && bound.call === d3.selection.prototype.call,
			"Invalid selection defined by `Layer#dataBind` method.");
		d3cAssert(bound.enter, "Layer selection not properly bound.");

		entering = bound.enter();
		entering._chart = this._base._chart;

		events = [{
			name: "update",
			selection: bound
		}, {
			name: "enter",
			// Defer invocation of the `insert` method so that the previous
			// `update` selection does not contain the new nodes.
			selection: this.insert.bind(entering)
		}, {
			name: "merge",
			// This selection will be modified when the previous selection
			// is made.
			selection: bound
		}, {
			name: "exit",
			selection: bound.exit.bind(bound)
		}];

		for (var i = 0, l = events.length; i < l; ++i) {
			eventName = events[i].name;
			selection = events[i].selection;

			// Some lifecycle selections are expressed as functions so that
			// they may be delayed.
			if (typeof selection === "function") {
				selection = selection();
			}

			if (selection.empty()) {
				continue;
			}

			// Although `selection instanceof d3.selection` is more explicit,
			// it fails in IE8, so we use duck typing to maintain
			// compatability.
			d3cAssert(selection &&
				selection.call === d3.selection.prototype.call,
				"Invalid selection defined for '" + eventName +
				"' lifecycle event.");

			handlers = this._handlers[eventName];

			if (handlers) {
				for (idx = 0, len = handlers.length; idx < len; ++idx) {
					// Attach a reference to the parent chart so the selection"s
					// `chart` method will function correctly.
					selection._chart = handlers[idx].chart || this._base._chart;
					selection.call(handlers[idx].callback);
				}
			}

			handlers = this._handlers[eventName + ":transition"];

			if (handlers && handlers.length) {
				selection = selection.transition();
				for (idx = 0, len = handlers.length; idx < len; ++idx) {
					selection._chart = handlers[idx].chart || this._base._chart;
					selection.call(handlers[idx].callback);
				}
			}
		}
	};

	// @todo file break line

	/**
	 * Create a new layer on the d3 selection from which it is called.
	 *
	 * @static
	 *
	 * @param {Object} [options] Options to be forwarded to {@link Layer|the Layer
	 *        constructor}
	 * @returns {d3.selection}
	 */
	d3.selection.prototype.layer = function(options) {
		var layer = new Layer(this);
		var eventName;

		// Set layer methods (required)
		layer.dataBind = options.dataBind;
		layer.insert = options.insert;

		// Bind events (optional)
		if ("events" in options) {
			for (eventName in options.events) {
				layer.on(eventName, options.events[eventName]);
			}
		}

		// Mix the public methods into the D3.js selection (bound appropriately)
		this.on = function() {
			return layer.on.apply(layer, arguments);
		};
		this.off = function() {
			return layer.off.apply(layer, arguments);
		};
		this.draw = function() {
			return layer.draw.apply(layer, arguments);
		};

		return this;
	};

	var Surrogate = function(ctor) {
		this.constructor = ctor;
	};
	var variadicNew = function(Ctor, args) {
		var inst;
		Surrogate.prototype = Ctor.prototype;
		inst = new Surrogate(Ctor);
		Ctor.apply(inst, args);
		return inst;
	};

	// extend
	// Borrowed from Underscore.js
	function extend(object) {
		var argsIndex, argsLength, iteratee, key;
		if (!object) {
			return object;
		}
		argsLength = arguments.length;
		for (argsIndex = 1; argsIndex < argsLength; argsIndex++) {
			iteratee = arguments[argsIndex];
			if (iteratee) {
				for (key in iteratee) {
					object[key] = iteratee[key];
				}
			}
		}
		return object;
	}

	/**
	 * Call the {@Chart#initialize} method up the inheritance chain, starting with
	 * the base class and continuing "downward".
	 *
	 * @private
	 */
	var initCascade = function(instance, args) {
		var ctor = this.constructor;
		var sup = ctor.__super__;
		if (sup) {
			initCascade.call(sup, instance, args);
		}
		// Do not invoke the `initialize` method on classes further up the
		// prototype chain (again).
		if (hasOwnProp.call(ctor.prototype, "initialize")) {
			this.initialize.apply(instance, args);
		}
	};

	var Chart = function(selection) {

		this.base = selection;
		this._layers = {};
		this._mixins = [];
		this._events = {};

		initCascade.call(this, this, Array.prototype.slice.call(arguments, 1));
	};

	Chart.prototype.unlayer = function(name) {
		var layer = this.layer(name);

		delete this._layers[name];
		delete layer._chart;

		return layer;
	};

	Chart.prototype.layer = function(name, selection, options) {
		var layer;

		if (arguments.length === 1) {
			return this._layers[name];
		}

		// we are reattaching a previous layer, which the
		// selection argument is now set to.
		if (arguments.length === 2) {

			if (typeof selection.draw === "function") {
				selection._chart = this;
				this._layers[name] = selection;
				return this._layers[name];

			} else {
				d3cAssert(false, "When reattaching a layer, the second argument " +
					"must be a d3.chart layer");
			}
		}

		layer = selection.layer(options);

		this._layers[name] = layer;

		selection._chart = this;

		return layer;
	};

	Chart.prototype.initialize = function() {};

	Chart.prototype.transform = function(data) {
		return data;
	};

	Chart.prototype.mixin = function(chartName, selection) {
		var args = Array.prototype.slice.call(arguments, 2);
		args.unshift(selection);
		var ctor = Chart[chartName];
		var chart = variadicNew(ctor, args);

		this._mixins.push(chart);
		return chart;
	};

	Chart.prototype.draw = function(data) {

		var layerName, idx, len;

		data = this.transform(data);

		for (layerName in this._layers) {
			this._layers[layerName].draw(data);
		}

		for (idx = 0, len = this._mixins.length; idx < len; idx++) {
			this._mixins[idx].draw(data);
		}
	};

	Chart.prototype.on = function(name, callback, context) {
		var events = this._events[name] || (this._events[name] = []);
		events.push({
			callback: callback,
			context: context || this,
			_chart: this
		});
		return this;
	};

	Chart.prototype.once = function(name, callback, context) {
		var self = this;
		var once = function() {
			self.off(name, once);
			callback.apply(this, arguments);
		};
		return this.on(name, once, context);
	};

	Chart.prototype.off = function(name, callback, context) {
		var names, n, events, event, i, j;

		// remove all events
		if (arguments.length === 0) {
			for (name in this._events) {
				this._events[name].length = 0;
			}
			return this;
		}

		// remove all events for a specific name
		if (arguments.length === 1) {
			events = this._events[name];
			if (events) {
				events.length = 0;
			}
			return this;
		}

		// remove all events that match whatever combination of name, context
		// and callback.
		names = name ? [name] : Object.keys(this._events);
		for (i = 0; i < names.length; i++) {
			n = names[i];
			events = this._events[n];
			j = events.length;
			while (j--) {
				event = events[j];
				if ((callback && callback === event.callback) ||
					(context && context === event.context)) {
					events.splice(j, 1);
				}
			}
		}

		return this;
	};

	Chart.prototype.trigger = function(name) {
		var args = Array.prototype.slice.call(arguments, 1);
		var events = this._events[name];
		var i, ev;

		if (events !== undefined) {
			for (i = 0; i < events.length; i++) {
				ev = events[i];
				ev.callback.apply(ev.context, args);
			}
		}

		return this;
	};

	Chart.extend = function(name, protoProps, staticProps) {
		var parent = this;
		var child;

		// The constructor function for the new subclass is either defined by
		// you (the "constructor" property in your `extend` definition), or
		// defaulted by us to simply call the parent's constructor.
		if (protoProps && hasOwnProp.call(protoProps, "constructor")) {
			child = protoProps.constructor;
		} else {
			child = function() {
				return parent.apply(this, arguments);
			};
		}

		// Add static properties to the constructor function, if supplied.
		extend(child, parent, staticProps);

		// Set the prototype chain to inherit from `parent`, without calling
		// `parent`'s constructor function.
		var Surrogate = function() {
			this.constructor = child;
		};
		Surrogate.prototype = parent.prototype;
		child.prototype = new Surrogate();

		// Add prototype properties (instance properties) to the subclass, if
		// supplied.
		if (protoProps) {
			extend(child.prototype, protoProps);
		}

		// Set a convenience property in case the parent's prototype is needed
		// later.
		child.__super__ = parent.prototype;

		Chart[name] = child;
		return child;
	};

	// d3.chart
	// A factory for creating chart constructors
	d3.chart = function(name) {
		if (arguments.length === 0) {
			return Chart;
		} else if (arguments.length === 1) {
			return Chart[name];
		}

		return Chart.extend.apply(Chart, arguments);
	};

	d3.selection.prototype.chart = function(chartName) {
		// Without an argument, attempt to resolve the current selection's
		// containing d3.chart.
		if (arguments.length === 0) {
			return this._chart;
		}
		var ChartCtor = Chart[chartName];
		var chartArgs;
		d3cAssert(ChartCtor, "No chart registered with name '" +
			chartName + "'");

		chartArgs = Array.prototype.slice.call(arguments, 1);
		chartArgs.unshift(this);
		return variadicNew(ChartCtor, chartArgs);
	};

	d3.selection.enter.prototype.chart = function() {
		return this._chart;
	};

	d3.transition.prototype.chart = d3.selection.enter.prototype.chart;

}(this));
