# Modern HTML5 Boilerplate

In need of a simple landing pages or static websites? Then this extremely minimal Modern HTML5 Boilerplate might be just for you.

## Features

- Produces minified, static HTML files
- Automatic JS/CSS minification, uglify, combine, compress and concat with [Gulp](http://gulpjs.com/)
- Stylesheet language: [SCSS](http://sass-lang.com/) (libsass)
- Flexible SCSS grid included: [Jeet Grid](http://jeet.gs/)
- Responsive typography with viewport units
- SCSS and PHP linting built-in

![](https://rolle.design/mhb-2018.png "Screenshot")

## Installation

1. `git clone https://github.com/ronilaukkarinen/modern-html5-boilerplate yourprojectname`
2. If you add your project to git, remember to remove `.git` folder with `rm -rf .git`
3. `npm-check-updates -u` to update Node.JS modules (you need [npm-check-updates](https://www.npmjs.com/package/npm-check-updates) for this)
4. `npm install` to install them
5. Edit `package.json` and `gulpfile.js` and rename project name and author according to your new project
6. `gulp` and start coding your static website (you might want to change meta tags and `_config.scss` variables first)

Start with `src/sass/layout/_main.scss`.

**Have fun!**

## Alternative cache (with php)

Currently this produces static HTML pages via php2html, but you can disable gulp-php2html, gulp-htmlmin and enable semi-dynamic caching for your index.php, by adding this to dist/index.php:

```` php
<?php
// Settings
$cache = false;
$cache_lifetime_hours = 12;
$minifyhtml = true;
$cachefile = 'index.html';

// Minify HTML -function
function sanitize_output( $buffer ) {
  $search = array(
    '/\>[^\S ]+/s',     // strip whitespaces after tags, except space
    '/[^\S ]+\</s',     // strip whitespaces before tags, except space
    '/(\s)+/s',         // shorten multiple whitespace sequences
  );

  $replace = array(
    '>',
    '<',
    '\\1',
    '',
  );

  $buffer = preg_replace( $search, $replace, $buffer );
  return $buffer;
}

ob_start( 'sanitize_output' );

// Start cache tricks
if ( $cache === true ) :
  $cachetime = 3600 * $cache_lifetime_hours;
  if ( file_exists( $cachefile ) && time() - $cachetime < filemtime( $cachefile ) ) {
    echo '<!-- Amazing hand crafted super cache by rolle, generated ' . date( 'H:i', filemtime( $cachefile ) ) . ' -->';
    include( sanitize_output( $cachefile ) );
    exit;
  }
  ob_start();
endif;

// Content start
include('../src/index.php');

// End cache tricks
if ( $cache === true ) :
  $fp = fopen( $cachefile, 'w' );
  fwrite( $fp, sanitize_output( ob_get_contents() ) );
  fclose( $fp );
  ob_end_flush();
endif;
````
