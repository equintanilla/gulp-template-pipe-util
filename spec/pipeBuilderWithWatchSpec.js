var gulp = require('gulp');
var gulpPipeUtils = require('../');


var tap = require('gulp-tap');
var rename = require('gulp-rename');
var filter = require('gulp-filter');
var watch = require('gulp-watch');
var fs = require('fs');
var del = require('del');
var buffer = require('vinyl-buffer');

describe('builder', function () {
    it('watch interationc', function (done) {

        var dest = './generated';
        var srcFolder = './test/fixtures/';
        this.dummy2Path = srcFolder + 'dummy2.js';

        var srcGlob = srcFolder + '*';

        var srcFunctionFactory = function (src, ops) {
            return function () {
                return gulp.src(src, ops);
            }
        };

        var srcFunction = srcFunctionFactory(srcGlob, {read: true});

        var watchFunction = function () {
            return watch(srcGlob, {});
        };

        var filteringPipe = filter(function (file) {
            console.log('filter called');
            console.log('file event:' + file.event);
            return file.event === 'add' || file.event === 'unlink';
        });
        var filterFunction = function () {
            return filteringPipe;
        };

        var tapFunction = function () {
            return tap(function (file, t) {
                console.log('tap called');
                console.log(file.history);
                console.log(file.contents);
                console.log('instanceofBuffer:' + file.contents instanceof Buffer);
                file.contents = Buffer.concat(
                    [new Buffer('// TAPPED!!'),
                        file.contents]
                );
                console.log(file.contents.toString());
                return file;

            })
        };

        var renameFunction = function () {
            return rename(function (path) {
                console.log('rename called');
                console.log(path);
                path.basename = 'renamed';

            })
        };
        var destFunction = function () {
            return gulp.dest(dest);
        };

       var createPipesArray = function(srcGlob) {
           return  [
               gulpPipeUtils.createPipeStepObject('src', srcFunctionFactory(srcGlob, {read: true})),
               gulpPipeUtils.createPipeStepObject('tap', tapFunction),
               gulpPipeUtils.createPipeStepObject('rename', renameFunction),
               gulpPipeUtils.createPipeStepObject('dest', destFunction, {
                   'finish': function () {
                       console.log('dest finish triggered');
                       done();
                   }
               })


           ];

       };

        watch(srcGlob, {verbose: true, events: ['add', 'unlink']}, function (file) {


            console.log('watching');
            console.log(file.history);

            console.log(file.event);
            console.log(file.contents);
            if (file.event === 'add' || file.event === 'unlink') {

                gulpPipeUtils.pipeBuilder(createPipesArray(file.history));


            }


        });

        // we will write a file to see if the changes get picked up
        var dummy2Path = this.dummy2Path;
        setTimeout(function () {
            console.log('writing dummy2Path');
            fs.writeFileSync(dummy2Path, "// dummy 2 file");
        }, 100);

    });

    afterEach(function () {
        console.log("dummy2Path:" + this.dummy2Path);
        if (this.dummy2Path) {
            del.sync(this.dummy2Path);

        }
    })

});