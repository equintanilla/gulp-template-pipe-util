var gulp = require('gulp');
var gulpPipeUtils = require('../');
var gutil = require('gulp-util');

describe("utils working in unison", function () {

    it('together should work', function (done) {

        var defaultFactories = gulpPipeUtils.getDefaultFactories();

        defaultFactories.setStartTimeToNow();
        var defaultErrorListener = defaultFactories.errorFunctionFactory({pipeStep: 'srcStep'});
        var defaultFinish = defaultFactories.onFinishFunctionFactory({pipeStep: 'srcStep'});
        var customFinish = function () {
            console.log('custom finish');
            done()
        };
        var customError = function () {
            console.log('custom error');
        };
        var errorListeners = [defaultErrorListener, customError];
        var finishListeners = [defaultFinish, customFinish];
        var listeners = {
            'error': errorListeners,
            'finish': finishListeners
        };
        var srcPipe = gulpPipeUtils.lazyPipeFactory(function () {
            return gulp.src('./test/fixtures/dummy');
        }, listeners);
        srcPipe();


    });
});
