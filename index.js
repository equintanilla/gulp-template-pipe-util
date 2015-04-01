var util = require('util');

var lazypipe = require('lazypipe');
var gutil = require('gulp-util');
var prettyTime = require('pretty-hrtime');


module.exports = {};
var exports = module.exports;

exports.getDefaultFactories = function () {
    var startTime;
    var factory = {};

    factory.errorFunctionFactory = function ErrorFunctionFactory(context) {
        return function (err) {
            gutil.log('Error from ', context.pipeStep, ': ', gutil.colors.red(err.message));
            this.emit('end');
        }

    };

    factory.onFinishFunctionFactory = function (context) {
        return function () {
            var taskTime = process.hrtime(startTime);
            var time = prettyTime(taskTime);
            gutil.log('finished stream', gutil.colors.blue(context.pipeStep) + '.', 'Time elapsed:', gutil.colors.magenta(time));

        };
    };

    factory.setStartTimeToNow = function () {
        startTime = process.hrtime();
    };
    return factory;

};

exports.lazyPipeFactory = function (func, eventListeners) {
    var addListener = function (pipe, event, listener) {
        return pipe.on(event, listener);
    };

    return function () {
        var pipe = lazypipe()
            .pipe(func)();
        for (var event in eventListeners) {
            var listenersForEvent = eventListeners[event];
            if (util.isArray(listenersForEvent)) {
                for (var i = 0; i < listenersForEvent.length; i++) {
                    var currentListener = listenersForEvent[i];
                    pipe = addListener(pipe, event, currentListener);
                }
            } else if (typeof listenersForEvent === 'function') {
                pipe = addListener(pipe, event, listenersForEvent);
            }
        }
        return pipe;

    }
};
