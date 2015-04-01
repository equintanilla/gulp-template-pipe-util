var gulp = require('gulp');
var gulpPipeUtils = require('../');
var gutil = require('gulp-util');

describe("pipe util", function () {

    it('should trigger finish Callback', function (done) {

        var listeners = {

            'finish': function () {
                console.log('finish called');
                expect(true);
                done();
            }

        };
        var lazyPipe = gulpPipeUtils.lazyPipeFactory(function () {
            return gulp.src('./test/fixtures/dummy')
        }, listeners);
        lazyPipe();
    });

    it('should trigger multiple finish callbacks', function (done) {
        var finishedFunctionFactory = function (expected) {
            var called = 0;
            return function () {

                called++;
                console.log('called ' + called + '/' + expected + ' times');
                if (called === expected) {
                    done();
                }
            }
        };
        var finishedFunction = finishedFunctionFactory(3);
        var listeners = {
            'error': [function (error) {
                console.log('error called');
            }],
            'finish': [finishedFunction, finishedFunction, finishedFunction]

        };
        var lazyPipe = gulpPipeUtils.lazyPipeFactory(function () {
            return gulp.src('./test/fixtures/dummy')
        }, listeners);
        lazyPipe();

    });

    it('should trigger multiple  callbacks in order', function (done) {
        var finishedFunctionFactory = function () {
            var spawned = 0;
            var called = 0;


            return function () {
                spawned++;
                var id = spawned;

                return function () {
                    called++;
                    console.log('called with id ' + id + ' called in position:' + called);

                    expect(called).toBe(id);
                    if (called === spawned) {
                        done();
                    }
                }
            };
        };

        var finishedFunction = finishedFunctionFactory(3);
        var listeners = {
            'error': [function (error) {
                console.log('error called');
            }],
            'finish': [finishedFunction(), finishedFunction(), finishedFunction()]

        };
        var lazyPipe = gulpPipeUtils.lazyPipeFactory(function () {
            return gulp.src('./test/fixtures/dummy')
        }, listeners);
        console.log('expect finish to trigger');
        lazyPipe();

    });

    it('error should trigger', function (done) {

        var listeners = {
            'error': function (error) {
                console.log(error);
                expect(error).toMatch(/something went wrong/);
                done();
            }

        };
        var lazyPipe = gulpPipeUtils.lazyPipeFactory(function () {
            return gulp.src('./test/fixtures/dummy')
        }, listeners);
        console.log('expect error to trigger');

        lazyPipe().emit('error', new Error('something went wrong'));


    });
    it('should work in mid pipe', function (done) {


        var listeners = {
            'finish': function () {

                done();
            }

        };

        var lazyPipe = gulpPipeUtils.lazyPipeFactory(function () {
            return gulp.src('./test/fixtures/dummy')
        }, listeners);
        gulp.src('./test/fixtures/dummy')
            .pipe(lazyPipe());
        console.log('expect finish to trigger');


    });

})




