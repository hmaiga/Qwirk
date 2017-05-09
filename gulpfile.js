/**
 * Created by Housseini  Maiga on 4/30/2017.
 */
let gulp = require('gulp'),
    spawn = require('child_process').spawn,
    node;

/**
 * $ gulp server
 * description: launch the server. If there's a server already running, kill it.
 */
gulp.task('server', function() {
    if (node) node.kill();
    node = spawn('node', ['index.js'], {stdio: 'inherit'});
    node.on('close', function (code) {
        if (code === 8) {
            gulp.log('Error detected, waiting for changes...');
        }
    });
});

/**
 * $ gulp
 * description: start the development environment
 */
gulp.task('default', function() {
    gulp.run('server');

    gulp.watch(['./index.js', './config//*.js','./app/**/*.js'], function() {
        gulp.run('server')
    });
    // Need to watch for sass changes too? Just add another watch call!
});

process.on('exit', function() {
    if (node) node.kill();
});
