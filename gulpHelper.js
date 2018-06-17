const gulp = require('gulp');
const gulpSequence = require('gulp-sequence');
const debug = require('gulp-debug');
const clean = require('gulp-rimraf');
const ts = require('gulp-typescript');
const markdown = require('nunjucks-markdown');
const marked = require('marked');
const nunjucksRender = require('gulp-nunjucks-render');
const sourcemaps = require('gulp-sourcemaps');
const exec = require('child_process').exec;
const mkdirp = require('mkdirp');
const merge = require('merge2');
const rename = require('gulp-rename');

/**
 * Define gulp tasks for building the
 * typescript and nunjucks resources under
 * config.basePath 
 *     (ex: { basePath: src/@littleware/little-elements })
 * 
 * @param {basePath} config 
 */
module.exports.defineTasks = function(config) {
    config = config || {};
    let { basePath } = config;
    if ( ! basePath ) {
        console.log( "ERROR: basePath must be configured" );
        return;
    }

    // register markdown support with nunjucks
    const nunjucksManageEnv = function(env) {
        // The second argument can be any function that renders markdown 
        markdown.register(env, marked);
    };

    //var env = new nunjucks.Environment(new nunjucks.FileSystemLoader("."));
    //markdown.register(env, marked);

    //var tsProject = ts.createProject("tsconfig.json");
    //var watch = require( 'gulp-watch' );

    gulp.task('clean', [], function() {
        console.log('Clean all files in lib/, bin/, and site/ folders');
        return gulp.src( ['bin/*', 'lib/*', 'maps/*', 'site/*'], { read: false }).pipe(clean());
    });


    gulp.task('compilehtml', [ 'compilenunjucks' ], function() {});

    // add revision-hash to js and css file names
    var tsConfig = {
        //noImplicitAny: true,
        target: "es6",
        module: "es2015",
        //moduleResolution: "Node",
        sourceMap: true,
        declaration: true,
        baseUrl: "src", // This must be specified if "paths" is.
        //paths: {
        //    "*.mjs": ["*", "*.ts"]
        //},
        rootDirs: [
            "src",
            "node_modules"
        ]
        // declaration: true
    };

    gulp.task( 'compilets', [], function() {
        const tsResult = gulp.src( ['src/**/*.ts'], 
                { base: basePath })
            .pipe( sourcemaps.init() )
            .pipe(ts( tsConfig ));
        return merge(
            tsResult.pipe(sourcemaps.write('maps/')).pipe(gulp.dest("./")),
            tsResult.js.pipe(gulp.dest("./")),
            tsResult.dts.pipe(gulp.dest("./"))
        );
    });

    //
    // Server side templating with nunjucks
    // see https://zellwk.com/blog/nunjucks-with-gulp/
    // Also incorporating markdown support with nunjucks-markdown.
    //
    gulp.task( 'compilenunjucks', [], function() {
        gulp.src( 
            [ basePath + '/**/*.html' ],
            { base: basePath }
        )
        .pipe( 
            nunjucksRender(
                {
                    manageEnv:nunjucksManageEnv, 
                    envOptions:{autoescape:false}, 
                    path: [ basePath + '/lib' ]
                }
            ) ) // path: [ "src/templates" ], 
        .on('error', console.log)
        .pipe(gulp.dest('.'));
    });

    gulp.task('compile', [ 'compilehtml', 'compilets' ], function() {
    // place code for your default task here
    //console.log( "Hello, World!" );
    //gulp.src( "src/**/*" ).pipe( gulp.dest( "lib/" ) );
    });

    gulp.task('default', [ 'compile' ], function() {
    // place code for your default task here
    //console.log( "Hello, World!" );
    //gulp.src( "src/**/*" ).pipe( gulp.dest( "lib/" ) );
    });

    gulp.task('watchts', function () {
        // Endless stream mode 
        return gulp.watch('src/**/*.ts', [ 'compilets' ] );
    });

    gulp.task( 'watchhtml', function () {
        return gulp.watch( ['src/**/*.html', 'src/**/*.css'], [ 'compilehtml' ] );     
    });


    gulp.task( 'watch', [ 'watchts', 'watchhtml' ], function() {
    });

    gulp.task( 'compileclean', function(cb) {
        return gulpSequence( 'clean', 'compile' )(cb);
    });

    gulp.task( 'deploy', [ 'compileclean' ], function(cb) {
        const pwdPath = process.cwd();
        const imageName = "frickjack/s3cp:1.0.0";
        const commandStr = "yes | docker run --rm --name s3gulp -v littleware:/root/.littleware -v '" +
            pwdPath + ":/mnt/workspace' " + imageName + " -copy /mnt/workspace/lib/ s3://apps.frickjack.com/";

        console.log( "Running: " + commandStr );

        exec( commandStr, 
            function (err, stdout, stderr) {
                console.log(stdout);
                console.log(stderr);
                if ( err ) {
                    //reject( err );
                } else {
                    cb();
                }
            }
        );
    });
}
