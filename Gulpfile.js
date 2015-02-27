var gulp  = require('gulp')
,   babel = require('gulp-babel')
,   mocha = require('gulp-mocha');

gulp.task('build', function () {
  return gulp.src('lib/index.js')
    .pipe(babel())
    .pipe(gulp.dest('build'));
});

gulp.task('test', function () {
  return gulp.src('test/**/*.js')
    .pipe(mocha());
});

gulp.task('default', function () {
  gulp.watch('lib/**/*.js', ['build', 'test']);
  gulp.watch('test/**/*.js', ['test']);
});
