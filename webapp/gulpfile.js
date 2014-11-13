var gulp = require('gulp');
var gutil = require('gulp-util');
var source = require('vinyl-source-stream');
var watchify = require('watchify');
var browserify = require('browserify');
var reactify = require('reactify');
var connect = require('gulp-connect');
var concat = require('gulp-concat');
var del = require('del');

gulp.task('default', ['build']);

gulp.task('build', ['clean', 'html', 'css', 'js']);

gulp.task('clean', function(cb) {
  del([
    'dist/*',
  ], cb);
});

gulp.task('html', function() {
  gulp.src('./src/*.html')
    .pipe(gulp.dest('./dist'))
    .pipe(connect.reload());
});

gulp.task('css', function() {
  gulp.src([
    './node_modules/purecss/base.css',
    './node_modules/purecss/forms.css',
    './src/css/*.css'
    ])
    .pipe(concat('styles.css'))
    .pipe(gulp.dest('./dist/css'))
    .pipe(connect.reload());
});

gulp.task('js', function() {
  var bundler = browserify('./src/js/app.jsx', watchify.args);
  bundler.transform(reactify);
  return bundler.bundle()
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source('app.js'))
    .pipe(gulp.dest('./dist/js'));
});

gulp.task('server', ['build','connect', 'watch']);

gulp.task('connect', function() {
  connect.server({
    root: 'dist',
    livereload: true
  });
});

gulp.task('watch-js', function() {
  var bundler = watchify(browserify('./src/js/app.jsx', watchify.args));
  bundler.transform(reactify);
  bundler.on('update', rebundle);
  function rebundle() {
    return bundler.bundle()
      .on('error', gutil.log.bind(gutil, 'Browserify Error'))
      .pipe(source('app.js'))
      .pipe(gulp.dest('./dist/js/'))
      .pipe(connect.reload());
  }
  return rebundle();
});

gulp.task('watch', ['watch-js'], function() {
  gulp.watch(['./src/*.html'], ['html']);
  gulp.watch(['./src/css/*.css'], ['css']);
});