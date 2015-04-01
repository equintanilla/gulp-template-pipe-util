var gulp = require('gulp');
var gulpPipeUtils = require('../');


describe('defaultFactories', function () {

    it('should throw when startTime is undefined', function () {
        var defaultFactories = gulpPipeUtils.getDefaultFactories();

        var finishFactory = defaultFactories.onFinishFunctionFactory({pipeStep: 'random step'});
        expect(finishFactory).toThrow();
    });

    it('should not throw when startTime is defined', function () {
        var defaultFactories = gulpPipeUtils.getDefaultFactories();
        defaultFactories.setStartTimeToNow();
        var finishFactory = defaultFactories.onFinishFunctionFactory({pipeStep: 'random step'});

        expect(finishFactory).not.toThrow();
    });

    it('error function from factory should be called', function () {
        var defaultFactories = gulpPipeUtils.getDefaultFactories();
        defaultFactories.setStartTimeToNow();
        var errorFactory = defaultFactories.errorFunctionFactory({pipeStep: 'random step'});
        var pipe = gulp.src('./test/fixtures/dummy');

        pipe.on('error', function (err) {
            console.log('error triggered');
        }).on('error', errorFactory)
            .on('end', function () {
                console.log('end triggered');
                expect(true).toBe(true);
            });
        pipe.emit('error', new Error('something went wrong'));
    });
});