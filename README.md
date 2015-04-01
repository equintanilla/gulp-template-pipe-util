# gulp-template-pipe-util
Utility to facilitate adding the same event listeners to each pipe



##  Pipe Factory Usage

## var pipe = gulpPipeUtils.lazyPipeFactory(streamFunction, listeners);

```javascript
        var gulpPipeUtils = require('gulp-template-pipe-util');

        var onFinish = function () {
            console.log('finish');
            done()
        };
        var onError = function () {
            console.log('error');
        };
        var listeners = {
            'error': onError,
            'finish': onFinish
        };
        
        var srcFunction = function () {
           return gulp.src('./test/fixtures/dummy');
        }
        var srcPipe = gulpPipeUtils.lazyPipeFactory(srcFunction, listeners);
        
        var destFunction = function(){
            return gulp.dest('./output');
        }
        var destPipe =  gulpPipeUtils.lazyPipeFactory( destFunction, listeners);
                
        srcPipe()
        .pipe(destPipe);
        

```
Listeners is a map of with the keys as the event names and either an array of functions or a function as the value 
## Default Factories usage

```javascript
        var gulpPipeUtils = require('gulp-template-pipe-util');

        var defaultFactories = gulpPipeUtils.getDefaultFactories();
        
        defaultFactories.setStartTimeToNow();
        var myPipeStepErrorFunction = defaultFactories.errorFunctionFactory({pipeStep:'myPipeStep'});
        var myPipeStepFinishFunction = defaultFactories.onFinishFunctionFactory({pipeStep:'myPipeStep'});


```
Use these factories along with lazyPipeFactory!

