var compass = require('compass-importer');
var sassTypes = require('node-sass').types;

uiSassBootstrap = function(url, prev, done){

  if(url.indexOf('../bower_components') != 0) {
    return sassTypes.Null.NULL;
  }
  return done({file:url.substring(3)})
};

var toTmp = {
  expand: true,
  cwd: 'app/styles',
  src: '*.scss',
  dest: '.tmp/styles',
  ext: '.css'
};

var toDist = {
  expand: true,
  cwd: 'app/styles',
  src: '*.scss',
  dest: 'dist/styles',
  ext: '.css'
};

var noSourceMap = {sourceMap:false};

module.exports = {
  options: {
    sourceMap: true,
    includePaths:['bower_components','.compass'],
    importer: [uiSassBootstrap,compass]
  },
  dist: {
    options: noSourceMap,
    files: [toDist]
  },
  production: {
    // Production writes into .tmp so that cssmin:generated has files to work from.
    options: noSourceMap,
    files: [toTmp]
  },
  serve: {
    files: [toTmp]
  },
  test: {
  }
};
