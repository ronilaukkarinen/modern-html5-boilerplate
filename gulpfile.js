/* 

REQUIRED STUFF
==============
*/

var changed     = require('gulp-changed');
var gulp        = require('gulp');
var imagemin    = require('gulp-imagemin');
var sass        = require('gulp-sass');
var sourcemaps  = require('gulp-sourcemaps');
var browserSync = require('browser-sync').create();
var notify      = require('gulp-notify');
var prefix      = require('gulp-autoprefixer');
var minifycss   = require('gulp-minify-css');
var uglify      = require('gulp-uglify');
var cache       = require('gulp-cache');
var concat      = require('gulp-concat');
var util        = require('gulp-util');
var header      = require('gulp-header');
var pixrem      = require('gulp-pixrem');
var pagespeed   = require('psi');
var minifyhtml  = require('gulp-htmlmin');
var runSequence = require('run-sequence');
var exec        = require('child_process').exec;


/* 

ERROR HANDLING
==============
*/

var beep = function() {
  var os = require('os');
  var file = '/Users/rolle/gulp_error.wav';
  if (os.platform() === 'linux') {
    // linux
    exec("aplay " + file);
  } else {
    // mac
    console.log("afplay -v 3 " + file);
    exec("afplay -v 3 " + file);
  }
};

var handleError = function(task) {
  return function(err) {
    beep();
    
      notify.onError({
        message: task + ' failed, check the logs..',
        sound: false
      })(err);
    
    util.log(util.colors.bgRed(task + ' error:'), util.colors.red(err));
  };
};

/* 

FILE PATHS
==========
*/

var imgSrc = 'src/images/*.{png,jpg,jpeg,gif}';
var imgDest = 'dist/images';
var sassSrc = 'src/sass/**/*.{sass,scss}';
var sassFile = 'src/sass/layout.scss';
var cssDest = 'dist/css';
var jsSrc = 'src/js';
var jsDest = 'dist/js';
var markupSrc = 'src/*.php';
var markupDest = 'dist';

/* 

BROWSERSYNC
===========
*/

gulp.task('browserSync', function() {

    var files = [
      cssDest + '/**/*.{css}',
      jsSrc + '/**/*.js',
      imgDest + '/*.{png,jpg,jpeg,gif}',
      markupSrc
    ];

    browserSync.init(files, {
        proxy: "PROJECTNAME.dev",
        browser: "Google Chrome Canary",
        notify: false
    });
});


/* 

RELOAD
====
*/

gulp.task('refresh', function() {
  gulp.src(cssDest)
    .pipe(browserSync.stream());
  });


/* 

STYLES
======
*/

gulp.task('styles', function() {
  gulp.src(sassFile)

  .pipe(sourcemaps.init())

  .pipe(sass({
    outputStyle: 'compressed'
  }))

  .on('error', handleError('styles'))
  .pipe(prefix('last 3 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4')) //adds browser prefixes (eg. -webkit, -moz, etc.)
  .pipe(minifycss({keepBreaks:false,keepSpecialComments:0,}))
  .pipe(pixrem())
  .pipe(sourcemaps.write('./'))
  .pipe(gulp.dest(cssDest))
  .pipe(browserSync.stream());

  });


/* 

IMAGES
======
*/


gulp.task('images', function() {
  var dest = imgDest;

  return gulp.src(imgSrc)

    .pipe(changed(dest)) // Ignore unchanged files
    .pipe(cache(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true }))) //use cache to only target new/changed files, then optimize the images
    .pipe(gulp.dest(imgDest));

});


/* 

SCRIPTS
=======
*/

var currentDate   = util.date(new Date(), 'dd-mm-yyyy HH:ss');
var pkg           = require('./package.json');
var banner        = '/*! <%= pkg.name %> <%= currentDate %> - <%= pkg.author %> */\n';

gulp.task('js', function() {

      gulp.src(
        [
          'bower_components/jquery/dist/jquery.js',
          'bower_components/respond-minmax/src/respond.js',
          jsSrc + '/scripts.js',
        ])
        .pipe(concat('all.js'))
        .pipe(uglify({preserveComments: false, compress: true, mangle: true}).on('error',function(e){console.log('\x07',e.message);return this.end();}))
        .pipe(header(banner, {pkg: pkg, currentDate: currentDate}))
        .pipe(gulp.dest(jsDest));
});


/* 

MARKUP
=======
*/

gulp.task('minify-html', function() {
  gulp.src(markupSrc)
    .pipe(minifyhtml({
      collapseWhitespace: true,
      removeComments: false,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
      minifyJS: true,
      minifyCSS: true
    }))
    .pipe(gulp.dest(markupDest))
    .pipe(reload);
});

/*

PAGESPEED
=====

Notes:
   - This runs Google PageSpeed Insights just like here http://developers.google.com/speed/pagespeed/insights/
   - You can use Google Developer API key if you have one, see: http://goo.gl/RkN0vE

*/

gulp.task('pagespeed', pagespeed.bind(null, {
  url: 'http://yoursite.com',
  strategy: 'mobile'
}));


/*

WATCH
=====

Notes:
   - browserSync automatically reloads any files
     that change within the directory it's serving from
*/

gulp.task('setWatch', function() {
  global.isWatching = true;
});

gulp.task('watch', ['setWatch', 'browserSync'], function() {
  gulp.watch(sassSrc, ['styles']);
  gulp.watch(imgSrc, ['images']);
  gulp.watch(markupSrc, ['minify-html', browserSync.reload]);
  gulp.watch(jsSrc + '/**/*.js', ['js', browserSync.reload]);
});

/* 
BUILD
=====
*/

gulp.task('build', function(cb) {
  runSequence('styles', 'js', 'minify-html', 'images', cb);
});

/* 
DEFAULT
=======
*/

gulp.task('default', function(cb) {
    runSequence(
    'images',
    'styles',
    'js',
    'minify-html',
    'browserSync',
    'watch',
    'refresh',
    cb
    );
});