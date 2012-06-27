define({
  getPages: function(pages, callback) {
    var req, reqs = {};
    
    if (typeof pages !== 'object')
      pages = [pages]

    pages.forEach(function(x) {
      req = new XMLHttpRequest();

      req.open('GET', x, true);

      req.onloadend = function(r) {
        reqs[x] = r.target;

        if (Object.keys(reqs).length === pages.length) {
          callback(reqs);
        }
      };

      req.send(null);
    })
  }
});