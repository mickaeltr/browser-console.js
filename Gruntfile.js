module.exports = function (grunt) {
    "use strict";

    var source = "lib/console.js";

    grunt.initConfig({

        jasmine: {
            jquery: {
                src: source,
                options: {
                    vendor: ["http://ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js"],
                    specs: "tests/**.js"
                }
            },
            zepto: {
                src: source,
                options: {
                    vendor: ["http://cdnjs.cloudflare.com/ajax/libs/zepto/1.1.3/zepto.min.js"],
                    specs: "tests/**.js"
                }
            }
        },

        uglify: {
            console: {
                files: {
                    "lib/console.min.js": [source]
                },
                options: {
                    sourceMap: true,
                    sourceMapName: source + ".map"
                }
            }
        }

    });

    grunt.loadNpmTasks("grunt-contrib-jasmine");
    grunt.loadNpmTasks("grunt-contrib-uglify");
};