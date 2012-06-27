function getValues(obj) {
  var values = [];
  for (var i in obj) {
    if (obj.hasOwnProperty(i))
      values.push(obj[i]);
  }

  return values;
}

require(['config.js', 'core/util.js'], function(config, util) {
  
  if (typeof config.scripts !== 'object')
    config.scripts = [];

  if (typeof config.plugins !== 'object')
    config.plugins = {};
  
  require(['require', 'themes/'+config.theme+'/index.js'], function(require, t) {
    var head = document.getElementsByTagName('head')[0],
        plugins = Object.keys(config.plugins).map(function(x) {
          return "../plugins/"+x;
        });

    if (typeof t.scripts !== 'object')
      t.scripts = []

    if (typeof t.css !== 'object')
      t.css = [];

    t.scripts = t.scripts.map(function(x) {
      return 'themes/'+config.theme+'/scripts/'+x;
    });

    t.scripts = t.scripts.concat(config.scripts);

    if (typeof t.beforeload === 'function')
      t.beforeload();

    t.css.forEach(function(x) {
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'themes/'+config.theme+'/css/'+x;
      head.appendChild(link);
    });

    if (typeof config.middleware !== 'object')
      config.middleware = [];
    
    require(t.scripts.concat(plugins), function() {
      var args = Array.prototype.slice.call(arguments);
      util.getPages(['db.json', 'themes/'+config.theme+'/'+t.body], function(reqs) {
        var index = config.index || 'index',
            db = JSON.parse(reqs['db.json'].responseText),
            template = reqs['themes/'+config.theme+'/'+t.body].responseText,
            values = getValues(config.plugins),
            view = {}, plugs = [], r;


        values = values.map(function(x) {
          return {title: x};
        });


        if (location.hash.substring(1))
          index = location.hash.substring(1)

        view.pages = db;
        view.titles = [];
        
        for (var i in db) {
          if (db.hasOwnProperty(i)) {
            view.titles.push({title: i});
          }
        }

        console.dir(getValues(config.plugins));
        view.titles = view.titles.concat(values);

        if (args.length > t.scripts.length) {
          config.plugins = {};

          for (var i = t.scripts.length; i < args.length; i++)
            config.plugins[values[i-t.scripts.length].title] = args[i];
        }


        config.t = t;

        window.pineapple = {
          template: template,
          view: view,
          config: config,
          util: util
        };

        if (typeof t.afterload === 'function')
          t.afterload();

        if (typeof pineapple.config.t.beforechange !== 'function') {
          pineapple.config.t.beforechange = function(page, callback) {
            callback();
          }
        }

        changePage(index, true);
      });
    });
  });
});

function changePage(page, f) {
  if (!(page in pineapple.view.pages) && !(page in pineapple.config.plugins)) {
    return; // TODO: 404 error
  }

  pineapple.config.t.beforechange(page, function() {
    console.log("asd");
    if (page in pineapple.config.plugins) // Current page is managed by a plugin
      pineapple.view.pages[page] = pineapple.config.plugins[page].main(page);

    for (var i = 0; i<pineapple.view.titles.length; i++) {
      if (pineapple.view.titles[i].title === page)
        pineapple.view.titles[i].current = true;
    }


    for (var i = 0; i<pineapple.config.middleware.length; i++)
      pineapple.view.pages[page] = pineapple.config.middleware[i](pineapple.view.pages[page]);

    r = pineapple.config.t.render(pineapple.template, pineapple.view, page);

    if (f || typeof pineapple.config.t.cid === 'undefined')
      document.getElementsByTagName("body")[0].innerHTML = r;
    else
      document.getElementById(pineapple.config.t.cid).innerHTML = pineapple.view.pages[page];


    if (typeof pineapple.config.t.afterchange === 'function')
      pineapple.config.t.afterchange(page);
  });
}

window.onhashchange = function() {
  hash = location.hash.substring(1);
  changePage(hash);
}