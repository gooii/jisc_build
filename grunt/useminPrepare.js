module.exports = {
  html: 'app/index.html',
  options: {
    dest: 'dist',
    root: './',
    flow: {
      html: {
        steps: {
          css: ['cssmin'],
          js: ['concat', 'uglifyjs'],
          dontmin: ['concat']
        },
        post: {}
      }
    }
  }
};
