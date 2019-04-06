//const gulp = require('gulp');
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

const defaultData = {
    jsroot: '/modules'
};

/**
 * Define gulp tasks for building the
 * typescript and nunjucks resources under
 * config.basePath 
 *     (ex: { basePath: src/@littleware/little-elements, jsroot: /modules })
 * 
 * @param {basePath, data} config where basePath is the gulp.src basePath, 
 *       and data object holds variables passed to nunjucks templates 
 */
module.exports.defineTasks = function(gulp, config) {
    config = config || {};
    config.data = config.data || {};
    let { basePath, data } = config;
    if ( ! basePath ) {
        console.log( "ERROR: basePath must be configured" );
        return;
    }
    data = { ...defaultData, ...data };

    // register markdown support with nunjucks
    const nunjucksManageEnv = function(env) {
        // The second argument can be any function that renders markdown 
        markdown.register(env, marked);
    };

    //var env = new nunjucks.Environment(new nunjucks.FileSystemLoader("."));
    //markdown.register(env, marked);

    //var tsProject = ts.createProject("tsconfig.json");
    //var watch = require( 'gulp-watch' );

    gulp.task('little-clean', function() {
        console.log('Clean all files in lib/, bin/, and site/ folders');
        return gulp.src(
            ['bin', 'dist', 'lib', 'maps', 'site', 'dist'],
            { read: false, allowEmpty: true }
         ).pipe(clean());
    });

    //
    // Server side templating with nunjucks
    // see https://zellwk.com/blog/nunjucks-with-gulp/
    // Also incorporating markdown support with nunjucks-markdown.
    //
    gulp.task( 'little-compilenunjucks', function() {
        return gulp.src( 
            [ basePath + '/**/*.html' ],
            { base: basePath }
        )
        .pipe( 
            nunjucksRender(
                {
                    data,
                    envOptions:{ autoescape: false }, 
                    manageEnv:nunjucksManageEnv, 
                    path: [ basePath, "node_modules/@littleware" ]
                }
            ) ) // path: [ "src/templates" ], 
        .on('error', console.log)
        .pipe(gulp.dest('.'));
    });

    gulp.task('little-compilehtml', gulp.series('little-compilenunjucks', function(done) { return done(); }));

    const tsConfig = {
        //noImplicitAny: true,
        target: "es6",
        //module: commonsjs,
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

    // compile the bin/ folder as nodejs modules
    gulp.task( 'little-compilets-bin', function() {
        const tsBinConfig = { ...tsConfig, module: "commonjs", moduleResolution: "Node" };
        //console.log(`Running with ${JSON.stringify(tsBinConfig)}`)
        const tsResult = gulp.src( [`${basePath}/bin/**/*.ts`], 
                { base: basePath })
            .pipe(ts( tsBinConfig ));
        return merge(
            tsResult.js.pipe(gulp.dest("./")),
            tsResult.dts.pipe(gulp.dest("./"))
        );
    });

    // compile all folders except bin/ as es2015 modules
    gulp.task( 'little-compilets', function() {
        const tsResult = gulp.src( ['src/**/*.ts', `!${basePath}/bin/**/*.ts`], 
                { base: basePath })
            .pipe( sourcemaps.init() )
            .pipe(ts( tsConfig ));
        return merge(
            tsResult.pipe(sourcemaps.write('maps/')).pipe(gulp.dest("./")),
            tsResult.js.pipe(gulp.dest("./")),
            tsResult.dts.pipe(gulp.dest("./"))
        );
    });

    /** Copy site/resources/img/ images over */
    gulp.task( 'little-compileimg', function() {
        return gulp.src( basePath + '/site/resources/img/**/*' ).pipe( gulp.dest( "site/resources/img" ) );
    });

    /** Copy nunjucks templates over */
    gulp.task( 'little-copynjk', function() {
        return gulp.src( basePath + '/lib/**/*.njk' ).pipe( gulp.dest( "lib/" ) );
    });

    gulp.task

    gulp.task('little-compile', gulp.series('little-compilehtml', 'little-compilets', 'little-compilets-bin', 'little-compileimg', 'little-copynjk', function(done) {
    // place code for your default task here
    //console.log( "Hello, World!" );
    //gulp.src( "src/**/*" ).pipe( gulp.dest( "lib/" ) );
        return done();
    }));

    gulp.task('little-watchts', function () {
        // Endless stream mode 
        return gulp.watch('src/**/*.ts', gulp.series('little-compilets', 'little-compilets-bin') );
    });

    gulp.task('little-watchhtml', function () {
        return gulp.watch( ['src/**/*.html', 'src/**/*.css', 'src/**/*.njk'], gulp.series('little-compilehtml') ); 
    });


    gulp.task('little-watch', gulp.parallel('little-watchts', 'little-watchhtml', function(done) {
        return done();
    }));

    gulp.task( 'little-compileclean', gulp.series('little-clean', 'little-compile'));
}
