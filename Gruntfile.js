module.exports = function (grunt) {
    "use strict";

    var source = "lib/console.js",
        tests = "tests/*.js",
        config = {};

    // Clean
    config.clean = ["lib/*.js.map", "lib/*.min.js", ".grunt", "npm-debug.log"];

    // Jasmine (tests)
    config.jasmine = {
        console: {
            options: {
                outfile: ".grunt/SpecRunner.html",
                specs: tests,
                vendor: [
                    "http://cdn.jsdelivr.net/stacktrace.js/0.6.0/stacktrace.js",
                    "http://localhost:35729/livereload.js"
                ]
            },
            src: source
        }
    };

    // Uglify (minification)
    config.uglify = {
        console: {
            files: {
                "lib/console.min.js": source
            },
            options: {
                sourceMap: true,
                sourceMapName: "lib/console.min.js.map"
            }
        }
    };

    // Watch
    config.watch = {
        jasmine: {
            files: [source, tests],
            tasks: ["jasmine"]
        },
        "jasmine-build": {
            files: [source, tests],
            options: {
                livereload: true
            }
        }
    };

    grunt.initConfig(config);
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-jasmine");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-watch");
};