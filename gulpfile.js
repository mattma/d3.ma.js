'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');
var $ = require('gulp-load-plugins')({
  pattern: ['gulp-*'],
  scope: ['devDependencies']
});
var streamqueue  = require('streamqueue');
var server = require('tiny-lr')();
var path = require('path');

var jsSrcFiles = [
  'gulpfile.js',
  'src/**/*.js',
  '!src/*.js'
];
var destPath = 'build';

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
  return streamqueue({objectMode: true},
      gulp.src('src/intro.js'),

      gulp.src('src/lib/d3chart.js'),
      gulp.src('src/common/core.js'),
      gulp.src('src/common/utils.js'),
      gulp.src('src/common/container.js'),
      gulp.src('src/components/clippath.js'),

      gulp.src('src/core/scale.js'),
      gulp.src('src/core/base.js'),

      gulp.src('src/components/axis.js'),

      gulp.src('src/basic/bars.js'),
      gulp.src('src/basic/line.js'),
      gulp.src('src/basic/area.js'),
      gulp.src('src/basic/circle.js'),
      gulp.src('src/basic/tree.js'),
      gulp.src('src/basic/simpleLine.js'),
      gulp.src('src/basic/diagonalLine.js'),

      gulp.src('src/outro.js')
    )
    .pipe($.concat('d3.ma.js'))
    .pipe($.babel({
      blacklist: ['useStrict']
    }))
    .pipe(gulp.dest(destPath));
});

// @describe build out the library
gulp.task('build', ['buildjs'], function () {
  return gulp.src('d3.ma.js')
    .pipe($.uglify())
    .pipe($.concat('d3.ma.min.js'))
    .on('end', function () {
      gutil.log(gutil.colors.green(
        '[-done:] d3.ma.js and d3.ma.min.js has been generated!'));
    })
    .pipe(gulp.dest(destPath));
});

gulp.task('release', ['releaseServer'], function () {
  // reset the development libraries
  gulp.start('envDev');
});

gulp.task('test', ['prepareTests'], function () {
  $.watch('build/tests/*.js', rerunTest);
  return rerunTest();
});

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

// when develop the library, it should always run in `gulp serve`
// it will watch the source files change, build a new development
// js file at `build/d3.ma.js`. includes Babel supports
gulp.task('serve', ['buildjs'], function () {
  server.listen(35729, function (err) {
    if (err) {
      return gutil.log('\n[-log]', gutil.colors.red(err));
    }
    $.watch('src/**/*.js', rebuildProject);
  });
});

gulp.task('default', ['serve']);
