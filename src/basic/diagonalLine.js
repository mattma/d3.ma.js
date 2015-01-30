d3.chart('Base').extend('DiagonalLine', {
  initialize: function (options) {
    this.options = options || {};

    this.linePath = this.base.append('svg:g').classed('diagonalLine', true);

    this.diagonal = d3.svg.diagonal()
      .projection(function (d) {
        return [d.y, d.x];
      });

    this.layer('diagonalLine', this.linePath, {
      dataBind: function (data) {
        var chart = this.chart();

        // Setup the auto resize to handle the on resize event
        chart.dispatch.on('d3maSingleWindowResize', function (chart, single) {
          single.attr({'d': chart.diagonal});
        });

        if (chart.onDataBind) {
          // in case onDataBind return a new data set
          // we need to assign back to data which contain the new data set
          // or if it is no return, it would undefined, stay what it is
          data = chart.onDataBind(data, chart) || data;
        }

        return this.selectAll("path.link")
          .data(data, function (d) {
            return d.target.id;
          });
      },

      insert: function () {
        var chart = this.chart();
        var path = this.insert("path", "g").attr("class", "link");

        if (chart.onInsert) {
          chart.onInsert(chart, path, this);
        }

        return path;
      },

      events: {
        'enter': function () {
          var chart = this.chart();

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

          chart._onWindowResize(chart, this);
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
  },

  _update: function (_width, _height, chart, single) {
    this.linePath.attr({'d': chart.diagonal});
  }
});
