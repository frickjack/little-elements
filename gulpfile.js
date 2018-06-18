const gulp = require('gulp');
const gulpHelper = require('./gulpHelper');
const basePath = "src/@littleware/little-elements";


gulpHelper.defineTasks( { basePath } );

gulp.task('default', [ 'little-compile' ], function() {
    // place code for your default task here
    //console.log( "Hello, World!" );
    //gulp.src( "src/**/*" ).pipe( gulp.dest( "lib/" ) );
    });
