var through = require('through2'),
    gutil = require('gulp-util'),
    File = gutil.File,
    path = require('path'),
    requirejs = require("requirejs"),
    diff = require('diff'),
    PluginError = gutil.PluginError;

// Consts
const PLUGIN_NAME = 'gulp-module-requirejs';

// Plugin level function (dealing with files)
function gulpModulesRequirejs(opts) {

    var currentPath = path.resolve(opts.dir), config, baseUrl, moduleFile, moduleName, stream, out;

    // Creating a stream through which each file will pass
        stream = through.obj(function (file, enc, callback) {
        var self = this;
        if (file.isNull()) {
            self.push(file); // Do nothing if no contents
            return callback();
        }

        if (file.isBuffer()) {

            baseUrl = currentPath + '/dev/';
            moduleFile = diff.diffChars(baseUrl, file.path)[1].value;
            moduleName = moduleFile.replace(/\.[^/.]+$/, "");


            requirejs.optimize(opts.r || {
                baseUrl: baseUrl,
                name: moduleName,
                out: function(output){
                    self.push(new File({
                        path: moduleFile,
                        contents: new Buffer(output)
                    }))
                },
                optimize : 'none'
            }, function (buildResponse) {
                console.log('module compiled: ' + currentPath + '/build/modules/' + moduleFile);
                return callback();
            });
        }

        if (file.isStream()) {
            this.emit('error', new PluginError(PLUGIN_NAME, 'Streams are not supported!'));
            return callback();
        }
    });

    // returning the file stream
    return stream;
};

// Exporting the plugin main function
module.exports = gulpModulesRequirejs;
