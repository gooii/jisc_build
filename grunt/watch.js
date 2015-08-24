module.exports = {
    options: {
        livereload: '<%= connect.livereload.options.livereload %>'
    },
    html: {
        files: [
            // reload if the index.html or any other root html file changes
            //
            'app/{,*/}*.html',
            // reload if any partials change
            //
            'app/partials/**/{,*/}*.html'
        ]
    },
    sass: {
        files: [
            // trigger compass tasks if either our search app sass changes
            //
            'app/styles/{,*/}*.{scss,sass}'
        ],
        tasks: ['sass:serve', 'bless:serve', 'autoprefixer']
    },
    coffee: {
        // recompile coffee script for our search app
        //
        files: ['app/scripts/**/{,*/}*.coffee'],
        tasks: ['coffee']
    },
    gruntfile: {
        files: ['Gruntfile.js']
    }
};
