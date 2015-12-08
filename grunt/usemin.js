module.exports = {
  html: ['dist/{,*/}*.html'],
  options: {
    assetsDirs: ['dist'],
    blockReplacements: {
      dontmin: function (block) {
        return '<script src="' + block.dest + '"></script>';
      }
    }
  }
};