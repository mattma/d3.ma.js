/**
 * Initialization of d3ma variable, will use as a cast of d3.ma.js library
 * @type {Object}
 */
let d3ma = {
  // semver
  version: "__VERSION__"
};

/**
 * Store svg elements on the current page
 * Track individual .canvas element
 * Retrieve cancas object
 * can call *draw* method to update its visualization
 * @type {Array}
 */
d3ma.canvas = [];

/**
 * Add a canvas object into the `d3ma.canvas` array
 * used to redraw the chart
 * @getter
 * @setter
 * @param  {[type]} canvas: the canvas object which store svg element
 * @return {[type]} if *canvas* is omit, it will return the entire array of canvas
 * object, if *canvas* is successfully set, return itself so that it can be chained
 */
d3ma.setCanvas = canvas => {
  if (!canvas && typeof canvas !== 'object') {
    return d3ma.canvas;
  }
  // add one more comment. add few more comments
  d3ma.canvas.push(canvas);
  return canvas;
};
