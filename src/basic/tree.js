d3.chart('Base').extend('Tree', {

  initialize: function (options) {
    this.options = options = options || {};

    var self = this;

    this.layer('tree', this.base, {
      // select the elements we wish to bind to and bind the data to them.
      dataBind: function (data) {
        var chart = this.chart();
        console.log('data bind data : ', data);
        if (chart.onDataBind) {
          chart.onDataBind(data, chart);
        }
        return (chart.rectsGroup) ? chart.rectsGroup.data(data) : this.data(data);
      },

      // insert actual bars, defined its own attrs
      insert:   function () {
        var chart = this.chart();
        if (chart.onInsert) {
          chart.onInsert(chart);
        }

        if (!chart.rectsGroup) {
          chart.rectsGroup = this.append('g').classed('group', true).append('rect');
        }

        return chart.rectsGroup;
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

          // Used for animation the fill opacity property, work with enter:transition
          //this.style('opacity', 1e-6);
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

        'exit:transition': function () {
          var chart = this.chart();
          this
            .duration(400)
            .ease('cubic-in')
            .style('opacity', 1e-6)
            .remove();
        }
      }
    });
  }
});
