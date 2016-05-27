var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var gutil = require('gulp-util');

gulp.task('browserify', function () {


    return browserify(['edit/src/index.js'])
        .transform('babelify', { presets: ['react'] })
        .bundle()
        .pipe(source('pagespace-gallery.js'))
        .pipe(gulp.dest('edit/dist'));
});

gulp.task('default', [ 'browserify' ], function() {

});

gulp.task('watch', [ 'browserify' ], function() {
    gulp.watch('edit/src/**/*.js', ['browserify']).on('error', gutil.log);
});


