'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');
var $ = require('gulp-load-plugins')({
  pattern: ['gulp-*'],
  scope: ['devDependencies']
});
var streamqueue  = require('streamqueue');

var jsSrcFiles = [
  'gulpfile.js',
  'src/**/*.js',
  '!src/*.js'
];
var destPath = './';

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
