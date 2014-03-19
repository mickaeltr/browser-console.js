module.exports = function (grunt) {
    "use strict";

    var source = "lib/console.js",
        dependencies,
        dependency,
        config = {};

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
                src: source,
                options: {
                    vendor: dependencies[dependency],
                    specs: "tests/**.js"
                }
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

    grunt.initConfig(config);
    grunt.loadNpmTasks("grunt-contrib-jasmine");
    grunt.loadNpmTasks("grunt-contrib-uglify");
};