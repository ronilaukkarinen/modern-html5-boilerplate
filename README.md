# Modern HTML5 Boilerplate

In need of a simple landing pages or static websites? Then this extremely minimal Modern HTML5 Boilerplate might be just for you.

## Features

- Support for HTML minification
- Cache support, disabled by default
- Automatic JS/CSS minification, uglify, combine, compress and concat with [Gulp](http://gulpjs.com/)
- Stylesheet language: [SCSS](http://sass-lang.com/) (libsass)
- Flexible SCSS grid included: [Jeet Grid](http://jeet.gs/)
- Responsive typography with viewport units

![](https://rolle.design/mhb-2018.png "Screenshot")

## Installation

1. `git clone https://github.com/ronilaukkarinen/modern-html5-boilerplate yourprojectname`
2. If you add your project to git, remember to remove `.git` folder with `rm -rf .git`
3. `npm-check-updates -u` to update Node.JS modules (you need [npm-check-updates](https://www.npmjs.com/package/npm-check-updates) for this)
4. `npm install` to install them
5. Edit `package.json` and `gulpfile.js` and rename project name and author according to your new project
6. `gulp watch` and start coding your static website (you might want to change meta tags and `_config.scss` variables first)

Start with `src/sass/layout/_main.scss`.

**Have fun!**
