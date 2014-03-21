(function () {
    "use strict";

    var console = window.console = window.console || {};

    console.checkDependencies = function () {
        if (!window.$ || !window.$.ajax) {
            throw "Missing dependency: $ (jQuery or Zepto)";
        }
        return console;
    };

    console.readConfig = function (config) {
        var index, level;

        console.config = config || {};

        if (Array.isArray(console.config.levels)) {
            for (index = console.config.levels.length - 1; index >= 0; --index) {
                level = String.prototype.trim.call(console.config.levels[index] || "");
                if (level) {
                    console.config.levels[index] = level;
                } else {
                    console.config.levels.splice(index, 1);
                }
            }
        }

        if (!Array.isArray(console.config.levels) || !console.config.levels.length) {
            console.config.levels = ["info", "warn", "error"];
        }

        console.config.levelEnabledOnServer = String.prototype.trim.call(console.config.levelEnabledOnServer || "");
        if (console.config.levels.indexOf(console.config.levelEnabledOnServer) < 0) {
            console.config.levelEnabledOnServer = console.config.levels[0];
        }

        console.config.levelForConsoleLog = String.prototype.trim.call(console.config.levelForConsoleLog || "");
        if (console.config.levels.indexOf(console.config.levelForConsoleLog) < 0) {
            console.config.levelForConsoleLog = console.config.levels[0];
        }

        console.config.levelForJavaScriptErrors = String.prototype.trim.call(console.config.levelForJavaScriptErrors || "");
        if (console.config.levels.indexOf(console.config.levelForJavaScriptErrors) < 0) {
            console.config.levelForJavaScriptErrors = console.config.levels[console.config.levels.length - 1];
        }

        console.config.serverUrl = String.prototype.trim.call(console.config.serverUrl || "");
        if (!console.config.serverUrl && console.log) {
            console.log("No server URL specified (serverUrl)");
        }

        console.config.disableJavaScriptErrorsLogging = String.prototype.trim.call(console.config.disableJavaScriptErrorsLogging || "") === "true";

        return console;
    };

    console.createOrOverrideLogFunctions = function () {
        var index, level, originalOrDefaultFunction;

        console.original = console.original || {};
        if (!console.original.log) {
            console.original.log = console.log || function () {
            };
        }

        for (index = 0; index < console.config.levels.length; ++index) {
            level = console.config.levels[index];
            originalOrDefaultFunction = null;
            if (console.original[level]) {
                originalOrDefaultFunction = console.original[level];
            } else if (console[level]) {
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
        }

        if (console.config.levels.indexOf("log") < 0) {
            console.log = console[console.config.levelForConsoleLog];
        }

        return console;
    };

    console.handleJavaScriptErrorsLogging = function () {
        if (console.config.disableJavaScriptErrorsLogging) {
            if (window.onerror && window.onerror === console.onError) {
                window.onerror = null;
            }
            if (console.onError) {
                delete console.onError;
            }
        } else {
            if (window.onerror && window.onerror !== console.onError) {
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
                 console.config.levels.indexOf(level) >= console.config.levels.indexOf(console.config.levelEnabledOnServer)) {
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
        var index, functionName;

        console.readConfig({
            disableJavaScriptErrorsLogging: true,
            levels: [],
            serverUrl: "X"
        });

        console.original = console.original || {};

        console.handleJavaScriptErrorsLogging();

        for (index = 0; index < console.config.levels.length; ++index) {
            delete console[console.config.levels[index]];
        }
        for (functionName in console.original) {
            if (console.original.hasOwnProperty(functionName)) {
                console[functionName] = console.original[functionName];
            }
        }
        delete console.original;

        delete console.config;

        return console;
    };

}());