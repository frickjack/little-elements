const gulp = require('gulp');
const gulpHelper = require('./gulpHelper');
const basePath = "src/@littleware/little-elements";


gulpHelper.defineTasks(gulp, { basePath });

gulp.task('default', gulp.series('little-compile', (done) => {
    // place code for your default task here
    //console.log( "Hello, World!" );
    //gulp.src( "src/**/*" ).pipe( gulp.dest( "lib/" ) );
    done();
    }));
