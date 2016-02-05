module.exports = {
  dist: {
    files: [{
      dot: true,
      src: [
        '.tmp',
        'dist/*',
        '!dist/.git*'
      ]
    }]
  },
  local: {
    files: [{
      dot: true,
      src: [
        'dist'
      ]
    }]
  },
  tmp: {
    files: [{
      dot: true,
      src: [
        /* always clean out .tmp folder */
        '.tmp'
      ]
    }]
  },
  lib: {
    files: [{
      dot: true,
      src: [
        '.tmp',
        'lib/*',
        '!lib/.git*'
      ]
    }]
  },
  development_html: {
    files: [{
      src: ['dist/index.html']
    }]
  },
  staging_html: {
    files: [{
      src: ['dist/index.html']
    }]
  },
  production_html: {
    files: [{
      src: ['dist/index.html']
    }]
  }
};
