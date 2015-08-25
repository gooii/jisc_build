module.exports = {
  options: {
    singleQuotes: true
  },
    dist: {
        files: [
            {
                expand: true,
                cwd: '.tmp/concat/scripts',
                src: '*.js',
                dest: '.tmp/concat/scripts'
            }
        ]
  },
  lib: {
    files: [
      {
        expand: true,
        cwd: '.tmp/concat/',
        src: '*.js',
        dest: 'lib'
      }
    ]
    }
};

