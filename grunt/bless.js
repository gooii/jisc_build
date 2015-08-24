module.exports = {
    serve: {
        options: {
            cacheBuster: false
        },
        files: {
            '.tmp/styles/style.css':'.tmp/styles/style.css'
        }
    },
    dist: {
        options: {
            cacheBuster: true
        },
        files: {
            'dist/styles/style.css':'dist/styles/style.css'
        }
    }
};
