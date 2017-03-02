# Modern HTML5 Boilerplate

In need of a simple landing pages or static websites? Then Modern HTML5 Boilerplate might be just for you.

![](https://dl.dropboxusercontent.com/u/18447700/modern17.png "Screenshot")

## Features

- Automatic JS/CSS minification, uglify, combine, compress and concat with [Gulp](http://gulpjs.com/)
- Stylesheet language: [SCSS](http://sass-lang.com/) (libsass)
- Flexible SCSS grid: [Jeet Grid](http://jeet.gs/)
- Responsive typography with viewport units

## Installation

1. `git clone https://github.com/ronilaukkarinen/modern-html5-boilerplate yourprojectname`
2. If you add your project to git, remember to remove `.git` folder with `rm -rf .git`
3. `npm-check-updates -u` to update Node.JS modules (you need [npm-check-updates](https://www.npmjs.com/package/npm-check-updates) for this)
4. `npm install` to install them
5. Edit `package.json` and `gulpfile.js` and rename project name and author according to your new project
6. `gulp watch` and start coding your static website (you might want to change meta tags and `_config.scss` variables first)

Start with `src/sass/layout/_landing.scss`.

Basic HTML structure goes like this:

````
<div class="slide slide-something">
  <div class="container">
    <h1>This is a container.</h1>
    <p>This is a container text.</p>
  </div><!-- .container -->
</div><!-- .slide -->
````

Where basic SCSS structure be like:

````
.slide {
  &.slide-hero {
    // Do something

    .container {
      // Do something

      h1,
      p {
        color: #222;
      }
    }
  }
}
````

**Have fun!**
