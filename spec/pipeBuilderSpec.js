var gulp = require('gulp');
var gulpPipeUtils = require('../');

var tap = require('gulp-tap');
var rename = require('gulp-rename');
var filter = require('gulp-filter');
var watch = require('gulp-watch');
var fs = require('fs');
var del = require('del');

describe("pipe Builder", function () {

    it('should build task successfully', function (done) {

        var taskDescription = [
            {
                name: 'src', func: function () {
                return gulp.src('./test/fixtures/dummy');
            }, listeners: {
                finish: [function () {
                    console.log('first finish callback');
                },
                    function () {
                        console.log('second finish callback');
                    }]
            }
            },
            {
                name: 'dest', func: function () {
                return gulp.dest('./example');
            }, listeners: {
                finish: function () {
                    console.log('finish callback');
                    done();
                }
            }
            }

        ];

        gulpPipeUtils.pipeBuilder(taskDescription);


    });

    it('should build task successfully on skipping default listeners', function (done) {

        var taskDescription = [
            {
                name: 'src', func: function () {
                return gulp.src('./test/fixtures/dummy');
            }, listeners: {
                finish: [function () {
                    console.log('first finish callback');
                },
                    function () {
                        console.log('second finish callback');
                    }]
            }
            },
            {
                name: 'dest', func: function () {
                return gulp.dest('./example');
            }, listeners: {
                finish: function () {
                    console.log('finish callback');
                    done();
                }
            }
            }

        ];

        gulpPipeUtils.pipeBuilder(taskDescription, true);

    });
    it('should build task successfully on no listener', function (done) {

        var taskDescription = [
            {
                name: 'src', func: function () {
                return gulp.src('./test/fixtures/dummy');
            }
            },

            {
                name: 'dest', func: function () {
                return gulp.dest('./example');
            }
            }

        ];

        gulpPipeUtils.pipeBuilder(taskDescription, true)
            .on('finish', function () {
                console.log('about to be done with no listeners');
                done();
            });


    });

    it('should build task successfully', function (done) {

        var errorCallbacksCalled = 0;
        var expectedErrorsCallled = 2;
        var taskDescription = [
            {
                name: 'src', func: function () {
                return gulp.src('./test/fixtures/dummy');
            }, listeners: {
                error: [function () {
                    console.log('first error callback');
                    errorCallbacksCalled++;
                },
                    function () {
                        console.log('second error callback');
                        errorCallbacksCalled++;

                    }]
            }
            }

        ];

        var pipe = gulpPipeUtils.pipeBuilder(taskDescription)
            .on('error', function () {
                expect(errorCallbacksCalled).toBe(expectedErrorsCallled);
                done();
            });
        pipe.emit('error', new Error('something went wrong'));

    });

    it('should throw on lacking name', function () {


        var taskDescription = [
            {
                func: function () {
                    return gulp.src('./test/fixtures/dummy');
                }

            }

        ];

        expect(function () {
            gulpPipeUtils.pipeBuilder(taskDescription)
        }).toThrow();


    });
    it('should throw on lacking func', function () {


        var taskDescription = [
            {
                name: 'random name'

            }

        ];

        expect(function () {
            gulpPipeUtils.pipeBuilder(taskDescription)
        }).toThrow();


    });

    it('should build on multiple tasks', function (done) {


        var taskDescription = [
            {
                name: 'src', func: function () {
                return gulp.src('./test/fixtures/dummy');
            }
            },

            {
                name: 'dest', func: function () {
                return gulp.dest('./example');
            }
            },
            {
                name: 'dest2', func: function () {
                return gulp.dest('./example2');
            }
            }

        ];

        gulpPipeUtils.pipeBuilder(taskDescription)
            .on('finish', function () {
                console.log('about to be done with no listeners');
                done();
            });


    });


})
;