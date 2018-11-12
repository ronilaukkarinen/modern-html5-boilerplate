/*

REQUIRED STUFF
==============
*/

var gulp        = require('gulp');
var sass        = require('gulp-sass');
var sourcemaps  = require('gulp-sourcemaps');
var browsersync = require('browser-sync').create();
var notify      = require('gulp-notify');
var prefix      = require('gulp-autoprefixer');
var cleancss    = require('gulp-clean-css');
var uglify      = require('gulp-uglify-es').default;
var concat      = require('gulp-concat');
var util        = require('gulp-util');
var pixrem      = require('gulp-pixrem');
var exec        = require('child_process').exec;
var rename      = require('gulp-rename');
var stylefmt    = require('gulp-stylefmt');
var debug       = require('gulp-debug');
var scsslint    = require('gulp-scss-lint');
var php2html    = require('gulp-php2html');
var htmlmin     = require('gulp-htmlmin');
var phpcs       = require('gulp-phpcs');

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
var sassFile = 'src/sass/base/global.scss';
var cssDest = 'dist/css';
var srcDir = 'src';
var jsSrc = 'src/js';
var jsDest = 'dist/js';
var markupSrc = 'src/*.php';
var markupDist = 'dist/*.php';
var markupDest = 'dist';
var htmlSrc = 'src/*.html';

/*

BROWSERSYNC
===========
*/

gulp.task('browsersync', function() {

    var files = [
      imgDest + '/*.{png,jpg,jpeg,gif}',
      jsSrc + '/**/*.js',
      markupSrc,
      markupDist
    ];

    browsersync.init(files, {
        proxy: "modern-html5-boilerplate.test",
        browser: null,
        notify: true,
        open: "external",
        reloadDelay: 1000
    });
});

/*

STYLES
======
*/

var helpers = function( file ) {
    var currentdirectory = process.cwd() + '/';
    var modifiedfile = file.path.replace( currentdirectory, '' );
    var filename = modifiedfile.replace(/^.*[\\\/]/, '')
    var correctdir = modifiedfile.replace( filename, '' );

    gulp.src(modifiedfile)
        // Run current file through stylefmt
        .pipe(stylefmt({ configFile: '.stylelintrc' }))

        // Overwrite
        .pipe(gulp.dest(correctdir))
};

gulp.task('scss-lint', function() {
  gulp.src([sassSrc, '!sass/navigation/_burger.scss', '!sass/base/_normalize.scss'])
    .pipe(scsslint());
});

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
      'node_modules/'
    ],
  }))

  .on('error', handleError('styles'))
  .pipe(prefix('last 3 version', 'safari 5', 'ie 9', 'opera 12.1', 'ios 6', 'android 4')) // Adds browser prefixes (eg. -webkit, -moz, etc.)
  .pipe(pixrem())
  .pipe(cleancss({
    compatibility: 'ie11',
    level: {
      1: {
        tidyAtRules: true,
        cleanupCharsets: true,
        specialComments: 0
      }
    }
  }, function(details) {
      console.log('[clean-css] Time spent on minification: ' + details.stats.timeSpent + ' ms');
      console.log('[clean-css] Compression efficiency: ' + details.stats.efficiency * 100 + ' %');
  }))
  .pipe(rename({
    suffix: '.min'
  }))
  .pipe(gulp.dest(cssDest))
  .pipe(browsersync.stream());

  // Save expanded version
  gulp.src(sassFile)

  .pipe(sass({
    compass: false,
    bundleExec: true,
    sourcemap: false,
    style: 'expanded',
    debugInfo: true,
    lineNumbers: true,
    errLogToConsole: true,
    includePaths: [
      'bower_components/',
      'node_modules/',
      // require('node-bourbon').includePaths
    ],
  }))

  .on('error', handleError('styles'))
  .pipe(prefix('last 3 version', 'safari 5', 'ie 9', 'opera 12.1', 'ios 6', 'android 4')) // Adds browser prefixes (eg. -webkit, -moz, etc.)
  .pipe(pixrem())

  // Process the expanded output with Stylefmt
  .pipe(stylefmt({ configFile: './.stylelintrc' }))
  .pipe(gulp.dest(cssDest))
  .pipe(browsersync.stream());

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
          'node_modules/what-input/dist/what-input.js',
          jsSrc + '/scripts.js',
        ])
        .pipe(concat('all.js'))
        .pipe(uglify({
          compress: true,
          mangle: true}).on('error', function(err) {
            util.log(util.colors.red('[Error]'), err.toString());
            this.emit('end');
        }))
        .pipe(gulp.dest(jsDest));
});

/*

PHP
===
*/

gulp.task('php', function() {

  gulp.src(markupSrc)

    // Validate files using PHP Code Sniffer
    .pipe(phpcs({
      bin: '/usr/local/bin/phpcs',
      standard: 'phpcs.xml',
      warningSeverity: 0
    }))

    // Log all problems that was found
    .pipe(phpcs.reporter('log'))

    // Make dist HTML versions from php files
    .pipe(php2html())
    .pipe(gulp.dest(srcDir));

});

/*

HTML
====
*/

gulp.task('html', function() {

  gulp.src(htmlSrc)

    // Minify HTML
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest(markupDest));

});

/*

WATCH
=====

Notes:
   - browsersync automatically reloads any files
     that change within the directory it's serving from
*/

// Run the JS task followed by a reload
gulp.task('js-watch', ['js'], browsersync.reload);

gulp.task('watch', ['browsersync'], function() {

  gulp.watch(sassSrc, ['styles', 'scss-lint']).on( 'change', helpers );
  gulp.watch(jsSrc, ['js-watch']);
  gulp.watch(markupSrc, ['php']);
  gulp.watch(htmlSrc, ['html']);

});

/*

DEFAULT
=====

*/

gulp.task('default', ['watch']);
