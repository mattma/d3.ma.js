d3.chart('Base').extend('Icicle', {

  initialize: function (options) {
    this.options = options = options || {};

    var self = this;

    this.layer('icicle', this.base, {
      // select the elements we wish to bind to and bind the data to them.
      dataBind: function (data) {
        var chart = this.chart();

        if (chart.onDataBind) {
          data = chart.onDataBind(data, chart);
        }

        return this.selectAll("g.icicle-node").data(data);
      },

      // insert actual element, defined its own attrs
      insert:   function () {
        var chart = this.chart();
        var node = this.insert("g").attr("class", "icicle-node");

        if (chart.onInsert) {
          chart.onInsert(chart, node, this);
        }

        // add any property to each "node", and return itself
        return node;
      },

      // define lifecycle events
      events:   {
        'enter': function () {
          var chart = this.chart();

          // onEnter fn will take two args
          // chart  # refer to this context, used it to access xScale, yScale, width, height, etc.
          // chart property this   # refer to each individual group just appended by insert command
          if (chart.onEnter) {
            chart.onEnter(chart, this);
          }
        },

        'enter:transition': function () {
          var chart = this.chart();

          if (chart.onEnterTransition) {
            chart.onEnterTransition(chart, this);
          }
        },

        'merge': function () {
          var chart = this.chart();

          if (chart.onMerge) {
            chart.onMerge(chart, this);
          }

          chart._onWindowResize(chart, this);
          self._bindMouseEnterOutEvents(chart, this);
        },

        'merge:transition': function () {
          var chart = this.chart();

          if (chart.onMergeTransition) {
            chart.onMergeTransition(chart, this);
          }
        },

        'exit:transition': function () {
          var chart = this.chart();
          var duration = chart.options.animationDurationRemove || 400;
          var easing = chart.options.animationEasing || 'cubic-in-out';

          if (chart.onRemove && typeof chart.onRemove === 'function') {
            chart.onRemove(chart, this);
          } else {
            this
              .duration(duration)
              .ease(easing)
              .style('opacity', 1e-6)
              .remove();
          }
        }
      }
    });
  }
});