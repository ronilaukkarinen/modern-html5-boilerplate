/* 

REQUIRED STUFF
==============
*/

var changed     = require('gulp-changed');
var gulp        = require('gulp');
var imagemin    = require('gulp-imagemin');
var sass        = require('gulp-sass');
var browserSync = require('browser-sync');
var reload      = browserSync.reload;
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
var jshint      = require('gulp-jshint');
var minifyhtml  = require('gulp-htmlmin');
var exec        = require('gulp-exec');
var runSequence = require('run-sequence');

/* 

ERROR HANDLING
==============
*/

var handleErrors = function() {
module.exports = function() {

  var args = Array.prototype.slice.call(arguments);

  // Send error to notification center with gulp-notify
  notify.onError({
    title: "Compile Error",
    message: "<%= error.message %>"
  }).apply(this, args);

  // Keep gulp from hanging on this task
  this.emit('end');
};
};

/* 

FILE PATHS
==========
*/

var projectName = 'modern-html5-boilerplate'
var imgSrc = 'src/images/*.{png,jpg,jpeg,gif}';
var imgDest = 'dist/images';
var sassSrc = 'src/sass/**/*.{sass,scss}';
var sassFile = 'src/sass/layout.scss';
var cssDest = 'dist/css';
var jsSrc = 'src/js/**/*.js';
var jsDest = 'dist/js';
var markupSrc = 'src/*.php';
var markupDest = 'dist';

/* 

BROWSERSYNC
===========
*/

var devEnvironment = 'modern-html5-boilerplate.dev'
var hostname = '192.168.1.242' // Your IP address here
var localURL = 'http://' + devEnvironment;

gulp.task('browserSync', function () {

    // declare files to watch + look for files in assets directory (from watch task)
    var files = [
    cssDest + '/**/*.{css}',
    jsSrc,
    imgDest + '/*.{png,jpg,jpeg,gif}',
    markupSrc
    ];

    browserSync.init(files, {
    proxy: localURL,
    host: hostname,
    agent: false,
    browser: "Google Chrome Canary"
    });

});

/* 

RELOAD
====
*/

gulp.task('refresh', function() {
  gulp.src(cssDest)
    .pipe(reload({stream:true}));
  });


/* 

SASS
====
*/

gulp.task('sass', function() {
  gulp.src(sassFile)

  .pipe(sass({
    compass: false,
    bundleExec: true,
    sourcemap: false,
    style: 'compressed'
  })) 

  .on('error', handleErrors)
  .on('error', util.log)
  .on('error', util.beep)
  .pipe(prefix('last 3 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4')) //adds browser prefixes (eg. -webkit, -moz, etc.)
  .pipe(minifycss({keepBreaks:false,keepSpecialComments:0,}))
  .pipe(pixrem())
  .pipe(gulp.dest(cssDest))
  .pipe(reload({stream:true}));
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
          jsSrc + '/jquery-1.11.1.js',
          jsSrc + '/html5-3.6-respond-1.1.0.min.js',
          jsSrc + '/scripts.js'
        ])
        .pipe(concat('all.js'))
        .pipe(uglify({preserveComments: false, compress: true, mangle: true}).on('error',function(e){console.log('\x07',e.message);return this.end();}))
        .pipe(jshint.reporter('default'))
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
  url: 'http://' + projectName + '.fi',
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
  gulp.watch(sassSrc, ['sass']);
  gulp.watch(cssDest, ['refresh']);
  gulp.watch(imgSrc, ['images']);
  gulp.watch(markupSrc, ['minify-html', browserSync.reload]);
  gulp.watch(jsSrc, ['js', browserSync.reload]);
});

/* 
BUILD
=====
*/

gulp.task('build', function(cb) {
  runSequence('sass', 'js', 'minify-html', 'images', cb);
});

/* 
DEFAULT
=======
*/

gulp.task('default', function(cb) {
    runSequence(
    'images',
    'sass',
    'js',
    'minify-html',
    'browserSync',
    'watch',
    'refresh',
    cb
    );
});