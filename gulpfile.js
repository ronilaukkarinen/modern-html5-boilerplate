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
var minifyhtml  = require('gulp-htmlmin');
var runSequence = require('run-sequence');
var exec        = require('child_process').exec;

/*

ERROR HANDLING
==============
*/


var handleError = function(task) {
  return function(err) {

      notify.onError({
        message: task + ' failed, check the logs..',
        sound: true
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
var sassFile = 'src/sass/layout/layout.scss';
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
      imgDest + '/*.{png,jpg,jpeg,gif}',
      jsSrc + '/**/*.js',
      markupSrc
    ];

    browserSync.init(files, {
        proxy: "modern-html5-boilerplate.dev",
        browser: "Google Chrome",
        notify: true
    });
});

/*

STYLES
======
*/

gulp.task('styles', function() {
  gulp.src(sassFile)

  .pipe(sass({
    compass: false,
    bundleExec: true,
    sourcemap: false,
    style: 'compressed',
    debugInfo: true,
    lineNumbers: true,
    errLogToConsole: true,
    includePaths: [
      'node_modules/',
      // 'bower_components/',
      // require('node-bourbon').includePaths
    ],
  }))

  .on('error', handleError('styles'))
  .pipe(prefix('last 3 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4')) //adds browser prefixes (eg. -webkit, -moz, etc.)
  .pipe(minifycss({keepBreaks:false,keepSpecialComments:0,}))
  .pipe(pixrem())
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
          'node_modules/jquery/dist/jquery.js',
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
});

/*

WATCH
=====

Notes:
   - browserSync automatically reloads any files
     that change within the directory it's serving from
*/

// Run the JS task followed by a reload
gulp.task('js-watch', ['js'], browserSync.reload);

gulp.task('watch', ['browserSync'], function() {

  gulp.watch(sassSrc, ['styles']);
  gulp.watch(imgSrc, ['images']);
  gulp.watch(markupSrc, ['minify-html']);
  gulp.watch(jsSrc + '/**/*.js', ['js-watch']);
});
