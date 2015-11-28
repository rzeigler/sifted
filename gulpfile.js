(function (gulp, mocha, gutil) {
    gulp.task('test', function () {
        return gulp.src('./tests/*.js', {read: false})
        .pipe(mocha({reporter: 'landing'}))
        .on('error', gutil.log);
    });
}(
    require('gulp'),
    require('gulp-mocha'),
    require('gulp-util')
));
