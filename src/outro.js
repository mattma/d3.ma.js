     // when use directly in the browser, export d3.ma as a global
     var ret = typeof window !== 'undefined' ? d3.ma = d3ma : d3ma;
     return ret;
}));
