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
    serve: {
        files: [{
            dot: true,
            src: [
                /* always clean out .tmp folder */
                '.tmp'
            ]
        }]
    },
    preproduction_html: {
      files:[{
        src:['dist/index.html']
      }]
    },
    production_html: {
      files:[{
        src:['dist/index.html']
      }]
    }
};
