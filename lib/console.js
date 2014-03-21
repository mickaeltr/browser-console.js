(function () {
    "use strict";

    var console = window.console = window.console || {};

    console.checkDependencies = function () {
        if (!window.$ || !window.$.ajax || !window.$.each || !window.$.inArray || !window.$.isArray || !window.$.isFunction || !window.$.trim) {
            throw "Missing dependency: $ (jQuery or Zepto)";
        }
        return console;
    };

    console.readConfig = function (config) {
        var index, level;

        console.config = config || {};

        if (window.$.isArray(console.config.levels)) {
            for (index = console.config.levels.length - 1; index >= 0; --index) {
                level = window.$.trim(console.config.levels[index]);
                if (level) {
                    console.config.levels[index] = level;
                } else {
                    console.config.levels.splice(index, 1);
                }
            }
        }

        if (!window.$.isArray(console.config.levels) || !console.config.levels.length) {
            console.config.levels = ["info", "warn", "error"];
        }

        console.config.levelEnabledOnServer = window.$.trim(console.config.levelEnabledOnServer);
        if (window.$.inArray(console.config.levelEnabledOnServer, console.config.levels) < 0) {
            console.config.levelEnabledOnServer = console.config.levels[0];
        }

        console.config.levelForConsoleLog = window.$.trim(console.config.levelForConsoleLog);
        if (window.$.inArray(console.config.levelForConsoleLog, console.config.levels) < 0) {
            console.config.levelForConsoleLog = console.config.levels[0];
        }

        console.config.levelForJavaScriptErrors = window.$.trim(console.config.levelForJavaScriptErrors);
        if (window.$.inArray(console.config.levelForJavaScriptErrors, console.config.levels) < 0) {
            console.config.levelForJavaScriptErrors = console.config.levels[console.config.levels.length - 1];
        }

        console.config.serverUrl = window.$.trim(console.config.serverUrl);
        if (!console.config.serverUrl && window.$.isFunction(console.log)) {
            console.log("No server URL specified (serverUrl)");
        }

        console.config.disableJavaScriptErrorsLogging = window.$.trim(console.config.disableJavaScriptErrorsLogging) === "true";

        return console;
    };

    console.createOrOverrideLogFunctions = function () {

        console.original = console.original || {};
        if (!window.$.isFunction(console.original.log)) {
            console.original.log = window.$.isFunction(console.log) ? console.log : function () {
            };
        }

        window.$.each(console.config.levels, function (index, level) {

            var originalOrDefaultFunction;
            if (window.$.isFunction(console.original[level])) {
                originalOrDefaultFunction = console.original[level];
            } else if (window.$.isFunction(console[level])) {
                originalOrDefaultFunction = console.original[level] = console[level];
            } else {
                originalOrDefaultFunction = console.original.log;
            }

            console[level] = function () {
                var message, returns;
                try {
                    message = Array.prototype.slice.call(arguments).join(", ");
                    returns = originalOrDefaultFunction.call(console, message);
                    console.send(level, message);
                } catch (ignore) {
                    //
                }
                return returns;
            };

        });

        if (window.$.inArray("log", console.config.levels) < 0) {
            console.log = console[console.config.levelForConsoleLog];
        }

        return console;
    };

    console.handleJavaScriptErrorsLogging = function () {
        if (console.config.disableJavaScriptErrorsLogging) {
            if (window.$.isFunction(window.onerror) && window.onerror === console.onError) {
                window.onerror = null;
            }
            if (console.onError) {
                delete console.onError;
            }
        } else {
            if (window.$.isFunction(window.onerror) && window.onerror !== console.onError) {
                console.log("window.onerror will be overriden; you can prevent this by setting 'disableJavaScriptErrorsLogging' to true");
            }
            console.onError = window.onerror = function (message, fileName, lineNumber, columnNumber, error) {
                console.send(console.config.levelForJavaScriptErrors, "'" + message + "' " + fileName + ":" + lineNumber + ":" +
                    columnNumber + " " + error);
            };
        }
        return console;
    };

    console.send = function (level, message) {
        if (console.config.serverUrl && message &&
                window.$.inArray(level, console.config.levels) >= window.$.inArray(console.config.levelEnabledOnServer, console.config.levels)) {
            window.$.ajax({
                type: "POST",
                url: console.config.serverUrl,
                data: JSON.stringify({level: level, message: "[" + window.location.href + "] " + message}),
                contentType: "application/json",
                global: false
            });
        }
        return console;
    };

    console.init = function (config) {
        return console
            .restore()
            .checkDependencies()
            .readConfig(config)
            .createOrOverrideLogFunctions()
            .handleJavaScriptErrorsLogging();
    };

    console.restore = function () {

        console.readConfig({
            disableJavaScriptErrorsLogging: true,
            levels: [],
            serverUrl: "X"
        });

        console.original = console.original || {};

        console.handleJavaScriptErrorsLogging();

        window.$.each(console.config.levels, function (index, level) {
            delete console[level];
        });
        window.$.each(console.original, function (key, value) {
            console[key] = value;
        });
        delete console.original;

        delete console.config;

        return console;
    };

}());