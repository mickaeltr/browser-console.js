(function () {
    "use strict";

    var console = window.console = window.console || {};

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

        if (!console.config.logJavaScriptErrors && console.config.logJavaScriptErrors !== false) {
            console.config.logJavaScriptErrors = true;
        }
        console.config.logJavaScriptErrors = String.prototype.trim.call(console.config.logJavaScriptErrors) !== "false";

        return console;
    };

    console.addStackTrace = function (data, error) {
        var stackTrace;
        if (data) {
            if (error && error instanceof Error && window.printStackTrace) {
                try {
                    stackTrace = window.printStackTrace({e: error}).join("\n");
                } catch (ignored) {
                }
            }
            if (stackTrace) {
                data.stackTrace = stackTrace;
            } else if (typeof data.stackTrace !== "undefined") {
                delete data.stackTrace;
            }
        }
        return data;
    };

    console.createProxyConsoleFunction = function (level, originalOrDefaultFunction) {
        return function () {
            var argumentsArray, returns, data, index = 0;
            try {
                returns = originalOrDefaultFunction.apply(console, arguments);
                argumentsArray = Array.prototype.slice.call(arguments);
                data = {level: level, message: argumentsArray.join(", ")};
                while(!console.stackTrace && index < argumentsArray.length) {
                    console.addStackTrace(data, arguments[index]);
                    ++index;
                }
                console.send(data);
            } catch (ignore) {
                //
            }
            return returns;
        };
    };

    console.proxyConsoleFunctions = function () {
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
            console[level] = console.createProxyConsoleFunction(level, originalOrDefaultFunction);
        }

        if (console.config.levels.indexOf("log") < 0) {
            console.log = console[console.config.levelForConsoleLog];
        }

        return console;
    };

    console.handleJavaScriptErrorsLogging = function () {
        if (console.config.logJavaScriptErrors) {
            if (window.onerror && window.onerror !== console.onError) {
                console.log("window.onerror will be overriden; you can prevent this by setting 'logJavaScriptErrors' to false");
            }
            console.onError = window.onerror = function (message, fileName, lineNumber, columnNumber, error) {
                console.send(console.addStackTrace({
                    level: console.config.levelForJavaScriptErrors,
                    message: "[" + fileName + ":" + lineNumber + (columnNumber ? ":" + columnNumber : "") + "] " + message
                }, error));
            };
        } else {
            if (window.onerror && window.onerror === console.onError) {
                window.onerror = null;
            }
            if (console.onError) {
                delete console.onError;
            }
        }
        return console;
    };

    console.createHttp = function () {
        if (window.XMLHttpRequest) {
            return new window.XMLHttpRequest();
        }
        if (window.ActiveXObject) {
            var index,
                versions = ["MSXML2.XMLHttp.5.0", "MSXML2.XMLHttp.4.0", "MSXML2.XMLHttp.3.0", "MSXML2.XMLHttp", "Microsoft.XMLHttp"];
            for (index = 0; index < versions.length; ++index) {
                try {
                    return new window.ActiveXObject(versions[index]);
                } catch (ignored) {
                }
            }
        }
        return null;
    };

    console.send = function (data) {
        if (console.config.serverUrl && data &&
            console.config.levels.indexOf(data.level) >= console.config.levels.indexOf(console.config.levelEnabledOnServer)) {
            try {
                var http = console.createHttp();
                if (http) {
                    http.open("POST", console.config.serverUrl, true);
                    http.setRequestHeader("Content-Type", "application/json");
                    http.send(JSON.stringify(data));
                }
            } catch (ignored) {
            }
        }
        return console;
    };

    console.init = function (config) {
        return console
            .restore()
            .readConfig(config)
            .proxyConsoleFunctions()
            .handleJavaScriptErrorsLogging();
    };

    console.restore = function () {
        var index, functionName;

        console.readConfig({
            logJavaScriptErrors: false,
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