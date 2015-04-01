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

var calculateFinalListeners = function (listeners, defaultFactories, pipeName) {
    var errorFunction;
    var finishFunction;
    if (defaultFactories) {
        errorFunction = defaultFactories.errorFunctionFactory({pipeStep: pipeName});
        finishFunction = defaultFactories.onFinishFunctionFactory({pipeStep: pipeName});
    }


    var finalListeners = {
        error: [],
        finish: []
    };

    if (errorFunction) {
        finalListeners.error.push(errorFunction);
    }
    if (finishFunction) {
        finalListeners.finish.push(finishFunction);
    }


    for (var event in listeners) {
        var currentListeners = listeners[event];

        if (typeof currentListeners === 'function') {
            if (util.isArray(finalListeners[event])) {
                finalListeners[event].push(currentListeners);
            } else if (!finalListeners[event]) {
                finalListeners[event] = currentListeners;
            }
        }

        if (util.isArray(currentListeners)) {
            if (util.isArray(finalListeners[event])) {
                finalListeners[event] = finalListeners[event].concat(currentListeners);
            } else if (!finalListeners[event]) {
                finalListeners[event] = currentListeners;
            }
        }

    }
    console.log('final listeners');
    console.log(finalListeners);
    return finalListeners;
};

exports.pipeBuilder = function (pipesArray, skipDefaultListeners) {
    var defaultFactories;
    if (!skipDefaultListeners) {
        defaultFactories = exports.getDefaultFactories();
        defaultFactories.setStartTimeToNow();
    }

    var lazyPipesMap = {};
    for (var i = 0; i < pipesArray.length; i++) {
        var currentPipeInformation = pipesArray[i];
        var pipeName = currentPipeInformation.name;
        var pipeFunction = currentPipeInformation.func;
        if (typeof pipeName !== 'string') {
            throw Error('name should be string');
        }
        if (typeof pipeFunction !== 'function') {
            throw Error('func should be a function');
        }
        var pipeListeners = currentPipeInformation.listeners;

        lazyPipesMap[pipeName] = exports.lazyPipeFactory(pipeFunction, calculateFinalListeners(pipeListeners, defaultFactories, pipeName));
    }

    var executingPipe;
    for (var i = 0; i < pipesArray.length; i++) {
        var currentPipeName = pipesArray[i].name;
        var currentLazyPipe = lazyPipesMap[currentPipeName];
        if (i === 0) {
            executingPipe = currentLazyPipe();
        } else {
            executingPipe = executingPipe.pipe(currentLazyPipe());
        }
    }
    return executingPipe;

};

exports.createPipeStepObject = function (name, func, listeners) {
    return {
        name: name,
        func: func,
        listeners: listeners
    };
}
