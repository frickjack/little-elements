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
const mkdirp = require( 'mkdirp' );
 
  

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
  console.log("Clean all files in build folder");

  return gulp.src("build/*", { read: false }).pipe(clean());
});

gulp.task( 'compilejs', [], function() {
    gulp.src( "src/**/*.js" )
        //.pipe(rev())
        .pipe(gulp.dest("build/"));
        /*
        .pipe(rev.manifest( "build/rev-manifest.json", {
            base: "./build/",
            merge: true
        }))
        .pipe( gulp.dest( "build/" ) );
        */
});

//
// Server side templating with nunjucks
// see https://zellwk.com/blog/nunjucks-with-gulp/
// Also incorporating markdown support with nunjucks-markdown.
//
gulp.task('compilenunjucks', [ "compilejs", "compilets", "compilecss" ], function() {
    //const manifest = gulp.src( "./build/" + revManifestPath);
    gulp.src( ["src/**/*.html"] )
    .pipe( nunjucksRender( { manageEnv:nunjucksManageEnv, envOptions:{autoescape:false}, path: [ "src" ] } ) ) // path: [ "src/templates" ], 
    .on('error', console.log);
    /*
    .pipe(revReplace({manifest: manifest} ))
    .pipe(gulp.dest("build/"));
    */
});

/*
gulp.task("revreplace", ["revision"], function(){
  var manifest = gulp.src("./" + opt.distFolder + "/rev-manifest.json");

  return gulp.src(opt.srcFolder + "/index.html")
    .pipe(revReplace({manifest: manifest}))
    .pipe(gulp.dest(opt.distFolder));
});
*/

gulp.task('compilehtml', [ 'compilenunjucks'], function() {
    gulp.src(["src/**/*.json" ]).pipe(gulp.dest("build/"));
});


gulp.task('compilecss', [], function() {
    gulp.src("src/**/*.css")
        .pipe( gulp.dest( "build/" ) );
        /*
        .pipe(rev())
        .pipe( gulp.dest( "build/" ) )
        //.pipe( debug({title:'compilecss'}))
        .pipe( rev.manifest( "build/rev-manifest.json", {
            base: "build",
            merge: true
        }))
        .pipe( gulp.dest("build/"));
        */
});

gulp.task('compileimg', [], function() {
    gulp.src( "src/resources/img/**/*" ).pipe( gulp.dest( "build/resources/img" ) );
});

gulp.task('compilebower', [], function() {
    gulp.src( ["node_modules/jasmine-core/**/*", "node_modules/font-awesome/**/*", "node_modules/webcomponentsjs/**/*"], 
            { base:"node_modules" }  ).pipe( gulp.dest( "build/3rdParty" ) 
            );
});

// add revision-hash to js and css file names


var tsConfig = {
    //noImplicitAny: true,
    target: "es6",
    sourceMap: true
    // declaration: true
};

gulp.task( 'compilets', [], function() {
    return gulp.src( ['src/**/*.ts'], 
            { base:"src" })
        //.pipe( sourcemaps.init() )
        .pipe(ts( tsConfig ))
        .js
        //.pipe( sourcemaps.write( "./maps" ) )
        .pipe(gulp.dest("build/"));
        /*
        .pipe( rev() )
        .pipe(gulp.dest("build/"))
        //.pipe( debug({title:'compilets'}))
        .pipe( rev.manifest( "build/rev-manifest.json", {
            base: "build",
            merge: true
        }  ))
        .pipe( gulp.dest( "build/" ) );
        */
});


gulp.task('compile', [ 'compilehtml', 'compileimg', 'compilebower' ], function() {
  // place code for your default task here
  //console.log( "Hello, World!" );
  //gulp.src( "src/**/*" ).pipe( gulp.dest( "build/" ) );
});

gulp.task('default', [ 'compile' ], function() {
  // place code for your default task here
  //console.log( "Hello, World!" );
  //gulp.src( "src/**/*" ).pipe( gulp.dest( "build/" ) );
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
        pwdPath + ":/mnt/workspace' " + imageName + " -copy /mnt/workspace/build/ s3://apps.frickjack.com/";

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
