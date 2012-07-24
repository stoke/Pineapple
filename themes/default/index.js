define({
  css: ['main.css'],
  scripts: ['mustache.js', 'jquery.js', 'blogrender.js'],
  beforechange: function(page, callback) {
    if (document.getElementById("content")) {
      $("#title").fadeOut();
      $("#content").fadeOut(callback);
    } else {
      callback();
    }
  },
  afterchange: function(page) { $("#content").fadeIn(); document.getElementById("title").innerHTML = page; },
  body: 'template.mustache',
  cid: 'content',
  render: function(template, vars, page) { $("#title").fadeIn(); vars.text = vars.pages[page]; return Mustache.render(template, vars); },
  blogRender: function(posts) { return blogRender({posts: posts}); }
});