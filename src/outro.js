  // if (typeof define === "function" && define.amd) {
  //   // used in amd environment
  //   define(d3ma);
  // } else if (typeof module === "object" && module.exports) {
  //   // used in Node.js environment
  //   module.exports = d3ma;
  // } else {
  //   // used in browser environment, export d3.ma as a global
  //   return typeof window !== 'undefined' ? d3.ma = d3ma : d3ma;
  // }
  return typeof window !== 'undefined' ? d3.ma = d3ma : d3ma;
}));
