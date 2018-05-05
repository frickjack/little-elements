const gulp = require('gulp');
const gulpSequence = require('gulp-sequence');
const debug = require('gulp-debug');
const rev = require('gulp-rev');
const revReplace = require('gulp-rev-replace');
const revManifestPath = "rev-manifest.json";
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
  console.log("Clean all files in lib folder");

  return gulp.src("lib/*", { read: false }).pipe(clean());
});

gulp.task( 'compilejs', [], function() {
    gulp.src( "src/**/*.js" )
        //.pipe(rev())
        .pipe(gulp.dest("lib/"));
        /*
        .pipe(rev.manifest( "lib/rev-manifest.json", {
            base: "./lib/",
            merge: true
        }))
        .pipe( gulp.dest( "lib/" ) );
        */
});

//
// Server side templating with nunjucks
// see https://zellwk.com/blog/nunjucks-with-gulp/
// Also incorporating markdown support with nunjucks-markdown.
//
gulp.task('compilenunjucks', [ "compilejs", "compilets", "compilecss" ], function() {
    //const manifest = gulp.src( "./lib/" + revManifestPath);
    gulp.src( ["src/**/*.html"] )
    .pipe( nunjucksRender( { manageEnv:nunjucksManageEnv, envOptions:{autoescape:false}, path: [ "src" ] } ) ) // path: [ "src/templates" ], 
    .on('error', console.log);
    /*
    .pipe(revReplace({manifest: manifest} ))
    .pipe(gulp.dest("lib/"));
    */
});


gulp.task('compilehtml', [ 'compilenunjucks'], function() {
    gulp.src(["src/**/*.json" ]).pipe(gulp.dest("lib/"));
});


gulp.task('compilecss', [], function() {
    gulp.src("src/**/*.css")
        .pipe( gulp.dest( "lib/" ) );
        /*
        .pipe(rev())
        .pipe( gulp.dest( "lib/" ) )
        //.pipe( debug({title:'compilecss'}))
        .pipe( rev.manifest( "lib/rev-manifest.json", {
            base: "lib",
            merge: true
        }))
        .pipe( gulp.dest("lib/"));
        */
});

gulp.task('compileimg', [], function() {
    gulp.src( "src/resources/img/**/*" ).pipe( gulp.dest( "lib/resources/img" ) );
});

gulp.task('compilebower', [], function() {
    let modList = [ "jasmine-core", "lit-html", "font-awesome", "webcomponentsjs" ];
    gulp.src( modList.map( name => `node_modules/${name}/**/*` ),
            { base:"node_modules" }  
        ).pipe( gulp.dest( "lib/3rdParty" ) );
});

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
            { base:"src/@littleware/little-elements/lib" })
        .pipe( sourcemaps.init() )
        .pipe(ts( tsConfig ));
    return merge(
        tsResult.pipe(sourcemaps.write('maps/')).pipe(gulp.dest("lib/")),
        tsResult.js.pipe(gulp.dest("lib/")),
        tsResult.dts.pipe(gulp.dest("lib/"))
    );
});

/*
pipe(rename(
    function(path){
        path.extname = '.mjs';
    }
)).
*/

gulp.task('compile', [ 'compilehtml', 'compileimg' ], function() {
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
    return gulp.watch('src/**/*.ts', [ 'compilehtml' ] );
});

gulp.task( 'watchhtml', function () {
   return gulp.watch( 'src/**/*.html', [ 'compilehtml' ] );     
});

gulp.task( 'watchcss', function () {
   return gulp.watch( 'src/**/*.css', [ 'compilehtml' ] );     
});

gulp.task( 'watch', [ 'watchts', 'watchhtml', 'watchcss' ], function() {
});

gulp.task( 'compileclean', function(cb) {
    return gulpSequence( 'clean', 'compile', 'makeico' )(cb);
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
