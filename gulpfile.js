'use strict'
// include gulp
var gulp = require('gulp');
var run = require('gulp-run');

//tasks
gulp.task('run', function() {
    return run('electron .').exec();
});