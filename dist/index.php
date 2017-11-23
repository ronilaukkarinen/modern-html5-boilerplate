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
