module.exports = {
  tmp: {
    options: {
      cacheBuster: false,
      force: true
    },
    files: {
      '.tmp/styles/style.css': '.tmp/styles/style.css'
    }
  },
  dist: {
    options: {
      cacheBuster: true,
      force: true
    },
    files: {
      'dist/styles/style.css': 'dist/styles/style.css'
    }
  },
  local: {
    options: {
      cacheBuster: false,
      force: true
    },
    files: {
      'dist/styles/style.css': 'dist/styles/style.css'
    }
  }
};
