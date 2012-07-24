require(['config.js', 'core/util.js'], function(config, util) {
  if (typeof config.scripts !== 'object')
    config.scripts = [];

  if (typeof config.plugins !== 'object')
    config.plugins = {};

  require(['require', 'themes/'+config.theme+'/index.js', config.engine || 'core/jsonengine.js'], function(require, theme, Engine) {
    var head = document.getElementsByTagName('head')[0],
        plugins = Object.keys(config.plugins).map(function(x) {
          return "../plugins/"+x;
        });

    Engine = Engine.engine;
    var engine = new Engine(util);

    if (typeof theme.scripts !== 'object')
      theme.scripts = [];

    if (typeof theme.css !== 'object')
      theme.css = [];

    theme.scripts = theme.scripts.map(function(x) {
      return 'themes/'+config.theme+'/scripts/'+x;
    });

    theme.scripts = theme.scripts.concat(config.scripts);

    if (typeof theme.beforeload === 'function')
      theme.beforeload();

    theme.css.forEach(function(x) {
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'themes/'+config.theme+'/css/'+x;
      head.appendChild(link);
    });

    if (typeof config.middleware !== 'object')
      config.middleware = [];
    
    require(theme.scripts.concat(plugins), function() {
      var args = Array.prototype.slice.call(arguments);
      util.getPages(['themes/'+config.theme+'/'+theme.body], function(reqs) {
        var index = config.index || 'index',
            template = reqs['themes/'+config.theme+'/'+theme.body].responseText,
            plugins = Object.keys(config.plugins),
            view = {};

        if (location.hash.substring(1))
            index = location.hash.substring(1);

        engine.getPages(function(pages) {
          view.pages = pages;
          view.titles = [];

          plugins = plugins.map(function(x) {
            return {title: x};
          });
          
          Object.keys(pages).forEach(function(x) {
            view.titles.push({title: x});
          });

          view.titles = view.titles.concat(plugins);

          if (args.length > theme.scripts.length) {
            config.plugins = {};

            for (var i = theme.scripts.length; i < args.length; i++)
              config.plugins[plugins[i-theme.scripts.length].title] = args[i];
          }

          config.theme = theme;

          window.pineapple = {
            template: template,
            view: view,
            config: config,
            util: util,
            engine: engine
          };

          if (typeof theme.afterload === 'function')
            theme.afterload();

          if (typeof pineapple.config.theme.beforechange !== 'function') {
            pineapple.config.theme.beforechange = function(page, callback) {
              callback();
            }
          }

          loadPage(index, true);
        });
      });
    });
  });
});

function loadPage(page, f) {
  var args = page.split('/');
  
  page = args.shift();
  
  if (!args.length)
    args = undefined;

  if (!~Object.keys(pineapple.view.pages).indexOf(page) && !~Object.keys(pineapple.config.plugins).indexOf(page))
    return; // TODO: 404 error

  pineapple.config.theme.beforechange(page, function() {
    for (var i = 0; i<pineapple.view.titles.length; i++) {
      if (pineapple.view.titles[i].title === page)
        pineapple.view.titles[i].current = true;
    }

    if (~Object.keys(pineapple.config.plugins).indexOf(page)) { // Current page is managed by a plugin
      if (pineapple.config.plugins[page].async) {
        return pineapple.config.plugins[page].main(page, args, render.bind(this, page, f));
      } else {
        pineapple.view.pages[page] = pineapple.config.plugins[page].main(page, args);
        return render(page, f);
      }
    }

    render(page, f);
  });
}

function render(page, f, content) {
  if (content) // Coming from an async plugin
    pineapple.view.pages[page] = content;

  for (var i = 0; i<pineapple.config.middleware.length; i++)
    pineapple.view.pages[page] = pineapple.config.middleware[i](pineapple.view.pages[page]);

  var r = pineapple.config.theme.render(pineapple.template, pineapple.view, page);

  if (f || typeof pineapple.config.theme.cid === 'undefined')
    document.getElementsByTagName("body")[0].innerHTML = r;
  else
    document.getElementById(pineapple.config.theme.cid).innerHTML = pineapple.view.pages[page];


  if (typeof pineapple.config.theme.afterchange === 'function')
    pineapple.config.theme.afterchange(page);
}

window.onhashchange = function() {
  var hash = location.hash.substring(1);
  loadPage(hash);
}