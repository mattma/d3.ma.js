d3.chart('Base').extend('Tree', {

  initialize: function (options) {
    this.options = options = options || {};

    var self = this;

    var tree = this.tree = d3.layout.tree()
      .size([options.info.canvasH, options.info.canvasW]);

    this.diagonal = d3.svg.diagonal()
      .projection(function (d) {
        return [d.y, d.x];
      });

    this.layer('tree', this.base, {
      // select the elements we wish to bind to and bind the data to them.
      dataBind: function (data) {
        var chart = this.chart();
        if (chart.onDataBind) {
          chart.onDataBind(data, chart);

          function collapse (d) {
            if (d.children) {
              d._children = d.children;
              d._children.forEach(collapse);
              d.children = null;
            }
          }

          data.x0 = options.info.canvasH / 2;
          data.y0 = 0;

          data.children.forEach(collapse);
        }
        if (chart.onDataTransform) {
          data = chart.onDataTransform(data, chart);
        }

        chart.nodes = tree.nodes(data).reverse();
        chart.links = tree.links(chart.nodes);

        // Normalize for fixed-depth.
        chart.nodes.forEach(function (d) {
          d.y = d.depth * 180;
        });

        var i = 0;

        return this.selectAll("g.node").data(chart.nodes, function (d) {
          return d.id || (d.id = ++i);
        });
      },

      // insert actual element, defined its own attrs
      insert:   function () {
        var chart = this.chart();
        if (chart.onInsert) {
          chart.onInsert(chart);
        }

        // Enter any new nodes at the parent's previous position.
        this.append("g")
          .attr("class", "node");
          //.attr("transform", function (d) {
          //  return d;
          //  //return "translate(" + d.y0 + "," + d.x0 + ")";
          //});
        //.on("click", click);

        //nodeEnter.append("circle")
        //  .attr("r", 1e-6)
        //  .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });
        //
        //nodeEnter.append("text")
        //  .attr("x", function(d) { return d.children || d._children ? -10 : 10; })
        //  .attr("dy", ".35em")
        //  .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start";
        // }) .text(function(d) { return d.name; }) .style("fill-opacity", 1e-6);
        return chart.node;
      },

      // define lifecycle events
      events:   {
        'enter': function () {
          var chart = this.chart();

          console.log('this: ', this);

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
