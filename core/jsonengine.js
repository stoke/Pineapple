function JSONEngine(util) {
  this.util = util;
}

JSONEngine.prototype.get = function(id, callback) { // id => content
  this.util.getPages(['db.json'], function(reqs) {
    callback(JSON.parse(reqs['db.json'].responseText)[id]);
  });
}

JSONEngine.prototype.getIds = function(callback) { // [ids]
  this.util.getPages(['db.json'], function(reqs) {
    callback(Object.keys(JSON.parse(reqs['db.json'].responseText)));
  });
}

JSONEngine.prototype.getPages = function(callback) { // ids => contents
  this.util.getPages(['db.json'], function(reqs) {
    callback(JSON.parse(reqs['db.json'].responseText));
  });
}

define({engine: JSONEngine});