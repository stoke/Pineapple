function markdown(x) { 
  var converter = new Showdown.converter(),
      html = converter.makeHtml(x);

  return html;
}


define({
  theme: 'default',
  scripts: ['scripts/markdown.js'],
  middleware: [markdown],
  engine: 'core/jsonengine.js'
});
