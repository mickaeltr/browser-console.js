module.exports = function (grunt) {
    "use strict";

    var source = "lib/console.js",
        tests = "tests/*.js",
        dependencies,
        dependency,
        config = {};

    // Clean

    config.clean = ["lib/*.js.map", "lib/*.min.js", ".grunt"];

    // Jasmine (tests)

    config.jasmine = {};

    dependencies = {
        jquery1: "http://ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.js",
        jquery2: "http://ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.js",
        zepto: "http://cdnjs.cloudflare.com/ajax/libs/zepto/1.1.3/zepto.js"
    };

    for (dependency in dependencies) {
        if (dependencies.hasOwnProperty(dependency)) {
            config.jasmine[dependency] = {
                options: {
                    outfile: ".grunt/_SpecRunner.html",
                    specs: "tests/*.js",
                    vendor: dependencies[dependency]
                },
                src: source
            };
        }
    }

    // Uglify (minification)

    config.uglify = {
        console: {
            files: {
                "lib/console.min.js": [source]
            },
            options: {
                sourceMap: true,
                sourceMapName: source + ".map"
            }
        }
    };

    // Watch

    config.watch = {
        jasmine: {
            files: [source, tests],
            tasks: "jasmine:zepto:build"
        }
    };

    grunt.initConfig(config);
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks("grunt-contrib-jasmine");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks('grunt-contrib-watch');
};