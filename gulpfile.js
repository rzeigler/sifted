(function (gulp, mocha, eslint, run, gutil) {
    'use strict';
    gulp.task('test', function () {
        return gulp.src('./tests/*.js', {read: false})
            .pipe(mocha({reporter: 'spec'}))
            .on('error', gutil.log);
    });

    gulp.task('lint', function () {
        return gulp.src(['./src/*.js', './tests/*.js'])
            .pipe(eslint())
            .pipe(eslint.format())
            .pipe(eslint.failAfterError());
    });

    gulp.task('default', function (cb) {
        run('lint', 'test', cb);
    });
}(
    require('gulp'),
    require('gulp-mocha'),
    require('gulp-eslint'),
    require('run-sequence'),
    require('gulp-util')
));
