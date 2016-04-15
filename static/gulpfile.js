var gulp = require('gulp');
var babel = require('gulp-babel');
var gutil = require('gulp-util');

gulp.task('jsx', function() {
    return gulp.src('edit/src/**/*.jsx')
        .pipe(babel({
            presets: ['react']
        }))
        .pipe(gulp.dest('edit/dist'));
});

gulp.task('default', [ 'jsx' ], function() {

});

gulp.task('watch', [ 'jsx' ], function() {
    gulp.watch('edit/src/**/*.jsx', ['jsx']).on('error', gutil.log);
});


