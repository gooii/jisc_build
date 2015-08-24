var toTmp = {
  expand: true,
  cwd: 'app',
  src: 'scripts/**/*.coffee',
  dest: '.tmp',
  ext: '.js'
};

var toDist = {
  expand: true,
  cwd: 'app',
  src: 'scripts/**/*.coffee',
  dest: 'dist',
  ext: '.js'
};

var options = {
  sourceMap: false
};

module.exports = {
    serve: {
      options: options,
      files: [toTmp]
    },
    dist: {
      options: options,
      files: [toDist]
    },
    production: {
      options: options,
      files: [toTmp]
    }
};
