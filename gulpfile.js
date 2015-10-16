'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');
var $ = require('gulp-load-plugins')({
  pattern: ['gulp-*'],
  scope: ['devDependencies']
});
var testem = new (require('testem'))();

var path = require('path');

var jsSrcFiles = [
  'gulpfile.js',
  'src/**/*.js'
];

var jsSrcFilesOrderList = [
  'src/intro.js',
  'src/lib/d3chart.js',
  'src/common/core.js',
  'src/common/utils.js',
  'src/common/container.js',
  'src/components/clippath.js',

  'src/core/scale.js',
  'src/core/base.js',

  'src/components/axis.js',

  'src/basic/bars.js',
  'src/basic/line.js',
  'src/basic/area.js',
  'src/basic/circle.js',
  'src/basic/tree.js',
  'src/basic/simpleLine.js',
  'src/basic/diagonalLine.js',

  'src/outro.js'
];

gulp.task('jshint', function () {
  return gulp.src(jsSrcFiles)
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'));
});

gulp.task('jscs', function () {
  return gulp.src(jsSrcFiles).pipe($.jscs());
});

// Lint will run code quality task: jscs and jshint
gulp.task('lint', ['jscs', 'jshint']);

// @describe compile es6 modules into amd modules
gulp.task('buildjs', function () {
  return gulp.src(jsSrcFilesOrderList)
    .pipe($.babel({
      blacklist: ['useStrict']
    }))
    .pipe($.concat('d3.ma.js'))
    .pipe(gulp.dest('./'));
});

// @describe build out the library
gulp.task('build', ['buildjs'], function () {
  gutil.log(
    gutil.colors.green('[-done:] d3.ma.js and d3.ma.min.js has been generated!')
  );
});

// copy all the core files and release to production
gulp.task('releaseClient',
  ['clean','lint', 'build'],
  function () {
    var src = 'client/index.html';
    var dest = 'build/client';
    var assets = $.useref.assets({searchPath: 'client'});

    // clean task has to be done
    // imagemin will minify all images and copy into build
    gulp.start('imagemin');

    return gulp.src(src)
      .pipe($.replace(
        /<script src="http:\/\/localhost:\d+\/livereload\.js\?snipver=\d+"><\/script>(\s+)?/g, ''))
      // handle file concatenation but not minification.
      // usage: <!-- build:js scripts/combined.js --><!-- endbuild -->
      .pipe(assets)
      // Concatenate And Minify JavaScript
      .pipe($.if('*.js', $.uglify({preserveComments: 'some'})))
      // Concatenate And Minify Styles
      .pipe($.if('*.css', $.csso()))
      .pipe(assets.restore())
      .pipe($.useref())
      .pipe($.if('*.html', $.minifyHtml()))
      .pipe(gulp.dest(dest));
    // .pipe($.size({title: '[-log:] client folder'}));
  });

gulp.task('release', ['releaseServer'], function () {
  // reset the development libraries
  gulp.start('envDev');
  gutil.log(
    gutil.colors.green('[-done:] Application has been successfully built at'),
    gutil.colors.magenta('~/build ')
  );
  gutil.log(
    gutil.colors.bold('[-copy:] => cd build '),
    gutil.colors.gray('# navigate to the freshly built application')
  );
  gutil.log(
    gutil.colors.bold('[-copy:] => npm install '),
    gutil.colors.gray('# install the dependencies in build folder')
  );
  gutil.log(
    gutil.colors.bold('[-copy:] => node server '),
    gutil.colors.gray('# running your application in production mode')
  );
});

gulp.task('test', ['prepareTests'], function () {
  $.watch('build/tests/*.js', rerunTest);
  return rerunTest();
});

// Notifies livereload of changes detected by `gulp.watch()`
function notifyLivereload (event) {
  // `gulp.watch()` events provide an absolute path
  //  make it relative path. Both relative and absolute should work
  var fileName = path.relative(__dirname, event.path);

  server.changed({
    body: {
      files: [fileName]
    }
  });
}

function rebuildProject (event) {
  switch (path.extname(event.path)) {
    case '.js' :
      gulp.start('buildjs');
      break;
    default :
      gulp.start('build');
      break;
  }
}

gulp.task('default', ['serve']);
